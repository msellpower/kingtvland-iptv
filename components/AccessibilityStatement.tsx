import React from 'react';
import { CheckCircle, Shield, Globe, Accessibility, Eye, MousePointer, Layout } from 'lucide-react';
import SEO from './SEO';
import { useLanguage } from '../i18n/LanguageContext';

const AccessibilityStatement: React.FC = () => {
  const { t, language, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? "rtl" : "ltr"}>
      <SEO 
        title={t('accessibility.title') + " - KINGTVLAND"}
        description={t('accessibility.intro')}
        keywords={language === 'he' ? ['הצהרת נגישות', 'נגישות אתרים', 'WCAG 2.1', 'ADA compliance', 'תקן נגישות'] : ['Accessibility Statement', 'Web Accessibility', 'WCAG 2.1', 'ADA compliance', 'Accessibility Standard']}
        canonical="https://kingtvland-iptv.netlify.app/?view=accessibility"
        url="https://kingtvland-iptv.netlify.app/?view=accessibility"
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600/20 rounded-full shadow-lg border border-blue-500/30">
              <Accessibility className="w-16 h-16 text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{t('accessibility.title')}</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('accessibility.intro')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Standards Compliance Section */}
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              {t('accessibility.standards.title')}
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('accessibility.standards.desc')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">{t('accessibility.standards.eu.title')}</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  {t('accessibility.standards.eu.desc')}
                </p>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-bold text-white">{t('accessibility.standards.us.title')}</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  {t('accessibility.standards.us.desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">{t('accessibility.features.title')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Eye,
                  title: t('accessibility.features.visual.title'),
                  desc: t('accessibility.features.visual.desc')
                },
                {
                  icon: MousePointer,
                  title: t('accessibility.features.keyboard.title'),
                  desc: t('accessibility.features.keyboard.desc')
                },
                {
                  icon: Layout,
                  title: t('accessibility.features.structure.title'),
                  desc: t('accessibility.features.structure.desc')
                },
                {
                  icon: CheckCircle,
                  title: t('accessibility.features.browsers.title'),
                  desc: t('accessibility.features.browsers.desc')
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="mt-1">
                    <item.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">{t('accessibility.disclaimer.title')}</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              {t('accessibility.disclaimer.desc1')}
            </p>
            <p className="text-gray-300 mb-6">
              {t('accessibility.disclaimer.desc2')}
            </p>
            <div className="bg-slate-900/50 p-4 rounded-xl inline-block pr-8 border border-slate-600/30">
              <ul className="space-y-2 text-gray-300">
                <li><strong>{t('accessibility.contact.officer')}</strong> {t('accessibility.contact.team')}</li>
                <li><strong>{t('accessibility.contact.email')}</strong> <a href="mailto:accessibility@kingtvland.com" className="text-purple-400 hover:underline">accessibility@kingtvland.com</a></li>
                <li><strong>{t('accessibility.contact.date')}</strong> 01/03/2026</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityStatement;
