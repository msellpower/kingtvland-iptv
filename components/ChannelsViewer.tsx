
import React, { useState, useEffect, useRef } from 'react';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { fetchMetadata, resolveStreamUrl } from '../services/m3uService';
import { ContentItem, StreamChannel } from '../types';
import VideoPlayer from './VideoPlayer';
import PromoBanner from './PromoBanner';
import Skeleton from './Skeleton';
import { useLanguage } from '../i18n/LanguageContext';

interface ChannelsViewerProps {
    onNavigate: (view: any) => void;
    systemSettings?: any;
}

const PLANS = [
  { id: 'king', name: 'KING' },
  { id: 'vod', name: 'VOD' },
  { id: 'israel', name: 'ISRAEL' },
  { id: 'premium', name: 'PREMIUM' }
];

const QUALITIES = ['All', '4K', 'FHD', 'HD'];

const ITEMS_PER_PAGE = 50;
type ViewMode = 'grid' | 'table';

const ChannelsViewer: React.FC<ChannelsViewerProps> = ({ onNavigate, systemSettings }) => {
  const { t, isRTL } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false); // New state for stream resolution
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Data
  const [groupedContent, setGroupedContent] = useState<Record<string, ContentItem[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Search, Filter & Favorites
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('All');

  // Pagination
  const [visibleItemsCount, setVisibleItemsCount] = useState(ITEMS_PER_PAGE);

  // Player
  const [metadataList, setMetadataList] = useState<StreamChannel[]>([]);
  const [playingChannel, setPlayingChannel] = useState<{name: string, url: string} | null>(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
      try {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (!SpeechRecognition) {
              alert('Voice search is not supported in this browser.');
              return;
          }

          const recognition = new SpeechRecognition();
          recognition.lang = isRTL ? 'he-IL' : 'en-US';
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => setIsListening(true);
          
          recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              setSearchQuery(transcript);
          };

          recognition.onerror = (event: any) => {
              console.error('Speech recognition error', event.error);
              setIsListening(false);
          };

          recognition.onend = () => setIsListening(false);

          recognition.start();
      } catch (error) {
          console.error('Speech recognition exception', error);
          setIsListening(false);
      }
  };

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<any>(null);

  // Load Favorites from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('kingtv_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Save Favorites
  const toggleFavorite = (itemName: string) => {
    let newFavs;
    if (favorites.includes(itemName)) {
        newFavs = favorites.filter(f => f !== itemName);
    } else {
        newFavs = [...favorites, itemName];
    }
    setFavorites(newFavs);
    localStorage.setItem('kingtv_favorites', JSON.stringify(newFavs));
  };

  // Load Metadata whenever selectedPlan changes
  useEffect(() => {
    if (!selectedPlan) return;

    const loadData = async () => {
        setLoading(true);
        setMetadataList([]);
        setGroupedContent({});
        setSelectedCategory(null);
        
        // Fetch Metadata Only (Fast)
        const channels = await fetchMetadata(selectedPlan);
        setMetadataList(channels);
        setLoading(false);
    };
    loadData();
  }, [selectedPlan]);

  // Process Content (Search & Grouping)
  useEffect(() => {
    if (metadataList.length === 0) return;

    // 1. Map to Content Items
    let items: ContentItem[] = metadataList.map(ch => ({
        name: ch.name,
        category: ch.group || 'General',
        type: 'Channel',
        logo: ch.logo
    }));

    // 2. Filter by Quality
    if (selectedQuality !== 'All') {
        items = items.filter(i => {
            const name = i.name.toLowerCase();
            if (selectedQuality === '4K') return name.includes('4k') || name.includes('uhd') || name.includes('2160');
            if (selectedQuality === 'FHD') return name.includes('fhd') || name.includes('1080');
            if (selectedQuality === 'HD') return name.includes('hd') || name.includes('720');
            return true;
        });
    }

    // 3. Search Filtering (Global)
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(q));
        setGroupedContent({ [t('channels.results')]: items });
        setSelectedCategory(t('channels.results'));
        return;
    }

    // 4. Favorites Filtering
    if (showFavoritesOnly) {
        items = items.filter(i => favorites.includes(i.name));
        setGroupedContent({ [t('channels.favorites')]: items });
        setSelectedCategory(t('channels.favorites'));
        return;
    }

    // 5. Grouping (Default View)
    const groups: Record<string, ContentItem[]> = {};
    items.forEach(item => {
        const key = item.category;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    });

    // Sort Keys
    const sortedGroups: Record<string, ContentItem[]> = {};
    Object.keys(groups).sort().forEach(key => sortedGroups[key] = groups[key]);

    setGroupedContent(sortedGroups);
    
    if (selectedCategory && !sortedGroups[selectedCategory] && !searchQuery && !showFavoritesOnly) {
        setSelectedCategory(null);
    }

  }, [metadataList, searchQuery, showFavoritesOnly, favorites, selectedQuality]);

  // Reset selection on category switch
  useEffect(() => {
    if (contentContainerRef.current) contentContainerRef.current.scrollTop = 0;
  }, [selectedCategory]);

  const handleChannelClick = async (item: ContentItem) => {
    if (!selectedPlan) return;
    
    // Resolve URL live from backend
    setResolving(true);
    const url = await resolveStreamUrl(selectedPlan, item.name);
    setResolving(false);

    if (url && url !== 'resolve_needed') {
        setPlayingChannel({ name: item.name, url: url });
    } else {
        alert(t('channels.error'));
    }
  };

  const currentCategoryItems = selectedCategory ? groupedContent[selectedCategory] : [];

  const getColumnCount = (width: number) => {
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 640) return 2;
    return 2;
  };

  const GridRow = ({ index, style, data }: any) => {
    const { items, columns } = data;
    const startIndex = index * columns;
    const rowItems = items.slice(startIndex, startIndex + columns);

    return (
      <div style={style} className="flex gap-2 md:gap-4 pb-2 md:pb-4 px-1">
        {rowItems.map((item: ContentItem, idx: number) => (
          <div 
            key={idx} 
            className="group flex-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/50 rounded-xl md:rounded-2xl p-2 md:p-4 transition-all relative hover:-translate-y-1 hover:shadow-xl overflow-hidden"
          >
            <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.name); }}
                className={`absolute top-1 right-1 md:top-3 md:left-3 p-1 rounded-full hover:bg-black/40 z-10 transition-colors ${favorites.includes(item.name) ? 'text-pink-500 scale-110' : 'text-gray-600 hover:text-pink-400'}`}
            >
                <svg className={`w-4 h-4 md:w-5 md:h-5 ${favorites.includes(item.name) ? 'fill-current' : 'none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
            
            <div onClick={() => handleChannelClick(item)} className={`cursor-pointer h-full flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-${isRTL ? 'right' : 'left'}`}>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 border border-white/10 shrink-0">
                    {item.logo ? (
                        <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm2 0v12h12V6H6zm5 3l5 3-5 3V9z"/></svg>
                    )}
                </div>
                <div className="flex-1 min-w-0 w-full overflow-hidden">
                    <p className="text-xs md:text-sm font-bold text-gray-200 group-hover:text-white truncate transition-colors">{item.name}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 group-hover:text-gray-400 truncate">{item.category}</p>
                </div>
            </div>
          </div>
        ))}
        {rowItems.length < columns && Array.from({ length: columns - rowItems.length }).map((_, i) => (
          <div key={`empty-${i}`} className="flex-1" />
        ))}
      </div>
    );
  };

  const TableRow = ({ index, style, data }: any) => {
    const item = data[index];
    return (
      <div style={style} className={`flex items-center px-4 hover:bg-white/5 group border-b border-white/5 transition-colors text-${isRTL ? 'right' : 'left'}`}>
        <div className="w-10 flex-shrink-0">
            <button onClick={() => toggleFavorite(item.name)} className={`${favorites.includes(item.name) ? 'text-pink-500' : 'text-gray-600 hover:text-pink-400'}`}>
                <svg className={`w-5 h-5 ${favorites.includes(item.name) ? 'fill-current' : 'none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 border border-white/10 shrink-0 mx-2">
            {item.logo ? (
                <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
            ) : (
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm2 0v12h12V6H6zm5 3l5 3-5 3V9z"/></svg>
            )}
        </div>
        <div 
          className="flex-1 text-white font-medium cursor-pointer truncate px-2" 
          onClick={() => handleChannelClick(item)}
          title={item.name}
        >
            {item.name}
        </div>
        <div className="flex-shrink-0">
            <button onClick={() => handleChannelClick(item)} className="text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border border-cyan-500/20 hover:border-cyan-500 whitespace-nowrap">
                {t('channels.play')}
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`pt-6 md:pt-24 pb-12 px-2 md:px-4 min-h-screen space-gradient ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
       <div className="max-w-7xl mx-auto min-h-[80vh] flex flex-col">
          
          {/* Top Controls */}
          <div className="glass-card rounded-2xl p-4 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-1.5">📡</span>
                  {t('channels.title')}
              </h1>
              
              <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-hide">
                 {PLANS.map(plan => (
                     <button
                        key={plan.id}
                        onClick={() => { setSelectedPlan(plan.id); setSearchQuery(''); setShowFavoritesOnly(false); }}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                            selectedPlan === plan.id 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                     >
                        {plan.name}
                     </button>
                 ))}
              </div>
          </div>

          {/* Search & Toolbar */}
          {selectedPlan && (
            <div className="flex flex-col md:flex-row gap-4 mb-4 animate-fade-in">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder={t('channels.searchPlaceholder')} 
                        className={`w-full bg-slate-800/60 backdrop-blur-sm border border-white/10 text-white ${isRTL ? 'pr-4 pl-20' : 'pl-10 pr-20'} py-3 rounded-xl focus:outline-none focus:border-cyan-500/50 shadow-inner transition-colors`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isRTL ? (
                        <>
                            <svg className="absolute top-3.5 right-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <button 
                                onClick={startListening} 
                                className={`absolute top-2 left-2 p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                                title="חיפוש קולי"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            </button>
                        </>
                    ) : (
                        <>
                            <svg className="absolute top-3.5 left-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <button 
                                onClick={startListening} 
                                className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                                title="Voice Search"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            </button>
                        </>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="glass-card p-1 rounded-xl flex">
                        {QUALITIES.map(q => (
                            <button
                                key={q}
                                onClick={() => setSelectedQuality(q)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                    selectedQuality === q 
                                    ? 'bg-purple-600 text-white shadow-md' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setSearchQuery(''); }}
                        className={`px-4 py-3 rounded-xl border font-bold flex items-center gap-2 transition-all shadow-lg flex-1 md:flex-none justify-center ${showFavoritesOnly ? 'bg-pink-600 border-pink-500 text-white' : 'glass-card border-white/10 text-gray-300 hover:bg-white/10'}`}
                    >
                        <svg className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : 'none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        <span className="inline">{t('channels.favorites')} ({favorites.length})</span>
                    </button>
                    
                    <div className="glass-card p-1 rounded-xl hidden md:flex">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" /></svg>
                        </button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        </button>
                    </div>
                </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="glass-card rounded-2xl flex flex-1 overflow-hidden shadow-2xl relative">
             {/* Initial State Prompt */}
             {!selectedPlan && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/50 backdrop-blur-sm z-10 animate-fade-in">
                     <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20 animate-pulse-slow">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                     </div>
                     <h2 className="text-3xl font-black text-white mb-2">{t('channels.welcome')}</h2>
                     <p className="text-gray-400 text-lg mb-8 max-w-md">
                         {t('channels.welcomeDesc')}
                     </p>
                     <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                        {PLANS.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className="px-4 py-2 md:px-6 md:py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs md:text-base font-bold transition-all active:scale-95"
                            >
                                {plan.name}
                            </button>
                        ))}
                     </div>
                 </div>
             )}

             {loading ? (
                 <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in bg-slate-900/80 backdrop-blur z-20 absolute inset-0">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <Skeleton className="h-8 w-64 mx-auto" />
                 </div>
             ) : (
                 <>
                    {/* Sidebar: Categories (Desktop Only) */}
                    {selectedPlan && !searchQuery && !showFavoritesOnly && (
                        <div className={`hidden md:block w-1/4 bg-slate-900/50 ${isRTL ? 'border-l' : 'border-r'} border-white/5 overflow-y-auto scrollbar-thin backdrop-blur-md h-full relative z-20 transition-all duration-300`}>
                            {Object.keys(groupedContent).length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center justify-center h-full text-gray-500">
                                    <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p>{t('channels.noChannels')}</p>
                                </div>
                            ) : (
                                <div className="p-2 flex flex-col gap-1">
                                    {Object.keys(groupedContent).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                if (contentContainerRef.current) {
                                                    contentContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                                }
                                            }}
                                            className={`text-${isRTL ? 'right' : 'left'} px-4 py-3 rounded-xl text-sm transition-all flex justify-between items-center ${
                                                selectedCategory === cat 
                                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold shadow-lg' 
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <span className={`truncate ${isRTL ? 'ml-2' : 'mr-2'}`}>{cat}</span>
                                            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full text-gray-400 border border-white/5">{groupedContent[cat].length}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content Area (Desktop & Mobile) */}
                    {selectedPlan && (
                        <div ref={contentContainerRef} className={`flex-1 bg-black/20 overflow-y-auto p-2 md:p-4 scrollbar-thin ${searchQuery || showFavoritesOnly ? 'w-full' : ''} min-h-[50vh]`}>
                            
                            {/* Desktop View / Search / Favorites */}
                            <div className="w-full h-full flex flex-col">
                                {!selectedCategory && !searchQuery && !showFavoritesOnly ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 py-20">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                        </div>
                                        <p className="text-lg">{t('channels.chooseCategory')}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`flex items-center justify-between mb-4 sticky ${systemSettings?.PROMO_BANNER_TEXT ? 'top-[140px]' : 'top-[110px]'} md:top-0 bg-slate-900/80 backdrop-blur-md p-3 md:p-4 rounded-xl z-10 border border-white/10 shadow-lg transition-all duration-300`}>
                                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                {selectedCategory === t('channels.favorites') && <span className="text-pink-500">❤</span>}
                                                {selectedCategory === t('channels.results') && <span className="text-cyan-500">🔍</span>}
                                                {selectedCategory}
                                            </h2>
                                            <span className="text-xs font-bold text-gray-400 bg-black/30 px-3 py-1 rounded-full">
                                                {t('channels.stats').replace('{displayed}', currentCategoryItems.length.toString()).replace('{total}', currentCategoryItems.length.toString())}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-h-[400px] h-[calc(100vh-350px)] md:h-[calc(100vh-400px)]">
                                            <AutoSizer children={(({ height, width }: any) => {
                                                    if (viewMode === 'grid') {
                                                        const columns = getColumnCount(width);
                                                        const rowCount = Math.ceil(currentCategoryItems.length / columns);
                                                        return (
                                                            <List
                                                                ref={listRef}
                                                                height={height}
                                                                width={width}
                                                                itemCount={rowCount}
                                                                itemSize={width < 768 ? 140 : 120}
                                                                itemData={{ items: currentCategoryItems, columns }}
                                                                className="scrollbar-thin"
                                                                direction={isRTL ? 'rtl' : 'ltr'}
                                                                children={GridRow as any}
                                                            />
                                                        );
                                                    } else {
                                                        return (
                                                            <List
                                                                ref={listRef}
                                                                height={height}
                                                                width={width}
                                                                itemCount={currentCategoryItems.length}
                                                                itemSize={60}
                                                                itemData={currentCategoryItems}
                                                                className="scrollbar-thin border border-white/5 rounded-xl bg-black/40"
                                                                direction={isRTL ? 'rtl' : 'ltr'}
                                                                children={TableRow as any}
                                                            />
                                                        );
                                                    }
                                                }) as any} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                 </>
             )}
          </div>
       </div>

        {/* Resolution Spinner Overlay */}
        {resolving && (
            <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-400 font-bold text-xl">{t('channels.resolving')}</p>
                <p className="text-gray-400 text-sm mt-2">{t('channels.connecting')}</p>
            </div>
        )}

       {playingChannel && (
           <VideoPlayer 
                src={playingChannel.url} 
                title={playingChannel.name} 
                onClose={() => setPlayingChannel(null)} 
           />
       )}
    </div>
  );
};

export default ChannelsViewer;
