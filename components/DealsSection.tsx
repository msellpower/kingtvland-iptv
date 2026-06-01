
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface DealsSectionProps {
  onNavigate: (view: any, anchor?: string) => void;
}

const DealsSection: React.FC<DealsSectionProps> = ({ onNavigate }) => {
  const { t, language, isRTL } = useLanguage();
  return (
    <div className={`py-4 md:py-8 bg-black/20 border-y border-white/5 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4 md:mb-8">
                <h2 id="deals" className="text-2xl md:text-3xl font-black text-white flex items-center gap-2 scroll-mt-[200px] md:scroll-mt-[120px]">
                    <span className="text-yellow-400 filter drop-shadow-lg">⚡</span> {t('deals.title')}
                </h2>
                <button 
                    onClick={() => onNavigate('promotions')} 
                    className="text-sm font-bold text-cyan-400 hover:text-white transition-colors flex items-center gap-1 group"
                >
                    {t('deals.all')}
                    <span className={`transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`}>{isRTL ? '←' : '→'}</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Deal 1: Referral */}
                <div 
                    onClick={() => onNavigate('promotions')}
                    className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 p-4 md:p-6 rounded-2xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-900/20 transition-all group relative overflow-hidden shadow-lg"
                >
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-bl-xl shadow-md z-10">HOT</div>
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <div className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">🎁</div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{t('deals.referral.title')}</h3>
                    <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-6 leading-relaxed">
                        {t('deals.referral.desc')}
                    </p>
                    <span className="text-[10px] md:text-xs font-bold text-purple-300 flex items-center gap-1 group-hover:gap-2 transition-all bg-purple-500/10 w-fit px-3 py-1.5 rounded-lg border border-purple-500/20">
                        {t('deals.referral.cta')} <svg className={`w-3 h-3 ${!isRTL && 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l7-7-7-7" /></svg>
                    </span>
                </div>

                {/* Deal 2: Early Renewal */}
                <div 
                    onClick={() => onNavigate('promotions')}
                    className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-white/10 p-4 md:p-6 rounded-2xl cursor-pointer hover:border-green-500/50 hover:bg-green-900/20 transition-all group relative overflow-hidden shadow-lg"
                >
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-green-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                    <div className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">🔄</div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{t('deals.renewal.title')}</h3>
                    <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-6 leading-relaxed">
                        {t('deals.renewal.desc')}
                    </p>
                    <span className="text-[10px] md:text-xs font-bold text-green-300 flex items-center gap-1 group-hover:gap-2 transition-all bg-green-500/10 w-fit px-3 py-1.5 rounded-lg border border-green-500/20">
                        {t('deals.renewal.cta')} <svg className={`w-3 h-3 ${!isRTL && 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l7-7-7-7" /></svg>
                    </span>
                </div>

                {/* Deal 3: Premium Upgrade */}
                <div 
                    onClick={() => onNavigate('home', 'pricing')}
                    className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-white/10 p-4 md:p-6 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-900/20 transition-all group relative overflow-hidden shadow-lg"
                >
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                    <div className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">💎</div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{t('deals.upgrade.title')}</h3>
                    <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-6 leading-relaxed">
                        {t('deals.upgrade.desc')}
                    </p>
                    <span className="text-[10px] md:text-xs font-bold text-cyan-300 flex items-center gap-1 group-hover:gap-2 transition-all bg-cyan-500/10 w-fit px-3 py-1.5 rounded-lg border border-cyan-500/20">
                        {t('deals.upgrade.cta')} <svg className={`w-3 h-3 ${!isRTL && 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l7-7-7-7" /></svg>
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DealsSection;
