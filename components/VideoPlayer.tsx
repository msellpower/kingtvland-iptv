
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import mpegts from 'mpegts.js';
import { parseM3U } from '../services/m3uService';
import { StreamChannel } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface VideoPlayerProps {
    src: string;
    title: string;
    onClose: () => void;
}

enum ProxyType {
    CODETABS = 'codetabs',
}

type AspectRatio = 'contain' | 'cover' | 'fill';

const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2];

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, onClose }) => {
    const { t, isRTL } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const mpegtsRef = useRef<mpegts.Player | null>(null);
    
    // Playback States
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('contain');
    
    // Playlist States
    const [playlist, setPlaylist] = useState<StreamChannel[]>([]);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [currentStreamUrl, setCurrentStreamUrl] = useState(src);
    const [currentStreamTitle, setCurrentStreamTitle] = useState(title);
    const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);

    // Controls States
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    
    // Quality States
    const [qualities, setQualities] = useState<{height: number, level: number}[]>([]);
    const [currentQuality, setCurrentQuality] = useState(-1); // -1 is Auto

    // Strategy - FORCED TO CODETABS for maximum compatibility
    const [proxyStrategy] = useState<ProxyType>(ProxyType.CODETABS);
    const controlsTimeoutRef = useRef<number | null>(null);

    // Detect M3U Playlist on mount/src change
    useEffect(() => {
        const detectPlaylist = async () => {
            // Heuristic: Ends in .m3u (not m3u8) or has type=m3u param or gets playlist
            const lowerSrc = src.toLowerCase();
            const isM3U = (lowerSrc.endsWith('.m3u') || lowerSrc.includes('type=m3u') || lowerSrc.includes('get.php'));
            
            // Only try to parse as playlist if it looks like one AND isn't explicitly HLS/TS output
            const isStreamOutput = lowerSrc.includes('output=hls') || lowerSrc.includes('output=ts');

            if (isM3U && !isStreamOutput) {
                setIsPlaylistLoading(true);
                setIsLoading(false); 
                try {
                    // Force CodeTabs for playlist fetch to avoid CORS on text fetch
                    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(src)}`;
                    const response = await fetch(proxyUrl);

                    if (response && response.ok) {
                        const text = await response.text();
                        if (text.includes('#EXTM3U')) {
                            const channels = parseM3U(text);
                            if (channels.length > 0) {
                                setPlaylist(channels);
                                setShowPlaylist(true);
                                setCurrentStreamUrl(''); // Don't play initial src if it's a playlist
                                setInputSearch('');
                            } else {
                                // Parsed but empty or invalid, treat as stream
                                setCurrentStreamUrl(src);
                            }
                        } else {
                            // Not a playlist text, assume direct stream
                            setCurrentStreamUrl(src);
                        }
                    } else {
                        setCurrentStreamUrl(src);
                    }
                } catch (e) {
                    console.warn("Failed to parse M3U playlist, playing directly:", e);
                    setCurrentStreamUrl(src);
                } finally {
                    setIsPlaylistLoading(false);
                }
            } else {
                setCurrentStreamUrl(src);
                setPlaylist([]);
            }
        };

        detectPlaylist();
    }, [src]);

    // Clean up function
    const destroyPlayers = () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        if (mpegtsRef.current) {
            mpegtsRef.current.destroy();
            mpegtsRef.current = null;
        }
    };

    // Construct URL with optimizations - STRICT CODETABS
    const getOptimizedUrl = () => {
        if (!currentStreamUrl) return '';
        let finalUrl = currentStreamUrl;

        // IPTV TRICK: Swap MKV/AVI to MP4 for compatibility if it's a VOD file
        if (finalUrl.includes('.mkv')) {
            finalUrl = finalUrl.replace('.mkv', '.mp4');
        } else if (finalUrl.includes('.avi')) {
            finalUrl = finalUrl.replace('.avi', '.mp4');
        }

        // Always apply CodeTabs proxy if not already present
        // This handles CORS for HLS fragments and TS streams
        if (!finalUrl.includes('codetabs.com')) {
            return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(finalUrl)}`;
        }

        return finalUrl;
    };

    const handlePlayerError = (err: any) => {
        console.error("Player Error (Strict Mode):", err);
        setIsLoading(false);
        // User friendly error message
        setError("שגיאה בטעינת השידור. ייתכן שהמקור אינו זמין כרגע או נחסם.");
    };

    // Initialize Player
    useEffect(() => {
        if (!currentStreamUrl) return; 

        const currentSrc = getOptimizedUrl();
        
        // Robust detection logic based on original URL
        const originalUrl = currentStreamUrl.toLowerCase();
        
        // HLS Detection
        const isM3U8 = originalUrl.includes('.m3u8') || originalUrl.includes('output=hls') || originalUrl.includes('type=m3u8');
        
        // Native Video Extensions (Browsers might play these natively)
        const isNativeCompatible = originalUrl.includes('.mp4') || originalUrl.includes('.webm') || originalUrl.includes('.ogg') || originalUrl.includes('.mov');
        
        // MPEG-TS or MKV/AVI (Try mpegts.js for these if native fails or for better stream handling)
        const isTS = originalUrl.includes('.ts') || originalUrl.includes('output=ts') || originalUrl.includes('type=ts');
        const isMKV = originalUrl.includes('.mkv') || originalUrl.includes('.avi');
        
        // Final Decision logic
        const useMpegTs = (isTS || isMKV || (!isM3U8 && !isNativeCompatible)) && mpegts.getFeatureList().mseLivePlayback;
        
        console.log(`Player initializing: Type=${isM3U8 ? 'HLS' : (useMpegTs ? 'MPEG-TS/MSE' : 'Native')} | Proxy=${proxyStrategy} | Src=${currentSrc}`);

        // Reset
        destroyPlayers();
        setIsLoading(true);
        setError(null);

        // 1. Try HLS.js
        if (isM3U8 && Hls.isSupported()) {
            const hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: false, // Stability over latency
                backBufferLength: 90,
                maxBufferLength: 60, // Increased buffer for proxy stability
                maxMaxBufferLength: 600,
                // CodeTabs handles CORS, but sometimes we need to be explicit about not sending creds
                xhrSetup: function(xhr, url) {
                    xhr.withCredentials = false; 
                }
            });

            hlsRef.current = hls;

            if (videoRef.current) {
                hls.loadSource(currentSrc);
                hls.attachMedia(videoRef.current);
            }

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                setIsLoading(false);
                // Extract Qualities
                const levels = data.levels.map((l, index) => ({
                    height: l.height,
                    level: index
                }));
                // Sort and deduplicate
                levels.sort((a, b) => b.height - a.height);
                const uniqueLevels = levels.filter((v, i, a) => a.findIndex(t => t.height === v.height) === i);
                setQualities(uniqueLevels);
                
                videoRef.current?.play().catch(e => {
                    console.warn("Autoplay blocked", e);
                    setIsPlaying(false);
                });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn("HLS Network Error, attempting recover...");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.warn("HLS Media Error, attempting recover...");
                            hls.recoverMediaError();
                            break;
                        default:
                            destroyPlayers();
                            handlePlayerError("Fatal HLS Error");
                            break;
                    }
                }
            });
        } 
        // 2. Try MPEGTS.js (for .ts streams, .mkv, .avi or unknown extensions that aren't native)
        else if (useMpegTs) {
             console.log("Using MPEGTS.js for stream/file");
             const player = mpegts.createPlayer({
                type: isMKV ? 'flv' : 'mpegts', // mpegts.js often plays mkv/avi better as flv type or auto-detect
                url: currentSrc,
                isLive: !isMKV, // VOD if it's mkv/avi
                cors: true,
             }, {
                enableStashBuffer: true, // Better stability for unstable IPTV
                stashInitialSize: 128,
                liveBufferLatencyChasing: false, // Don't chase latency too aggressively on proxy
             });
             
             mpegtsRef.current = player;
             if (videoRef.current) {
                 player.attachMediaElement(videoRef.current);
                 player.load();
                 
                 const playPromise = player.play() as Promise<void> | undefined;
                 if (playPromise !== undefined) {
                     playPromise.then(() => {
                         setIsLoading(false);
                         setIsPlaying(true);
                     }).catch(e => {
                         // Autoplay failed or load error
                         setIsLoading(false);
                         setIsPlaying(false);
                     });
                 } else {
                     setIsLoading(false);
                     setIsPlaying(true);
                 }
                 
                 player.on(mpegts.Events.ERROR, (type, details) => {
                     // MPEGTS errors can be noisy, only fatal if we can't recover
                     if (type === mpegts.ErrorTypes.NETWORK_ERROR) {
                         console.warn("MPEGTS Network Error", details);
                         // Optional: retry logic here
                     } else {
                         console.error("MPEGTS Error", type, details);
                     }
                 });
             }
        }
        // 3. Native Player (MP4/Direct via Proxy)
        else {
             console.log("Using Native Player (MP4/Direct)");
             if (videoRef.current) {
                 videoRef.current.src = currentSrc;
                 videoRef.current.load();
                 
                 const onLoaded = () => {
                     setIsLoading(false);
                     videoRef.current?.play().catch(e => console.error("Native Play Error", e));
                 };

                 const onError = (e: any) => {
                     handlePlayerError("Browser could not play format.");
                 };

                 videoRef.current.addEventListener('loadeddata', onLoaded, { once: true });
                 videoRef.current.addEventListener('error', onError, { once: true });
             }
        }

        return () => {
            destroyPlayers();
        };
    }, [currentStreamUrl]);

    // Auto-hide controls logic
    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = window.setTimeout(() => {
                setShowControls(false);
                setShowSettings(false); 
            }, 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const skip = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
    };

    const togglePip = async () => {
        if (!document.pictureInPictureElement && videoRef.current) {
            try {
                await videoRef.current.requestPictureInPicture();
            } catch (e) { console.error("PiP failed", e); }
        } else if (document.exitPictureInPicture) {
            document.exitPictureInPicture();
        }
    };

    const toggleAspectRatio = () => {
        const ratios: AspectRatio[] = ['contain', 'cover', 'fill'];
        const next = ratios[(ratios.indexOf(aspectRatio) + 1) % ratios.length];
        setAspectRatio(next);
    };

    const reloadStream = () => {
        const url = currentStreamUrl;
        setCurrentStreamUrl('');
        setIsLoading(true);
        setError(null);
        setTimeout(() => setCurrentStreamUrl(url), 100);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
        }
        setIsMuted(val === 0);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            videoRef.current.muted = newMuted;
            setIsMuted(newMuted);
            if (!newMuted && volume === 0) {
                setVolume(1);
                videoRef.current.volume = 1;
            }
        }
    };

    const changeSpeed = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
        }
    };

    const changeQuality = (levelIndex: number) => {
        setCurrentQuality(levelIndex);
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex;
        }
        setShowSettings(false);
    };

    const copyVlcLink = () => {
        // Strip proxy for VLC link copying, user needs original URL
        const original = currentStreamUrl.replace('https://api.codetabs.com/v1/proxy?quest=', '');
        navigator.clipboard.writeText(decodeURIComponent(original));
        alert(t('video.linkCopied'));
    };

    // Playlist Search
    const [inputSearch, setInputSearch] = useState('');
    const filteredPlaylist = playlist.filter(ch => ch.name.toLowerCase().includes(inputSearch.toLowerCase()));

    const handleChannelSelect = (channel: StreamChannel) => {
        setCurrentStreamUrl(channel.url);
        setCurrentStreamTitle(channel.name);
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in group">
            {/* Main Video Element */}
            {currentStreamUrl && (
                <video 
                    ref={videoRef}
                    className={`w-full h-full cursor-pointer transition-all duration-300 ${aspectRatio === 'cover' ? 'object-cover' : aspectRatio === 'fill' ? 'object-fill' : 'object-contain'}`}
                    onClick={togglePlay}
                    playsInline
                    autoPlay
                    // Removed crossOrigin="anonymous" as CodeTabs proxy returns * but sometimes opaque is safer for non-HLS
                />
            )}

            {/* Playlist Sidebar/Overlay */}
            {showPlaylist && (
                <div className={`absolute top-0 right-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 transition-transform transform ${showPlaylist ? 'translate-x-0' : 'translate-x-full'} z-50 flex flex-col`}>
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-white font-bold">{t('video.channelList')} ({playlist.length})</h3>
                        <button onClick={() => setShowPlaylist(false)} className="text-gray-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="p-2">
                        <input 
                            type="text" 
                            placeholder={t('video.searchChannel')} 
                            value={inputSearch}
                            onChange={(e) => setInputSearch(e.target.value)}
                            className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
                        {filteredPlaylist.map((ch, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => handleChannelSelect(ch)}
                                className={`w-full text-right px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${currentStreamUrl === ch.url ? 'bg-cyan-600 text-white font-bold' : 'text-gray-300 hover:bg-white/10'}`}
                            >
                                {ch.logo ? (
                                    <img src={ch.logo} alt="" className="w-6 h-6 rounded-full object-cover bg-white/10" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                ) : (
                                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">📺</span>
                                )}
                                <span className="truncate">{ch.name}</span>
                            </button>
                        ))}
                        {filteredPlaylist.length === 0 && <p className="text-gray-500 text-center text-xs mt-4">{t('video.noChannels')}</p>}
                    </div>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-50 animate-fade-in p-6 text-center">
                    <svg className="w-20 h-20 text-red-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-2xl font-bold mb-2">{t('video.playbackError')}</p>
                    <p className="text-gray-400 mb-8 max-w-md">{error}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <button onClick={reloadStream} className="flex-1 bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 font-bold transition-all">
                            {t('video.tryAgain')}
                        </button>
                        <button onClick={copyVlcLink} className="flex-1 bg-orange-600 px-6 py-3 rounded-xl hover:bg-orange-700 font-bold transition-all flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            {t('video.copyToVlc')}
                        </button>
                        <button onClick={onClose} className="flex-1 bg-white/10 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/20 font-bold transition-all">
                            {t('video.close')}
                        </button>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {(isLoading || isPlaylistLoading) && !error && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-40 pointer-events-none">
                     <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-cyan-500/50"></div>
                     <p className="text-cyan-400 font-bold tracking-wider animate-pulse">
                        {isPlaylistLoading ? t('video.loadingPlaylist') : t('video.loadingStream')}
                     </p>
                </div>
            )}

            {/* Initial Placeholder if M3U Loaded but no channel selected */}
            {!currentStreamUrl && !isPlaylistLoading && playlist.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-40">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{t('video.playlistLoaded')}</h2>
                    <p className="text-gray-400">{t('video.selectChannel')}</p>
                    <button onClick={() => setShowPlaylist(true)} className="mt-6 bg-cyan-600 px-8 py-3 rounded-full font-bold hover:bg-cyan-700 transition-colors md:hidden">
                        {t('video.openPlaylist')}
                    </button>
                </div>
            )}

            {/* Controls UI */}
            <div className={`absolute inset-0 flex flex-col justify-between transition-all duration-500 pointer-events-none ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                
                {/* Header */}
                <div className="p-6 pointer-events-auto">
                    <div className="glass-card rounded-2xl p-4 flex justify-between items-center shadow-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-all transform hover:scale-110">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <div>
                                <h2 className="text-white text-lg font-bold drop-shadow-md truncate max-w-md">{currentStreamTitle}</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="relative flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                    </span>
                                    <span className="text-gray-300 text-[10px] uppercase font-mono tracking-wide font-bold">LIVE</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Playlist Toggle Button */}
                        {playlist.length > 0 && (
                            <button 
                                onClick={() => setShowPlaylist(!showPlaylist)}
                                className={`p-2 rounded-lg transition-all ${showPlaylist ? 'bg-cyan-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                                title={t('video.channelList')}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="p-6 pointer-events-auto">
                    <div className="glass-card rounded-2xl p-4 shadow-2xl backdrop-blur-xl border border-white/10">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            
                            {/* Left Controls: Play, Skip, Volume */}
                            <div className="flex items-center gap-4 sm:gap-6">
                                {/* Play/Pause */}
                                <button onClick={togglePlay} className="text-white hover:text-cyan-400 transition-all transform hover:scale-110 active:scale-95">
                                    {isPlaying ? (
                                        <svg className="w-10 h-10 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                    ) : (
                                        <svg className="w-10 h-10 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    )}
                                </button>

                                {/* Skip Buttons */}
                                <button onClick={() => skip(-10)} className="text-gray-300 hover:text-white transition-colors" title="-10s">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
                                </button>
                                <button onClick={() => skip(10)} className="text-gray-300 hover:text-white transition-colors" title="+10s">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
                                </button>

                                {/* Volume */}
                                <div className="hidden sm:flex items-center gap-3 group/volume">
                                    <button onClick={toggleMute} className="text-gray-300 hover:text-white transition-colors">
                                        {isMuted || volume === 0 ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                        )}
                                    </button>
                                    <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-in-out">
                                        <input 
                                            type="range" 
                                            min="0" max="1" step="0.1" 
                                            value={isMuted ? 0 : volume} 
                                            onChange={handleVolumeChange}
                                            className="w-24 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Controls: Reload, Aspect, PiP, Settings */}
                            <div className="flex items-center gap-3 sm:gap-4 relative">
                                
                                <button onClick={reloadStream} className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10" title={t('video.refreshStream')}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </button>

                                <button onClick={toggleAspectRatio} className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10" title={t('video.aspectRatio')}>
                                    {aspectRatio === 'contain' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>}
                                    {aspectRatio === 'cover' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>}
                                    {aspectRatio === 'fill' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
                                </button>

                                <button onClick={togglePip} className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 hidden sm:block" title={t('video.pip')}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </button>

                                <button 
                                    onClick={() => setShowSettings(!showSettings)} 
                                    className={`p-2 rounded-full transition-all duration-300 ${showSettings ? 'bg-white/20 text-cyan-400 rotate-90 shadow-inner' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                                >
                                    <svg className="w-8 h-8 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </button>

                                {/* Settings Popup */}
                                {showSettings && (
                                    <div className="absolute bottom-16 left-0 w-72 glass-card rounded-2xl overflow-hidden animate-fade-in-up border border-white/10 shadow-2xl z-20">
                                        <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
                                            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                                {t('video.playerSettings')}
                                            </h3>
                                        </div>
                                        
                                        <div className="p-4 space-y-5 bg-black/40">
                                            {/* Speed Control */}
                                            <div>
                                                <p className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">{t('video.playbackSpeed')}</p>
                                                <div className="flex justify-between bg-black/40 rounded-xl p-1.5 border border-white/5 shadow-inner">
                                                    {PLAYBACK_SPEEDS.map(s => (
                                                        <button 
                                                            key={s}
                                                            onClick={() => changeSpeed(s)}
                                                            className={`flex-1 py-1.5 text-xs rounded-lg transition-all font-medium ${playbackSpeed === s ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                        >
                                                            {s}x
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Quality Control */}
                                            {qualities.length > 0 && (
                                                <div>
                                                    <p className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">{t('video.videoQuality')}</p>
                                                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                                                        <button 
                                                            onClick={() => changeQuality(-1)}
                                                            className={`text-xs px-2 py-2 rounded-lg border text-center transition-all font-medium ${currentQuality === -1 ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5'}`}
                                                        >
                                                            Auto
                                                        </button>
                                                        {qualities.map((q) => (
                                                            <button 
                                                                key={q.level}
                                                                onClick={() => changeQuality(q.level)}
                                                                className={`text-xs px-2 py-2 rounded-lg border text-center transition-all font-medium ${currentQuality === q.level ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5'}`}
                                                            >
                                                                {q.height}p
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
