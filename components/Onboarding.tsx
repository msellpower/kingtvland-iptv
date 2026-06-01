import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Tv, Zap, Shield, Gift } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const Onboarding: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding_v1');
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      title: isRTL ? 'ברוכים הבאים ל-KINGTVLAND' : 'Welcome to KINGTVLAND',
      description: isRTL ? 'פלטפורמת הסטרימינג המתקדמת בעולם. הכל במקום אחד.' : 'The most advanced streaming platform in the world. All in one place.',
      icon: <Tv className="w-12 h-12 text-indigo-400" />,
      color: 'from-indigo-600 to-purple-600'
    },
    {
      title: isRTL ? 'שידור ללא עצירות' : 'Uninterrupted Streaming',
      description: isRTL ? 'טכנולוגיית השרתים שלנו מבטיחה צפייה חלקה ב-4K ללא עיכובים.' : 'Our server technology ensures smooth 4K viewing with zero lag.',
      icon: <Zap className="w-12 h-12 text-yellow-400" />,
      color: 'from-yellow-600 to-orange-600'
    },
    {
      title: isRTL ? 'אבטחה מקסימלית' : 'Maximum Security',
      description: isRTL ? 'תשלום מאובטח באמצעות קריפטו, PayPal וזיהוי משתמש חכם.' : 'Secure payment via Crypto, PayPal, and smart user identification.',
      icon: <Shield className="w-12 h-12 text-cyan-400" />,
      color: 'from-cyan-600 to-blue-600'
    },
    {
      title: isRTL ? 'מוכנים להתחיל?' : 'Ready to Start?',
      description: isRTL ? 'בחרו חבילה עוד היום והצטרפו לאלפי משתמשים מרוצים.' : 'Choose a plan today and join thousands of satisfied users.',
      icon: <Gift className="w-12 h-12 text-pink-400" />,
      color: 'from-pink-600 to-rose-600'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding_v1', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={completeOnboarding}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <button 
            onClick={completeOnboarding}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>

          <div className={`h-2 w-full bg-slate-800`}>
            <motion.div 
              className={`h-full bg-gradient-to-r ${steps[currentStep].color}`}
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/5"
              >
                {steps[currentStep].icon}
              </motion.div>

              <motion.h2 
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-black text-white mb-4"
              >
                {steps[currentStep].title}
              </motion.h2>

              <motion.p 
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-400 text-lg leading-relaxed mb-10 max-w-sm"
              >
                {steps[currentStep].description}
              </motion.p>

              <div className="flex items-center justify-between w-full gap-4">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all ${
                    currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  {isRTL ? 'הקודם' : 'Back'}
                </button>

                <button
                  onClick={handleNext}
                  className={`flex items-center gap-2 bg-gradient-to-r ${steps[currentStep].color} text-white font-black px-8 py-3 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95`}
                >
                  {currentStep === steps.length - 1 ? (isRTL ? 'מתחילים!' : 'Let\'s Go!') : (isRTL ? 'הבא' : 'Next')}
                  {currentStep < steps.length - 1 && (isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)}
                </button>
              </div>

              <div className="mt-8 flex gap-2">
                {steps.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Onboarding;
