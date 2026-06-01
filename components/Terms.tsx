
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const Terms: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen space-gradient">
      <div className="max-w-4xl mx-auto glass-card p-8 rounded-3xl animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">{t('terms.title')}</h1>
        <div className="text-gray-300 space-y-6 text-sm leading-relaxed">
          <p>{t('terms.intro')}</p>
          
          <section>
            <h2 className="text-xl font-bold text-cyan-400 mt-4 mb-2">{t('terms.s1.title')}</h2>
            <p>{t('terms.s1.desc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-cyan-400 mt-4 mb-2">{t('terms.s2.title')}</h2>
            <p>{t('terms.s2.desc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-cyan-400 mt-4 mb-2">{t('terms.s3.title')}</h2>
            <p>{t('terms.s3.desc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-cyan-400 mt-4 mb-2">{t('terms.s4.title')}</h2>
            <p>{t('terms.s4.desc')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-cyan-400 mt-4 mb-2">{t('terms.s5.title')}</h2>
            <p>{t('terms.s5.desc')}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
