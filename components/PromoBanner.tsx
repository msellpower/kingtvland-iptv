
import React from 'react';

interface PromoBannerProps {
  onNavigate: (view: any) => void;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ onNavigate }) => {
  return (
    <div 
        className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 border-y border-white/10 relative overflow-hidden cursor-pointer group"
        onClick={() => onNavigate('promotions')}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
      <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:translate-x-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 text-center md:text-right">
          <span className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/50 whitespace-nowrap">
            מבצע לוהט 🔥
          </span>
          <p className="text-gray-200 text-sm md:text-base">
            <span className="font-bold text-yellow-400">חבר מביא חבר?</span> צרפו חברים וקבלו <span className="font-bold text-white border-b border-yellow-400">10% הנחה</span> על החידוש הבא!
          </p>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate('promotions'); }}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-1.5 px-5 rounded-full text-sm transition-all flex items-center gap-2 group-hover:bg-white group-hover:text-purple-900 whitespace-nowrap"
        >
          לקבלת הקופון
          <svg className="w-4 h-4 transform rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
