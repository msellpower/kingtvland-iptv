
import React, { useEffect, useRef, useState } from 'react';
import { StreamChannel } from '../types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../i18n/LanguageContext';
import { motion } from 'framer-motion';

// ==========================================
// ⚙️ הגדרות מקור תמונות
// ==========================================
const USE_GITHUB_IMAGES = false; 
const GITHUB_BASE_URL = "https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/images";

// Default placeholder for missing images
const PLACEHOLDER_IMG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg width="500" height="750" xmlns="http://www.w3.org/2000/svg"><rect width="500" height="750" fill="#141414"/><text x="50%" y="50%" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="32" text-anchor="middle" dominant-baseline="middle">KINGTV</text></svg>')}`;

// Mock Data for UI Showcase (Prevents heavy fetching on homepage)
const MOCK_DATA: StreamChannel[] = [
    { name: "Stranger Things", group: "Series", logo: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", url: "" },
    { name: "Breaking Bad", group: "Series", logo: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", url: "" },
    { name: "Avengers: Endgame", group: "Action", logo: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", url: "" },
    { name: "The Witcher", group: "Series", logo: "https://image.tmdb.org/t/p/w500/7vjaCdMW15FEbXyWWTvS0ea62bh.jpg", url: "" },
    { name: "Inception", group: "Sci-Fi", logo: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEQAvQNLV5Uge.jpg", url: "" },
    { name: "The Mandalorian", group: "Sci-Fi", logo: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg", url: "" },
    { name: "Spider-Man: No Way Home", group: "Action", logo: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", url: "" },
    { name: "Peaky Blinders", group: "Drama", logo: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg", url: "" },
    { name: "Frozen II", group: "Kids", logo: "https://image.tmdb.org/t/p/w500/qdfARIhgpgZOBh3vfNhWS4hmSo3.jpg", url: "" },
    { name: "Lion King", group: "Kids", logo: "https://image.tmdb.org/t/p/w500/dzBtMocZuJbjk0Pt2ICJfq1xweD.jpg", url: "" },
    { name: "Wednesday", group: "Series", logo: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg", url: "" },
    { name: "Avatar 2", group: "Sci-Fi", logo: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", url: "" },
    { name: "Top Gun: Maverick", group: "Action", logo: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg", url: "" },
    { name: "The Last of Us", group: "Series", logo: "https://image.tmdb.org/t/p/w500/uKV9D669lMGIBdGgHGR5X4siXYq.jpg", url: "" },
    { name: "Mario Bros", group: "Kids", logo: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg", url: "" }
];

interface ContentRowData {
    title: string;
    items: StreamChannel[];
}

interface ContentShowcaseProps {
    onAuthRequired?: () => void;
}

const ContentShowcase: React.FC<ContentShowcaseProps> = ({ onAuthRequired }) => {
    const { t, language, isRTL } = useLanguage();
    const [heroSlides, setHeroSlides] = useState<StreamChannel[]>([]);
    const [rows, setRows] = useState<ContentRowData[]>([]);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [reminders, setReminders] = useState<string[]>([]);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // Load reminders
    useEffect(() => {
        const saved = localStorage.getItem('kingtv_reminders');
        if (saved) setReminders(JSON.parse(saved));
    }, []);

    // Prepare Showcase Content (Static / Mock Only)
    useEffect(() => {
        // Simulating data preparation without network fetch to avoid errors
        const channels = [...MOCK_DATA, ...MOCK_DATA]; // Duplicate to fill rows

        // Categorize Data
        const movies: StreamChannel[] = [];
        const series: StreamChannel[] = [];
        const kids: StreamChannel[] = [];
        const action: StreamChannel[] = [];
        
        channels.forEach(ch => {
            const group = (ch.group || '').toLowerCase();
            const name = (ch.name || '').toLowerCase();

            if (group.includes('series') || group.includes('season') || group.includes('סדרות') || group.includes('series')) {
                series.push(ch);
            } else {
                if (group.includes('kid') || group.includes('anim') || group.includes('ילדים') || group.includes('kids')) {
                    kids.push(ch);
                } else {
                    movies.push(ch);
                    if (group.includes('action') || name.includes('action')) action.push(ch);
                }
            }
        });

        // Ensure we have some content in categories
        if (movies.length === 0) movies.push(...channels.slice(0, 5));
        if (series.length === 0) series.push(...channels.slice(5, 10));
        if (action.length === 0) action.push(...channels.slice(0, 5));

        // Build Rows
        const newRows: ContentRowData[] = [
            { title: t('vod.categories.hot'), items: movies.slice(0, 15) },
            { title: t('vod.categories.series'), items: series.slice(0, 15) },
            { title: t('vod.categories.kids'), items: kids.slice(0, 15) },
            { title: t('vod.categories.action'), items: action.slice(0, 15) },
        ].filter(r => r.items.length > 0);

        setRows(newRows);

        // Pick 5 Random Movies for Hero
        const shuffled = [...channels].sort(() => 0.5 - Math.random());
        setHeroSlides(shuffled.slice(0, 5));
        
        setLoading(false);
        // Refresh ScrollTrigger after content is rendered
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);
    }, []);

    // Auto-rotate Hero Slider
    useEffect(() => {
        if (heroSlides.length === 0) return;
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 6000); 
        return () => clearInterval(interval);
    }, [heroSlides]);

    const toggleReminder = (title: string) => {
        let newReminders;
        let msg = "";
        if (reminders.includes(title)) {
            newReminders = reminders.filter(t => t !== title);
            msg = t('vod.reminderRemoved').replace('{title}', title);
        } else {
            newReminders = [...reminders, title];
            msg = t('vod.reminderSet').replace('{title}', title);
        }
        setReminders(newReminders);
        localStorage.setItem('kingtv_reminders', JSON.stringify(newReminders));
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const getImageUrl = (item: StreamChannel) => {
        if (USE_GITHUB_IMAGES) {
            const slug = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            return `${GITHUB_BASE_URL}/${slug}.jpg`;
        }
        return item.logo || PLACEHOLDER_IMG;
    };

    if (loading) {
        return (
            <div className="h-screen bg-[#141414] flex flex-col justify-center items-center gap-4 border-t border-white/5">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 animate-pulse">{t('vod.loading')}</p>
            </div>
        );
    }

    if (heroSlides.length === 0) return null;

    const currentHero = heroSlides[currentHeroIndex];

    return (
        <div className={`bg-[#141414] text-white pb-8 relative z-20 border-t border-white/5 font-sans ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in-up">
                    <span className="font-bold text-sm">{toastMsg}</span>
                </div>
            )}

        <div id="vod" className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden group scroll-mt-[200px] md:scroll-mt-[120px]">
                
                <div key={currentHero.name} className="absolute inset-0 animate-fade-in">
                     {/* Layer 1: Blurred Backdrop */}
                     <img 
                        src={getImageUrl(currentHero)}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50 scale-125"
                        referrerPolicy="no-referrer"
                        loading="eager"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                    />
                    
                    {/* Layer 2: Main Image */}
                     <img 
                        src={getImageUrl(currentHero)}
                        alt={currentHero.name}
                        className="absolute inset-0 w-full h-full object-contain transform transition-transform duration-[10000ms] ease-linear group-hover:scale-105 z-0"
                        referrerPolicy="no-referrer"
                        loading="eager"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                        {...({ fetchPriority: "high" } as any)}
                    />

                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent z-0"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-black/60 to-transparent opacity-90 z-0"></div>
                </div>

                {/* Hero Content */}
                <div className={`absolute bottom-12 md:bottom-24 ${isRTL ? 'right-0' : 'left-0'} p-6 md:p-16 max-w-3xl w-full flex flex-col items-start gap-3 md:gap-4 z-10`}>
                    <div className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-widest mb-1 md:mb-2 shadow-lg">
                        {t('vod.top10')}
                    </div>
                    <h2 className="text-3xl md:text-7xl font-black text-white drop-shadow-2xl leading-tight">
                        {currentHero.name}
                    </h2>
                    <p className="text-xs md:text-lg text-gray-300 font-medium drop-shadow-md line-clamp-2 md:line-clamp-3 max-w-xl">
                        {t('vod.heroSubtitle')}
                    </p>
                    <div className="flex gap-2 md:gap-4 mt-2 md:mt-6">
                        <button 
                            onClick={onAuthRequired}
                            className="bg-white text-black px-5 py-2.5 md:px-8 md:py-3 rounded-md font-bold text-sm md:text-lg hover:bg-gray-200 transition flex items-center gap-2 shadow-xl active:scale-95"
                        >
                            <svg className="w-5 h-5 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            {t('vod.play')}
                        </button>
                        <button 
                            onClick={() => toggleReminder(currentHero.name)}
                            className="bg-gray-500/60 text-white px-5 py-2.5 md:px-8 md:py-3 rounded-md font-bold text-sm md:text-lg hover:bg-gray-500/80 transition flex items-center gap-2 backdrop-blur-sm active:scale-95"
                        >
                            {reminders.includes(currentHero.name) ? t('vod.inList') : t('vod.add')}
                        </button>
                    </div>
                </div>

                {/* Indicators */}
                <div className={`absolute bottom-20 md:bottom-8 ${isRTL ? 'left-8' : 'right-8'} flex gap-2 z-20`}>
                    {heroSlides.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentHeroIndex(idx)}
                            className={`h-1 transition-all rounded-full ${idx === currentHeroIndex ? 'bg-white w-8' : 'bg-gray-500 w-4 hover:bg-gray-400'}`}
                        />
                    ))}
                </div>
            </div>

            {/* 2. Content Rows */}
            <div className="relative -mt-8 md:-mt-28 z-20 space-y-8 md:space-y-12 px-4 md:px-12 pb-10">
                {rows.map((row, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                    >
                        <ContentRow 
                            title={row.title} 
                            items={row.items} 
                            getImageUrl={getImageUrl}
                            toggleReminder={toggleReminder}
                            reminders={reminders}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const ContentRow = ({ title, items, getImageUrl, toggleReminder, reminders }: any) => {
    const { t, isRTL } = useLanguage();
    const rowRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(true); 
    const [showRightArrow, setShowRightArrow] = useState(false); 

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { current } = rowRef;
            const scrollAmount = direction === 'left' ? -current.clientWidth * 0.8 : current.clientWidth * 0.8;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            
            setTimeout(() => {
                setShowRightArrow(current.scrollLeft < 0);
            }, 500);
        }
    };

    return (
        <div className="group relative content-section">
            <h3 className="text-xl md:text-2xl font-bold text-gray-200 mb-4 px-2 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-2">
                {title}
                <span className="text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    {t('vod.showAll')} 
                    <svg className={`w-3 h-3 ${isRTL ? 'mr-1 rotate-180' : 'ml-1'} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
            </h3>

            <div className="relative">
                <button 
                    onClick={() => scroll('right')}
                    className={`absolute right-0 top-0 bottom-0 bg-black/60 w-12 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 rounded-r-md ${!showRightArrow ? 'hidden' : ''}`}
                >
                     <svg className="w-8 h-8 text-white transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                <div 
                    ref={rowRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide py-4 px-2 scroll-smooth"
                    style={{ scrollDirection: 'rtl' } as any}
                >
                    {items.map((item: any, idx: number) => (
                        <div 
                            key={idx} 
                            className="flex-none w-[140px] md:w-[200px] aspect-[2/3] relative rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 hover:z-20 hover:shadow-2xl hover:shadow-black bg-slate-800"
                        >
                            <img 
                                src={getImageUrl(item)} 
                                alt={item.name} 
                                className="w-full h-full object-cover bg-black/40"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <h4 className="text-white text-xs font-bold line-clamp-2 mb-2 drop-shadow-md">{item.name}</h4>
                                <div className="flex gap-2">
                                    <button className="bg-white text-black rounded-full p-1.5 hover:scale-110 transition">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </button>
                                    <button 
                                        onClick={() => toggleReminder(item.name)}
                                        className={`rounded-full p-1.5 border border-white hover:bg-white/20 transition ${reminders.includes(item.name) ? 'bg-green-500 border-green-500 text-white' : 'text-white'}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => scroll('left')}
                    className={`absolute left-0 top-0 bottom-0 bg-black/60 w-12 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 rounded-l-md ${!showLeftArrow ? 'hidden' : ''}`}
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
            </div>
        </div>
    );
};

export default ContentShowcase;
