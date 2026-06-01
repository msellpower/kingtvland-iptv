
import React, { useState } from 'react';
import { PLANS } from '../constants';
import { CustomerType, Plan, ServiceLevel } from '../types';
import PromoBanner from './PromoBanner';
import { Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { motion } from 'framer-motion';

interface PricingProps {
  onSelectPlan: (plan: Plan, type: CustomerType, serviceLevel: ServiceLevel) => void;
  onNavigate: (view: any, anchor?: string) => void;
  isShabbat: boolean;
  onRequestTrial: (plan: Plan) => void;
}

const Pricing: React.FC<PricingProps> = ({ onSelectPlan, onNavigate, isShabbat, onRequestTrial }) => {
  const { t, language, isRTL } = useLanguage();
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel>(ServiceLevel.VIP);
  const [showTooltip, setShowTooltip] = useState(false);

  const [period, setPeriod] = useState<'year' | 'halfYear'>('year');

  return (
    <div className="pt-2 pb-8 md:py-16 bg-[#0f0c29] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-6 md:mb-16 animate-fade-in">
          <h2 id="pricing" className="text-2xl sm:text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-2 md:mb-4 scroll-mt-[200px] md:scroll-mt-[120px]">
            {t('pricing.title')}
          </h2>
          <p className="mt-1 md:mt-4 text-xs md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
            {t('pricing.subtitle')}
          </p>

          <div className="mt-6 md:mt-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            
            {/* Period Toggle */}
            <div className="flex justify-center items-center gap-3 bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                <button 
                  onClick={() => setPeriod('year')} 
                  className={`px-4 py-1 rounded-full text-sm font-bold ${period === 'year' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}>
                    {t('pricing.year')}
                </button>
                <button 
                  onClick={() => setPeriod('halfYear')} 
                  className={`px-4 py-1 rounded-full text-sm font-bold ${period === 'halfYear' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}>
                    {t('pricing.halfYear')}
                </button>
            </div>
            
            {/* Service Level Toggle */}
            <div className="relative">
                <div className="bg-white/5 p-1 rounded-full flex border border-white/10 backdrop-blur-md items-center">
                    <button
                        onClick={() => setServiceLevel(ServiceLevel.VIP)}
                        aria-label={t('pricing.chooseVIP')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                            serviceLevel === ServiceLevel.VIP
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {t('pricing.vipLabel')}
                    </button>
                    <button
                        onClick={() => setServiceLevel(ServiceLevel.BASIC)}
                        aria-label={t('pricing.chooseBasic')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                            serviceLevel === ServiceLevel.BASIC
                            ? 'bg-gradient-to-r from-gray-600 to-gray-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {t('pricing.noServiceLabel')}
                    </button>
                    
                    <button 
                        className={`${isRTL ? 'mr-2 ml-1' : 'ml-2 mr-1'} text-gray-400 hover:text-white transition-colors`}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        onClick={() => setShowTooltip(!showTooltip)}
                    >
                        <Info className="w-5 h-5" />
                    </button>
                </div>

                {/* Tooltip */}
                {showTooltip && (
                    <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-80 bg-slate-800 border border-white/10 rounded-xl p-4 shadow-2xl z-50 ${isRTL ? 'text-right' : 'text-left'} text-sm`}>
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-800 border-t border-l border-white/10 rotate-45"></div>
                        <div className="space-y-3">
                            <div>
                                <span className="font-bold text-yellow-400 block mb-1">{t('pricing.vipTitle')}</span>
                                <p className="text-gray-300">{t('pricing.vipDesc')}</p>
                            </div>
                            <div className="w-full h-px bg-white/10"></div>
                            <div>
                                <span className="font-bold text-gray-400 block mb-1">{t('pricing.noServiceTitle')}</span>
                                <p className="text-gray-300">{t('pricing.noServiceDesc')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-20">
          {PLANS.filter(plan => plan.enabled !== false).map((plan, index) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              key={plan.id}
              className={`relative flex flex-col rounded-3xl p-6 md:p-8 transition-all duration-300 glass-card hover:-translate-y-2 ${
                plan.isPremium 
                  ? 'border-purple-500/50 shadow-purple-500/20 z-10 scale-100 md:scale-105 md:hover:scale-[1.07]' 
                  : 'hover:border-cyan-400/50'
              } ${plan.id === 'gold' ? 'border-yellow-500/30' : ''}`}
            >
              {plan.isPremium && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm font-black text-white shadow-xl tracking-wider">
                  {t('pricing.recommended')}
                </div>
              )}

              {serviceLevel === ServiceLevel.VIP && (
                <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-xs border border-yellow-500/30 font-bold`}>
                    VIP
                </div>
              )}
              {serviceLevel === ServiceLevel.BASIC && (
                <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded text-xs border border-gray-500/30 font-bold`}>
                    {t('pricing.noServiceLabel')}
                </div>
              )}
              
              <div className="mb-6">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 min-h-[4rem] flex items-center leading-tight">
                    {t(`pricing.plan.${plan.id}.name` as any)}
                  </h3>
                  <p className="text-gray-400 text-sm">{t('pricing.fullAccess')}</p>
              </div>

              <div className="mb-8 flex items-baseline text-white">
                <span className="text-6xl font-black tracking-tighter animate-fade-in" key={serviceLevel}>
                  ₪{(() => {
                      let basePrice;
                      if (period === 'halfYear') {
                        basePrice = serviceLevel === ServiceLevel.VIP ? (plan.priceNewHalf || Math.round(plan.priceNew * 0.6)) : (plan.priceExistingHalf || Math.round(plan.priceExisting * 0.6));
                      } else {
                        basePrice = serviceLevel === ServiceLevel.VIP ? plan.priceNew : plan.priceExisting;
                      }
                      
                      if (plan.id === 'vod') {
                          if (period === 'halfYear') {
                             basePrice = serviceLevel === ServiceLevel.VIP ? 90 : 90; // Price calculation for half year if VOD
                          } else {
                             basePrice = serviceLevel === ServiceLevel.VIP ? 150 : 150; // No service price for VOD based on options
                          }
                      }
                      return Math.round(basePrice);
                  })()}
                </span>
                <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-xl text-gray-400 font-medium`}>/{t(period === 'year' ? 'pricing.year' : 'pricing.halfYear')}</span>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent mb-8"></div>

              <ul className="space-y-4 flex-1 mb-8">
                {(() => {
                  const featuresText = t(`pricing.plan.${plan.id}.features` as any);
                  const planFeatures = typeof featuresText === 'string' ? featuresText.split(',') : [];
                  return planFeatures.map((feature, index) => {
                    const trimmedFeature = feature.trim();
                    // Logic to strike through "Support" features if Basic service selected
                    const isSupportFeature = trimmedFeature.includes('תמיכה') || trimmedFeature.includes('שירות') || trimmedFeature.includes('Support');
                    const strike = serviceLevel === ServiceLevel.BASIC && isSupportFeature;

                    return (
                      <li key={index} className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${strike ? 'bg-gray-700 text-gray-500' : (plan.isPremium ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400')}`}>
                          {strike ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                          ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                          )}
                        </div>
                        <span className={`text-base font-medium transition-colors ${strike ? 'text-gray-600 line-through decoration-gray-500' : 'text-gray-300'}`}>
                          {trimmedFeature}
                        </span>
                      </li>
                    );
                  });
                })()}
                {/* Featured Benefits */}
                <li className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-base text-gray-300 font-medium">{t('pricing.initialInstall')}</span>
                </li>

                {serviceLevel === ServiceLevel.BASIC ? (
                    <>
                        <li className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-base text-gray-300 font-medium">{t('pricing.aiBot')}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-base text-gray-300 font-medium">{t('pricing.responseBasic')}</span>
                        </li>
                    </>
                ) : (
                    <>
                        <li className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-base text-white font-bold">{t('pricing.response24h')}</span>
                        </li>
                    </>
                )}
              </ul>

              <button
                onClick={() => !isShabbat && onSelectPlan(plan, CustomerType.NEW, serviceLevel)}
                disabled={isShabbat}
                aria-label={isShabbat ? t('pricing.inactive') : `${t('pricing.choosePlan')} ${plan.name}`}
                className={`w-full rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-center text-base sm:text-lg font-bold text-white transition-all shadow-lg transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                  plan.isPremium
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/40'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/40'
                }`}
              >
                {isShabbat ? t('pricing.inactive') : t('pricing.choosePlan')}
              </button>

              <button
                onClick={() => !isShabbat && onRequestTrial(plan)}
                disabled={isShabbat}
                className="mt-3 w-full rounded-2xl px-4 py-2 sm:px-6 sm:py-3 text-center text-sm sm:text-base font-bold text-gray-300 transition-all border border-white/10 hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isShabbat ? t('pricing.closed') : t('pricing.freeTrial')}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Promo Banner Injection */}
        <div className="mt-12">
            <PromoBanner onNavigate={onNavigate} />
        </div>

      </div>
    </div>
  );
};

export default Pricing;
