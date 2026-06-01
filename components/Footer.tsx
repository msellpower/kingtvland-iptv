import React from 'react';
import { Shield, Tv, Smartphone, Globe, Mail, MessageCircle, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { SystemSettings } from '../utils/timeLogic';
import { useLanguage } from '../i18n/LanguageContext';

interface FooterProps {
  onNavigate: (view: any, anchor?: string) => void;
  systemSettings: SystemSettings | null;
  onAdminClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, systemSettings, onAdminClick }) => {
  const { t, language, isRTL } = useLanguage();
  return (
    <footer className={`bg-slate-950 border-t border-slate-800 pt-10 pb-6 mt-10 md:pt-16 md:pb-8 md:mt-20 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Main Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 md:gap-12 md:mb-16">
                    {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Tv className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">KINGTVLAND</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex flex-wrap gap-2">
              {[t('footer.iptvIsrael'), t('footer.4kStreaming'), t('footer.vod'), t('footer.liveSports')].map((tag) => (
                <span key={tag} className="text-[10px] font-medium bg-slate-900 text-slate-400 px-2.5 py-1 rounded-full border border-slate-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              {t('footer.quickNav')}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t('footer.home'), view: 'home', id: 'hero' },
                { label: t('footer.hotDeals'), view: 'home', id: 'deals' },
                { label: t('nav.channels'), view: 'channels' },
                { label: t('nav.guides'), view: 'home', id: 'apps' },
                { label: t('nav.blog'), view: 'blog' },
              ].map((link) => (
                <li key={link.label}>
                  <button 
                    onClick={() => onNavigate(link.view as any, link.id)} 
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-purple-400 transition-colors"></span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Devices */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-pink-400" />
              {t('footer.downloadsDevices')}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t('footer.iptvAndroid'), view: 'android' },
                { label: t('footer.iptvSmartTV'), view: 'smart-tv' },
                { label: t('footer.iptvApple'), view: 'apple' },
                { label: t('footer.iptvPC'), view: 'pc' },
              ].map((link) => (
                <li key={link.view}>
                  <button 
                    onClick={() => onNavigate(link.view)} 
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-purple-400 transition-colors"></span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support & Help */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              {t('footer.helpCenter')}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t('footer.about'), view: 'about' },
                { label: t('footer.faq'), view: 'faq' },
                { label: t('footer.contact'), view: 'contact' },
                { label: t('footer.reportIssue'), view: 'report' },
                { label: t('footer.terms'), view: 'terms' },
                { label: t('footer.accessibility'), view: 'accessibility' },
              ].map((link) => (
                <li key={link.view}>
                  <button 
                    onClick={() => onNavigate(link.view)} 
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-purple-400 transition-colors"></span>
                    {link.label}
                  </button>
                </li>
              ))}
              <li className="pt-4 mt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>{systemSettings?.CONTACT_EMAIL || 'kingtvland@gmail.com'}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Footer Bottom */}
        <div className="border-t border-slate-800 pt-8 mt-8 relative pb-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 text-center lg:text-right">
            
            {/* Left Side: Copyright & Legal */}
            <div className="flex flex-col gap-2">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} <span className="text-white font-bold">KINGTVLAND</span>. {t('footer.copyright')}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs text-gray-600">
                  <span>{t('footer.wcag')}</span>
                  <span className="hidden sm:inline">|</span>
                  <span>{t('footer.en301549')}</span>
                  <span className="hidden sm:inline">|</span>
                  <span>{t('footer.ada')}</span>
                  <span className="hidden sm:inline">|</span>
                  <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">{t('footer.terms')}</button>
              </div>
            </div>

            {/* Admin Lock Icon (Discreet at the very bottom) */}
            <div className="absolute -bottom-2 translate-y-full left-1/2 -translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity">
                <button onClick={onAdminClick} className="p-2 text-gray-700 hover:text-cyan-600 transition-colors">
                    <Lock className="w-3 h-3" />
                </button>
            </div>

            {/* Right Side: Trust & Security */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-4 text-gray-500 text-xs bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-green-500" />
                  <span>{t('footer.securePayment')}</span>
                </div>
                <div className="w-px h-3 bg-slate-700"></div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                  <span>{t('footer.fullWarranty')}</span>
                </div>
              </div>

              {/* Payment Methods (Visual Representation) */}
              <div className="flex items-center gap-3 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center" title="PayPal">
                   <span className="font-bold text-white text-[10px] italic">PayPal</span>
                </div>
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center" title="Visa">
                   <span className="font-bold text-white text-[10px] italic">VISA</span>
                </div>
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center" title="Mastercard">
                   <span className="font-bold text-white text-[10px] italic">Master</span>
                </div>
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center" title="Bit">
                   <span className="font-bold text-white text-[10px] italic">Bit</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
