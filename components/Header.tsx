
import React, { useState } from 'react';
import { UserSession } from '../types';
import { adminLogin } from '../services/sheetService';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../i18n/LanguageContext';
import { NotificationBell } from './NotificationBell';

import { SystemSettings } from '../utils/timeLogic';

interface HeaderProps {
  settings?: SystemSettings | null;
  user: UserSession | null;
  onLoginClick: () => void;
  onNavigate: (view: any, anchor?: string) => void;
  onJoinClick: () => void;
  onLogout: () => void;
  onAdminLogin: () => void;
  currentView: string;
  promoText?: string;
  isSupportActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ settings, user, onLoginClick, onNavigate, onJoinClick, onLogout, onAdminLogin, currentView, promoText, isSupportActive }) => {
  const { t, language, setLanguage } = useLanguage();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [checking, setChecking] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavigate = (view: any) => {
      onNavigate(view);
      setIsMobileMenuOpen(false);
      if (view !== 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const MobileLink = ({ view, label, className }: {view: string, label: string, className?: string}) => (
      <button 
        onClick={() => handleMobileNavigate(view)}
        className={`text-lg font-bold py-3 w-full text-center border-b border-white/5 transition-colors ${currentView === view ? 'text-cyan-400 bg-white/5' : 'text-gray-300 hover:text-white'} ${className}`}
      >
          {label}
      </button>
  );

  return (
    <>
    {promoText && (
        <div className="fixed top-0 w-full z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center text-xs md:text-sm font-bold py-1.5 px-4 shadow-lg animate-fade-in h-8 md:h-10 flex items-center justify-center">
            {promoText}
        </div>
    )}
    <header className={`fixed ${promoText ? 'top-8 md:top-10' : 'top-0 md:top-6'} w-full z-30 glass-panel border-b border-white/10 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full gap-1 sm:gap-4 relative">
          
          {/* Logo & Status */}
          <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate('home')}>
                <span className="text-lg sm:text-xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
                  KINGTV
                </span>
              </div>
              
              {/* Server Statuses (Grid) */}
              <div className="hidden md:grid grid-cols-2 gap-2 bg-black/50 p-2 rounded-lg border border-white/10">
                  {Object.entries((settings?.serverStatuses as Record<string, any>) || {
                      plan1: { label: 'KING', status: 'online' },
                      plan2: { label: 'ISRAEL', status: 'online' },
                      plan3: { label: 'PREMIUM', status: 'online' },
                  }).map(([key, server]) => {
                       const colors = server.status === 'crashed' 
                        ? { ping: 'bg-red-400', bg: 'bg-red-500', text: 'text-red-400' }
                        : server.status === 'maintenance'
                        ? { ping: 'bg-yellow-400', bg: 'bg-yellow-500', text: 'text-yellow-400' }
                        : { ping: 'bg-green-400', bg: 'bg-green-500', text: 'text-green-400' };
                      return (
                          <div key={key} className="flex items-center gap-1.5 min-w-[60px]">
                              <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.ping} opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${colors.bg}`}></span>
                              </span>
                              <span className={`text-[10px] ${colors.text} font-bold uppercase tracking-wider whitespace-nowrap`}>{server.label}</span>
                          </div>
                      );
                  })}
              </div>

              {/* Support Status Badge */}
              <div className="hidden md:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                <div className={`w-2 h-2 rounded-full ${isSupportActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest whitespace-nowrap">
                  {isSupportActive ? t('support.status.online') : t('support.status.offline')}
                </span>
              </div>
          </div>

          {/* Unified Menu Button - Centered in flex */}
          <div className="flex justify-center px-2 flex-grow min-w-0 pointer-events-none">
            <div className="hidden lg:flex items-center gap-6 mr-6 pointer-events-auto">
                <button 
                  onClick={() => onNavigate('about')}
                  className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-cyan-400 ${currentView === 'about' ? 'text-cyan-400' : 'text-gray-300'}`}
                >
                  {t('nav.about')}
                </button>
                <button 
                  onClick={() => onNavigate('home', 'pricing')}
                  className="text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-cyan-400 transition-all"
                >
                  {t('nav.pricing')}
                </button>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="pointer-events-auto w-auto flex-shrink min-w-[80px] md:max-w-xs group flex items-center justify-center gap-1.5 md:gap-3 px-3 py-1.5 md:px-8 md:py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white rounded-full font-black transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] active:scale-95 border border-white/20 animate-shimmer"
            >
              <div className="relative">
                <svg className="w-4 h-4 md:w-6 md:h-6 transition-transform group-hover:rotate-180 duration-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <span className="text-[10px] md:text-xl tracking-widest uppercase truncate">{t('nav.menu' as any) || 'MENU'}</span>
            </button>

            <div className="hidden lg:flex items-center gap-6 ml-6 pointer-events-auto">
                <button 
                  onClick={() => onNavigate('channels')}
                  className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-cyan-400 ${currentView === 'channels' ? 'text-cyan-400' : 'text-gray-300'}`}
                >
                  {t('nav.channels')}
                </button>
                <button 
                  onClick={() => onNavigate('blog')}
                  className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-cyan-400 ${currentView === 'blog' ? 'text-cyan-400' : 'text-gray-300'}`}
                >
                  {t('nav.blog')}
                </button>
            </div>
          </div>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-2 sm:gap-3 justify-end flex-shrink-0 min-w-0">
            {/* Language Switcher & Notification - Hidden on very small mobile, visible on desktop */}
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <NotificationBell />
              <div className="flex items-center bg-white/5 rounded-full p-0.5 sm:p-1 border border-white/10 flex-shrink-0">
                <button 
                  onClick={() => setLanguage('he')}
                className={`px-1.5 sm:px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all ${language === 'he' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                HE
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-1.5 sm:px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all ${language === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <button 
                  onClick={() => onNavigate('profile')} 
                  className="text-gray-300 hover:text-white text-sm font-bold px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all"
                >
                  {t('nav.profile')}
                </button>
              ) : (
                <button 
                  onClick={onLoginClick} 
                  className="text-gray-300 hover:text-white text-sm font-bold px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>



    </header>

    {/* Menu Drawer */}
    <div className={`fixed inset-0 z-[1000] ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
            className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Drawer */}
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-slate-900 border-l border-white/10 shadow-2xl transform transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6 flex flex-col h-full overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
                            {t('app.brandName' as any) || 'KINGTVLAND'}
                        </span>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10 sm:hidden">
                                <button onClick={() => setLanguage('he')} className={`px-2 py-1 rounded-full text-[10px] font-bold ${language === 'he' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>HE</button>
                                <button onClick={() => setLanguage('en')} className={`px-2 py-1 rounded-full text-[10px] font-bold ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>EN</button>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                
                <nav className="flex flex-col gap-2 flex-grow">
                    {user ? (
                        <div className="bg-white/5 p-4 rounded-xl mb-4 text-center border border-white/10">
                            <p className="text-gray-400 text-sm mb-2">{t('nav.loggedInAs')} <span className="text-white font-bold">{user.email.split('@')[0]}</span></p>
                            <div className="flex gap-3 justify-center mb-3">
                                <button onClick={() => handleMobileNavigate('profile')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold w-full">{t('nav.profile')}</button>
                                <button onClick={() => handleMobileNavigate('promotions')} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold w-full">{t('nav.promos')}</button>
                            </div>
                            <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="text-red-400 hover:text-red-300 text-sm font-bold flex items-center justify-center gap-2 w-full py-2 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                {t('nav.logout')}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/5 p-4 rounded-xl mb-4 grid grid-cols-2 gap-3 border border-white/10">
                            <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="text-white border border-white/20 px-2 py-2 rounded-lg text-sm font-bold w-full hover:bg-white/5 transition-colors">{t('nav.login')}</button>
                            <button onClick={() => { onJoinClick(); setIsMobileMenuOpen(false); }} className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-2 rounded-lg text-sm font-bold w-full shadow-lg shadow-purple-500/20 transition-all">{t('nav.join')}</button>
                        </div>
                    )}

                    {currentView === 'home' ? (
                        <>
                            <button 
                                onClick={() => { onNavigate('home', 'pricing'); setIsMobileMenuOpen(false); }}
                                className="text-lg font-bold py-3 w-full text-center border-b border-white/5 text-gray-300 hover:text-white transition-colors"
                            >
                                {t('app.homeTab.plans')}
                            </button>
                            <button 
                                onClick={() => { onNavigate('home', 'vod'); setIsMobileMenuOpen(false); }}
                                className="text-lg font-bold py-3 w-full text-center border-b border-white/5 text-gray-300 hover:text-white transition-colors"
                            >
                                {t('app.homeTab.vod')}
                            </button>
                            <button 
                                onClick={() => { onNavigate('home', 'apps'); setIsMobileMenuOpen(false); }}
                                className="text-lg font-bold py-3 w-full text-center border-b border-white/5 text-gray-300 hover:text-white transition-colors"
                            >
                                {t('app.homeTab.recommended')}
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
                            className="flex items-center gap-2 text-cyan-400 font-bold text-lg mb-2 w-full border-b border-white/10 pb-3 hover:bg-white/5 transition-colors rounded-lg px-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            {t('nav.backToHome')}
                        </button>
                    )}

                    {/* <MobileLink view="store" label="חנות DUKHIFAT" className="text-purple-400/90 font-black border-purple-500/20" /> */}
                    <MobileLink view="about" label={t('nav.about')} className="text-cyan-400 group-hover:bg-cyan-500/10" />
                    <MobileLink view="channels" label={t('nav.channels')} />
                    <MobileLink view="blog" label={t('nav.blog')} className="text-indigo-400/90" />
                    <MobileLink view="resellers" label={t('nav.resellers')} className="text-yellow-400/90" />
                    <MobileLink view="guides" label={t('nav.guides')} />
                    <MobileLink view="request" label={t('nav.requestContent')} className="text-pink-400/90" />
                    <MobileLink view="report" label={t('nav.reportIssue')} />
                    <MobileLink view="terms" label={t('footer.terms')} />
                </nav>
            </div>
        </div>
    </div>
    </>
  );
};

export default Header;
