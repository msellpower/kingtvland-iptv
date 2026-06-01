
import React, { useState, useEffect } from 'react';
import { FULL_GUIDES_DATA } from '../constants';
import PromoBanner from './PromoBanner';
import { useLanguage } from '../i18n/LanguageContext';
import { getPublicSettings } from '../services/dataService';
import { SystemSettings } from '../utils/timeLogic';
import { useQuery } from '@tanstack/react-query';

interface AppsGuideProps {
    onNavigate: (view: any, anchor?: string) => void;
    anchor?: string | null;
}

const AppsGuide: React.FC<AppsGuideProps> = ({ onNavigate, anchor }) => {
  const { t, language, isRTL } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(FULL_GUIDES_DATA[0].id);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: getPublicSettings,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    if (anchor) {
      // Find which category this app belongs to
      const category = FULL_GUIDES_DATA.find(cat => 
        cat.apps.some(app => app.id === anchor)
      );
      if (category) {
        setActiveCategory(category.id);
        // Wait for render then scroll
        setTimeout(() => {
          const element = document.getElementById(anchor);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Add a temporary highlight effect
            element.classList.add('ring-2', 'ring-cyan-500', 'ring-offset-4', 'ring-offset-[#0f0c29]');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-cyan-500', 'ring-offset-4', 'ring-offset-[#0f0c29]');
            }, 3000);
          }
        }, 100);
      }
    }
  }, [anchor]);

  const currentCategory = FULL_GUIDES_DATA.find(c => c.id === activeCategory) || FULL_GUIDES_DATA[0];

  const handleDownload = (url: string) => {
    // Check if it's a numeric code (Downloader Code) or a URL
    const isCode = /^\d+$/.test(url);
    
    if (isCode) {
        navigator.clipboard.writeText(url);
        setCopiedCode(url);
        setTimeout(() => setCopiedCode(null), 2000);
    } else {
        window.open(url, '_blank');
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen space-gradient">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            {t('guides.title').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">{t('guides.title').split(' ').slice(1).join(' ')}</span> 🚀
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            {t('guides.subtitle')}
          </p>
        </div>

        {/* Video Player Section */}
        {settings?.youtubeVideoUrl && (
            <div className="max-w-4xl mx-auto mb-16 animate-fade-in">
                <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                    <iframe
                        className="w-full h-full"
                        src={settings.youtubeVideoUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
            {FULL_GUIDES_DATA.map((category) => (
                <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-bold transition-all transform hover:-translate-y-1 duration-300 ${
                        activeCategory === category.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/40 ring-1 ring-white/20'
                        : 'bg-white/5 backdrop-blur-sm border border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    {/* Icons */}
                    {category.id === 'streamer' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    {category.id === 'smarttv' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    {category.id === 'pc' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    {category.id === 'mobile' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                    <span>{t(`guides.category.${category.id}` as any)}</span>
                </button>
            ))}
        </div>

        {/* Apps Grid */}
        <div className="mb-20 animate-fade-in w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
                {currentCategory.apps.map((app: any) => {
                    return (
                        <div key={app.id} id={app.id} className="glass-card rounded-3xl overflow-hidden flex flex-col group transition-all duration-500 scroll-mt-[148px] md:scroll-mt-[180px]">
                    <div className="bg-white/5 p-6 border-b border-white/5 flex justify-between items-start backdrop-blur-sm">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                             <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{app.name}</h3>
                             {settings?.appVideoUrls?.[app.id] && (
                                <button onClick={() => setActiveVideo(settings.appVideoUrls![app.id])} className="text-cyan-400 hover:text-white p-2">
                                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                             )}
                           </div>
                           <p className="text-gray-400 text-sm leading-relaxed">{t(`guides.app.${app.id}.desc` as any) || app.description}</p>
                        </div>
                        <div className="bg-indigo-500/20 text-indigo-300 text-sm font-bold px-3 py-1.5 rounded-lg border border-indigo-500/30 shadow-sm">
                            ⭐ {app.rating}
                        </div>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                        {/* Download Buttons Section */}
                        <div className="space-y-6 mb-8">
                            
                            {/* 1. Official Stores (Primary) */}
                            {(app.googlePlayUrl || app.appStoreUrl || app.officialWebsiteUrl) && (
                                <div className="space-y-4">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <span className="w-1 h-3 bg-cyan-500 rounded-full"></span>
                                        {t('guides.officialStore')}
                                    </h5>
                                    
                                    {app.googlePlayUrl && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5 font-medium pr-1">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                {app.googlePlayUrl.endsWith('.apk') ? t('guides.directDownload') + ':' : t(`guides.installAndroid` as any)}
                                            </p>
                                            <button 
                                                onClick={() => window.open(app.googlePlayUrl, '_blank')}
                                                className="w-full py-3.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all group/btn hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                            >
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-7" referrerPolicy="no-referrer" loading="lazy" />
                                                <span className="text-sm font-bold text-white group-hover/btn:text-green-400 transition-colors">
                                                    {app.googlePlayUrl.endsWith('.apk') ? t('guides.directDownload') : t('guides.googlePlay')}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                    
                                    {app.appStoreUrl && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5 font-medium pr-1">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                                {t(`guides.installApple` as any)}
                                            </p>
                                            <button 
                                                onClick={() => window.open(app.appStoreUrl, '_blank')}
                                                className="w-full py-3.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all group/btn hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                            >
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-7" referrerPolicy="no-referrer" loading="lazy" />
                                                <span className="text-sm font-bold text-white group-hover/btn:text-blue-400 transition-colors">{t('guides.appStore')}</span>
                                            </button>
                                        </div>
                                    )}
                                    
                                    {app.officialWebsiteUrl && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5 font-medium pr-1">
                                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                                                {t(`guides.officialSitePage` as any)}
                                            </p>
                                            <button 
                                                onClick={() => window.open(app.officialWebsiteUrl, '_blank')}
                                                className="w-full py-3.5 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-800/60 hover:to-indigo-800/60 border border-purple-500/20 rounded-2xl flex items-center justify-center gap-3 transition-all group/btn hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                                            >
                                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                                <span className="text-sm font-bold text-white group-hover/btn:text-purple-300 transition-colors">{t('guides.officialSite')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Divider */}
                            {app.downloadUrl && (app.googlePlayUrl || app.appStoreUrl || app.officialWebsiteUrl) && (
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-slate-900 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('guides.or')}</span>
                                    </div>
                                </div>
                            )}

                            {/* 2. Alternative Installation (Downloader/Direct) */}
                            {app.downloadUrl && (
                                <div className="space-y-4">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <span className="w-1 h-3 bg-yellow-500 rounded-full"></span>
                                        {t('guides.altInstall')}
                                    </h5>
                                    
                                    <button 
                                        onClick={() => handleDownload(app.downloadUrl!)}
                                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 text-lg ${
                                            copiedCode === app.downloadUrl 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-white/10'
                                        }`}
                                    >
                                        {/^\d+$/.test(app.downloadUrl) ? (
                                            <>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                {copiedCode === app.downloadUrl ? t('guides.codeCopied') : `${t('guides.copyCode')}: ${app.downloadUrl}`}
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                {t('guides.directDownload')}
                                            </>
                                        )}
                                    </button>
                                    
                                    {/^\d+$/.test(app.downloadUrl) && (
                                        <p className="text-xs text-gray-500 text-center mt-3 font-medium bg-black/20 py-2 rounded-lg border border-white/5">
                                            {t('guides.downloaderTip')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <h4 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-2">
                            <span className="bg-cyan-500/20 text-cyan-400 p-1.5 rounded-lg">🛠️</span> {t('guides.steps')}:
                        </h4>
                        <ol className="relative border-r-2 border-white/10 mr-3 space-y-8 mb-6">
                            {app.steps.map((step: string, idx: number) => (
                                <li key={idx} className="mr-8 relative">
                                    <span className="absolute -right-[41px] flex items-center justify-center w-8 h-8 bg-slate-800 rounded-full border-2 border-indigo-500 text-sm font-bold text-white shadow-lg z-10">
                                        {idx + 1}
                                    </span>
                                    <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">{step}</p>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-auto space-y-3">
                            {app.tip && (
                                <div className="flex gap-4 bg-green-900/10 p-4 rounded-xl border border-green-500/20 backdrop-blur-sm">
                                    <span className="text-2xl">💡</span>
                                    <div>
                                        <span className="text-green-400 font-bold text-xs block mb-1 uppercase tracking-wider">{t('guides.tip')}</span>
                                        <p className="text-green-100 text-sm">{app.tip}</p>
                                    </div>
                                </div>
                            )}
                            {app.troubleshoot && (
                                <div className="flex gap-4 bg-red-900/10 p-4 rounded-xl border border-red-500/20 backdrop-blur-sm">
                                    <span className="text-2xl">🔧</span>
                                    <div>
                                        <span className="text-red-400 font-bold text-xs block mb-1 uppercase tracking-wider">{t('guides.troubleshoot')}</span>
                                        <p className="text-red-100 text-sm">{app.troubleshoot}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                    );
                })}
            </div>
        </div>

        {/* Video Player Modal */}
        {activeVideo && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={() => setActiveVideo(null)}>
                <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden glass-panel" onClick={e => e.stopPropagation()}>
                    <button className="absolute top-4 right-4 z-10 bg-white/10 rounded-full p-2 hover:bg-white/20" onClick={() => setActiveVideo(null)}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <iframe
                        className="w-full h-full"
                        src={activeVideo}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        )}

        {/* Promo Banner Injection */}
        <div className="mb-20">
            <PromoBanner onNavigate={onNavigate} />
        </div>

        {/* Comparison Tables Section */}
        <div className="mt-16">
            <h2 className="text-3xl font-bold text-white text-center mb-10">{t('guides.comparison')}</h2>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* General Comparison Table */}
                <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="p-5 bg-white/5 border-b border-white/10">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                             <span className="w-2 h-6 bg-cyan-500 rounded-full"></span> {t('guides.overview')}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className={`w-full text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                            <thead className="bg-black/20 text-gray-400">
                                <tr>
                                    <th className="p-4">{t('guides.app')}</th>
                                    <th className="p-4">{t('guides.category')}</th>
                                    <th className="p-4">{t('guides.rating')}</th>
                                    <th className="p-4">{t('guides.cost')}</th>
                                    <th className="p-4">{t('guides.mainFeature')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300 divide-y divide-white/5">
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">TiviMate</td>
                                    <td className="p-4">{t('guides.streamer')}</td>
                                    <td className="p-4">4.8</td>
                                    <td className="p-4 text-yellow-400">{t('guides.premium')}</td>
                                    <td className="p-4">{t('guides.advancedEPG')}</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">IPTV Smarters</td>
                                    <td className="p-4">{t('guides.streamer')}/{t('guides.mobile')}</td>
                                    <td className="p-4">4.5</td>
                                    <td className="p-4 text-yellow-400">{t('guides.premium')}</td>
                                    <td className="p-4">Xtream Codes</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">SSIPTV</td>
                                    <td className="p-4">{t('guides.tv')}</td>
                                    <td className="p-4">4.0</td>
                                    <td className="p-4 text-green-400">{t('guides.free')}</td>
                                    <td className="p-4">{t('guides.simpleUpload')}</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">SmartOne</td>
                                    <td className="p-4">{t('guides.tv')}</td>
                                    <td className="p-4">4.6</td>
                                    <td className="p-4 text-yellow-400">{t('guides.paid')}</td>
                                    <td className="p-4">{t('guides.builtInRadio')}</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">VLC</td>
                                    <td className="p-4">{t('guides.pc')}</td>
                                    <td className="p-4">4.7</td>
                                    <td className="p-4 text-green-400">{t('guides.free')}</td>
                                    <td className="p-4">{t('guides.multiFormat')}</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">GSE Smart</td>
                                    <td className="p-4">{t('guides.mobile')}</td>
                                    <td className="p-4">4.4</td>
                                    <td className="p-4 text-green-400">{t('guides.free')}</td>
                                    <td className="p-4">Chromecast</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Features Comparison Table */}
                <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="p-5 bg-white/5 border-b border-white/10">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                             <span className="w-2 h-6 bg-purple-500 rounded-full"></span> {t('guides.technical')}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className={`w-full text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                            <thead className="bg-black/20 text-gray-400">
                                <tr>
                                    <th className="p-4">{t('guides.app')}</th>
                                    <th className="p-4 text-center">EPG</th>
                                    <th className="p-4 text-center">4K</th>
                                    <th className="p-4 text-center">Catch-up</th>
                                    <th className="p-4">{t('guides.no')}</th>
                                    <th className="p-4">{t('guides.cost')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300 divide-y divide-white/5">
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">TiviMate</td>
                                    <td className="p-4 text-center text-green-400">✔</td>
                                    <td className="p-4 text-center text-green-400">✔</td>
                                    <td className="p-4 text-center text-green-400">✔</td>
                                    <td className="p-4 text-green-400">{t('guides.no')}</td>
                                    <td className="p-4">30$ (Life)</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">IPTV Smarters</td>
                                    <td className="p-4 text-center text-green-400">✔</td>
                                    <td className="p-4 text-center text-green-400">✔</td>
                                    <td className="p-4 text-center text-red-400">✘</td>
                                    <td className="p-4 text-red-400">{t('guides.yesFree')}</td>
                                    <td className="p-4">5$ (Premium)</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">SSIPTV</td>
                                    <td className="p-4 text-center text-green-400">✔</td>
                                    <td className="p-4 text-center text-red-400">✘</td>
                                    <td className="p-4 text-center text-red-400">✘</td>
                                    <td className="p-4 text-green-400">{t('guides.no')}</td>
                                    <td className="p-4">{t('guides.free')}</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">VLC</td>
                                    <td className="p-4 text-center text-yellow-400">{t('guides.basic')}</td>
                                    <td className="p-4 text-center text-green-400">✔</td>
                                    <td className="p-4 text-center text-red-400">✘</td>
                                    <td className="p-4 text-green-400">{t('guides.no')}</td>
                                    <td className="p-4">{t('guides.free')}</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-cyan-300">GSE Smart</td>
                                    <td className="p-4 text-center text-green-400">✔</td>
                                    <td className="p-4 text-center text-green-400">✔</td>
                                    <td className="p-4 text-center text-red-400">✘</td>
                                    <td className="p-4 text-red-400">{t('guides.yes')}</td>
                                    <td className="p-4">{t('guides.free')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center text-gray-500 text-sm max-w-3xl mx-auto p-6 border-t border-white/5">
            <p className="mb-2">{t('guides.noteTitle')}</p>
            <p>
                {t('guides.noteText')}
            </p>
        </div>

      </div>
    </div>
  );
};

export default AppsGuide;
