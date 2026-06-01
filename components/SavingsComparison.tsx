
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PLANS } from '../constants';

const SavingsComparison: React.FC = () => {
  const { t, isRTL } = useLanguage();
  
  const enabledPlans = PLANS.filter(p => p.enabled !== false);
  const [activePlanId, setActivePlanId] = useState<string>(enabledPlans[0]?.id || 'king');

  const comparisonData = {
    TRADITIONAL: {
      name: isRTL ? 'חברות הכבלים/לוויין' : 'Traditional TV',
      price: 250,
      features: [
        { text: isRTL ? 'חבילות ספורט בתוספת תשלום כבד' : 'Sports packages extra cost', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
        { text: isRTL ? 'ממירים יקרים בכל חדר' : 'Expensive boxes in every room', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
        { text: isRTL ? 'התחייבות ארוכת טווח' : 'Long-term commitment', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
        { text: isRTL ? 'שירות לקוחות איטי' : 'Slow support', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
      ]
    }
  };

  const currentPlan = enabledPlans.find(p => p.id === activePlanId) || enabledPlans[0];
  const monthlyTraditional = comparisonData.TRADITIONAL.price;
  const monthlyKing = Math.ceil((currentPlan?.priceNew || 250) / 12);
  const monthlySavings = monthlyTraditional - monthlyKing;
  const yearlySavings = monthlySavings * 12;

  // Features to show depending on the plan chosen.
  // We take the first 4 features to keep it aligned with Traditional TV's 4 items limit roughly.
  const planFeatures = (currentPlan?.features || []).slice(0, 4).map(f => ({
    text: f,
    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
  }));

  // Ensure we always show something
  if (planFeatures.length === 0) {
      planFeatures.push({ text: isRTL ? 'ללא צורך בממיר' : 'No box needed', icon: <CheckCircle2 className="w-4 h-4 text-green-500" />});
      planFeatures.push({ text: isRTL ? 'ללא התחייבות' : 'No commitment', icon: <CheckCircle2 className="w-4 h-4 text-green-500" />});
  }

  return (
    <section className="py-20 relative overflow-hidden bg-slate-950">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-6"
          >
            <TrendingDown className="w-4 h-4" />
            {isRTL ? 'למה לשלם יותר?' : 'Why pay more?'}
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
            {isRTL ? 'הפסק להיות עשוק' : 'STOP BEING EXPLOITED'}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {isRTL 
              ? 'השוואה פשוטה שמראה כמה כסף אתם זורקים על חברות התקשורת המסורתיות בכל שנה. המהפכה מתחילה כאן.' 
              : 'A simple comparison showing how much money you waste on traditional telecom every year. The revolution starts here.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
            {/* Traditional Card */}
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-6 md:p-10 border border-red-500/10 hover:border-red-500/20 transition-all rounded-3xl bg-slate-900/50 flex flex-col pt-[104px] md:pt-[104px]" // Added padding to align with KINGTV card's plan switcher
          >
            <div className="flex flex-row justify-between items-start gap-4 mb-8">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1 md:mb-2 truncate">{comparisonData.TRADITIONAL.name}</h3>
                <p className="text-red-400 font-bold text-[10px] sm:text-xs md:text-sm uppercase tracking-wider leading-tight">{isRTL ? 'המחיר שאתם משלמים היום' : 'The price you pay today'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-3xl sm:text-4xl font-black text-white">₪{monthlyTraditional}</span>
                <span className="text-gray-500 text-xs sm:text-sm block">/{isRTL ? 'חודש' : 'mo'}</span>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 mb-10">
              {comparisonData.TRADITIONAL.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <span className="text-gray-300 text-xs md:text-sm leading-tight">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="p-6 md:p-8 bg-red-500/10 rounded-2xl border border-red-500/20 text-center mt-auto">
              <p className="text-red-400 font-bold text-2xl md:text-3xl mb-1">₪{monthlyTraditional * 12}</p>
              <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-widest">{isRTL ? 'עלות שנתית ממוצעת' : 'Avg. Yearly Cost'}</p>
            </div>
          </motion.div>

          {/* KINGTV Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass-panel p-6 md:p-10 border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] rounded-3xl bg-slate-900/80 overflow-hidden flex flex-col"
          >
            {/* Plan Switcher (Tabs) */}
            <div className="w-full mb-6">
              <div className="grid auto-cols-fr grid-flow-col gap-1 w-full p-1 bg-black/40 rounded-xl md:rounded-full border border-white/10">
                {enabledPlans.map(plan => (
                  <button 
                    key={plan.id}
                    onClick={() => setActivePlanId(plan.id)}
                    className={`px-1 py-2 sm:px-2 md:px-4 rounded-lg md:rounded-full text-[10px] sm:text-xs md:text-sm font-bold transition-all text-center flex items-center justify-center min-w-0 ${activePlanId === plan.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="truncate">{plan.name.replace('מנוי ', '')}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-row justify-between items-start gap-4 mb-8">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1 md:mb-2 truncate">KINGTVLAND</h3>
                <p className="text-cyan-400 font-bold text-[10px] sm:text-xs md:text-sm uppercase tracking-wider leading-tight">{isRTL ? 'המהפכה הדיגיטלית' : 'The Digital Revolution'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-3xl sm:text-4xl font-black text-white">₪{monthlyKing}</span>
                <span className="text-gray-500 text-xs sm:text-sm block">/{isRTL ? 'חודש' : 'mo'}</span>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 mb-8 flex-1">
              {planFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <span className="text-gray-300 text-xs md:text-sm leading-tight">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl text-center relative overflow-hidden group mt-auto">
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex justify-center items-center gap-2 mb-1">
                   <TrendingUp className="w-5 h-5 text-cyan-300 flex-shrink-0" />
                   <p className="text-white font-black text-2xl md:text-3xl">₪{yearlySavings}</p>
                </div>
                <p className="text-indigo-100 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest">{isRTL ? 'חיסכון שנתי מטורף!' : 'CRAZY YEARLY SAVINGS!'}</p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* CTA Banner */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mt-12 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center animate-pulse">
               <ArrowRight className={`w-6 h-6 text-white ${isRTL ? 'rotate-180' : ''}`} />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{isRTL ? 'מוכן להצטרף למהפכה?' : 'Ready to join the revolution?'}</p>
              <p className="text-gray-400 text-sm">{isRTL ? 'אלפי ישראלים כבר חוסכים אלפי שקלים בשנה.' : 'Thousands of Israelis are already saving thousands per year.'}</p>
            </div>
          </div>
          <button 
            className="w-full md:w-auto px-10 py-4 bg-white text-black font-black rounded-full hover:bg-cyan-400 transition-colors uppercase tracking-tight active:scale-95 shadow-xl"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {isRTL ? 'אני רוצה להפסיק לשלם סתם' : 'I want to stop overpaying'}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default SavingsComparison;
