
import React, { useRef } from 'react';
import { FULL_GUIDES_DATA } from '../constants';
import { useLanguage } from '../i18n/LanguageContext';
import { motion } from 'framer-motion';

interface RecommendedAppsProps {
  onNavigate: (view: any, anchor?: string) => void;
}

const RecommendedApps: React.FC<RecommendedAppsProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Flatten apps and pick the top rated ones for the homepage showcase
  const featuredApps = FULL_GUIDES_DATA.flatMap(category => 
    category.apps.filter(app => parseFloat(app.rating) >= 4.5)
  ).slice(0, 8); // Take top 8

  // Custom smooth scroll function for consistent behavior
  const smoothScroll = (element: HTMLElement, target: number, duration: number) => {
    const start = element.scrollLeft;
    const change = target - start;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        
        if (elapsed < duration) {
            element.scrollLeft = easeInOutQuad(elapsed, start, change, duration);
            requestAnimationFrame(animateScroll);
        } else {
            element.scrollLeft = target;
        }
    };

    requestAnimationFrame(animateScroll);
  };

  // Easing function: Ease-In-Out Quad
  const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        const { current } = scrollRef;
        const scrollAmount = 400; // Amount to scroll
        
        // In RTL: 
        // Scrolling "Left" (Next content) -> Decrease scrollLeft (more negative)
        // Scrolling "Right" (Prev content) -> Increase scrollLeft (towards 0)
        let targetScroll = current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
        
        smoothScroll(current, targetScroll, 600); // 600ms duration
    }
  };

  return (
    <div className="py-6 md:py-12 relative overflow-hidden bg-slate-900 border-t border-white/5">
      {/* Background decoration - Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-12 gap-6">
            <div>
                <h2 id="apps" className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 scroll-mt-[200px] md:scroll-mt-[120px]">
                    {t('apps.title')}
                </h2>
                <p className="text-gray-400 text-sm md:text-lg max-w-2xl">
                    {t('apps.subtitle')}
                </p>
            </div>
            
            <div className="flex gap-3">
                {/* Right Button (Previous in RTL) */}
                <button 
                    onClick={() => scroll('right')} 
                    className="p-3 rounded-full bg-slate-800/80 border border-gray-600 text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-lg backdrop-blur-sm active:scale-95"
                    aria-label="Scroll Right"
                >
                    <svg className="w-6 h-6 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {/* Left Button (Next in RTL) */}
                <button 
                    onClick={() => scroll('left')} 
                    className="p-3 rounded-full bg-slate-800/80 border border-gray-600 text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-lg backdrop-blur-sm active:scale-95"
                    aria-label="Scroll Left"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
            </div>
        </div>

        {/* Horizontal Scroll / Carousel */}
        <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-12 scrollbar-hide snap-x snap-mandatory px-4 md:px-0"
        >
            {featuredApps.map((app, idx) => (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    key={idx}
                    className="min-w-[300px] md:min-w-[340px] relative group snap-center"
                >
                    {/* Glass Card */}
                    <div className="h-full bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col hover:border-indigo-500/50 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-indigo-500/20">
                        
                        {/* Gradient Top Border Effect */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-sm font-black text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-lg border border-yellow-400/20">
                                    ⭐ {app.rating}
                                </span>
                            </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2">{app.name}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                            {t(`guides.app.${app.id}.desc` as any) || app.description}
                        </p>

                        <div className="mt-auto">
                            {/* Platform Badges */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {app.platforms?.slice(0, 3).map((p, i) => (
                                    <span key={i} className="text-[10px] uppercase font-bold text-gray-300 bg-white/5 px-2 py-1 rounded border border-white/10">
                                        {p}
                                    </span>
                                ))}
                            </div>

                            <button 
                                onClick={() => onNavigate('guides', app.id)}
                                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 hover:border-indigo-400/50 transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:border-indigo-500"
                            >
                                <span>{t('guides.download')}</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
            
            <div 
                onClick={() => onNavigate('guides')}
                className="min-w-[250px] relative group snap-center cursor-pointer flex items-center justify-center"
            >
                 <div className="bg-slate-800/30 backdrop-blur-sm border-2 border-dashed border-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center h-[90%] w-full hover:border-cyan-500 hover:bg-slate-800/50 transition-all">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('apps.more')}</h3>
                    <p className="text-gray-500 text-sm">{t('apps.allDevices')}</p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedApps;
