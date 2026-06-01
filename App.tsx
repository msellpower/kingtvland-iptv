import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import KingTVLandHero from './components/KingTVLandHero';
import Pricing from './components/Pricing';
import AppsGuide from './components/AppsGuide';
import RecommendedApps from './components/RecommendedApps';
import SupportMenu from './components/SupportMenu';
import PurchaseModal from './components/PurchaseModal';
import LoginModal from './components/LoginModal';
import JoinModal from './components/JoinModal';
import Profile from './components/Profile';
import Promotions from './components/Promotions';
import ChannelsViewer from './components/ChannelsViewer';
import ReportIssue from './components/ReportIssue';
import RequestContent from './components/RequestContent';
import AdminDashboard from './components/AdminDashboard';
import ContentShowcase from './components/ContentShowcase';
import ResellerProgram from './components/ResellerProgram';
import Terms from './components/Terms';
import DealsSection from './components/DealsSection';
import ChatBot from './components/ChatBot';
import Blog from './components/Blog';
import ScrollToTop from './components/ScrollToTop';
import ScrollProgress from './components/ScrollProgress';
import RegisterModal from './components/RegisterModal';
import MarketingPopupDisplay from './components/MarketingPopupDisplay';
import ResetPasswordModal from './components/ResetPasswordModal';
import ThankYouPage from './components/ThankYouPage';
import PurchaseTermsModal from './components/PurchaseTermsModal';
import Footer from './components/Footer';
import SEO from './components/SEO';
import { Toaster, toast } from 'react-hot-toast';
import Spinner from './components/Spinner';
import { Plan, CustomerType, UserSession, ServiceLevel, Subscription } from './types';
import * as dataService from './services/dataService';
import { checkSystemStatus, SystemSettings } from './utils/timeLogic';
import ShabbatOverlay from './components/ShabbatOverlay';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

import DeviceLandingPage from './components/DeviceLandingPage';
import About from './components/About';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import AccessibilityStatement from './components/AccessibilityStatement';
import AccessibilityWidget from './components/AccessibilityWidget';

import Store from './components/Store';
import Onboarding from './components/Onboarding';
import AuthNudge from './components/AuthNudge';
import SavingsComparison from './components/SavingsComparison';

type ViewState = 'home' | 'profile' | 'promotions' | 'channels' | 'report' | 'request' | 'admin' | 'guides' | 'resellers' | 'terms' | 'blog' | 'thankyou' | 'android' | 'smart-tv' | 'apple' | 'pc' | 'about' | 'faq' | 'contact' | 'accessibility' | 'renew' | 'store';

function MainApp() {
  const { t, language, isRTL } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false); 
  const [registerOpen, setRegisterOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerType>(CustomerType.NEW);
  const [selectedServiceLevel, setSelectedServiceLevel] = useState<ServiceLevel>(ServiceLevel.VIP);
  const [isLocked, setIsLocked] = useState(false);
  
  // Auth & Routing State
  const [user, setUser] = useState<UserSession | null>(() => {
    if (localStorage.getItem('adminMode') === 'true') {
      return { email: 'admin@kingtvland.com', subscriptions: [], role: 'admin' };
    }
    return null;
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [viewAnchor, setViewAnchor] = useState<string | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const systemSettingsRef = useRef<SystemSettings | null>(null);
  const [systemStatus, setSystemStatus] = useState({ isShabbat: false, isSupportActive: true, isServiceActive: true, isMaintenance: false });

  // Effect to detect password reset token in URL and handle navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('resetToken');
    const view = urlParams.get('view') as ViewState;
    const username = urlParams.get('username');
    
    if (window.location.pathname === '/thankyou') {
      setCurrentView('thankyou');
    } else if (token) {
      setResetToken(token);
      setResetPasswordOpen(true);
      // Clean the URL to remove the token
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (view === 'renew' && username) {
      const renewalPlan: Plan = {
        id: 'renew-auto',
        name: t('app.renewalPlanName'),
        priceNew: 250, // Default price, will be adjusted in modal
        priceExisting: 250,
        period: t('app.renewalPeriod'),
        features: [],
        isPopular: true
      };
      setSelectedPlan(renewalPlan);
      setSelectedCustomerType(CustomerType.EXISTING);
      setModalOpen(true);
      // We also need to pass the username to the modal.
      // I'll add a state for initialUsername.
      setInitialUsername(username);
      
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    } else if (view) {
      const anchor = urlParams.get('anchor');
      setCurrentView(view);
      if (anchor) setViewAnchor(anchor);
    }
  }, []);

  const handleNavigate = (view: ViewState, anchor?: string) => {
    if (view === currentView && anchor) {
      // If we are already on the view, just scroll
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    
    setCurrentView(view);
    if (anchor) {
      setViewAnchor(anchor);
    } else {
      setViewAnchor(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (viewAnchor) {
      const timer = setTimeout(() => {
        const element = document.getElementById(viewAnchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150); // Slightly longer delay for stability
      return () => clearTimeout(timer);
    }
  }, [currentView, viewAnchor]);

  const [initialUsername, setInitialUsername] = useState<string>('');

  // Update URL when view changes
  useEffect(() => {
    if (currentView === 'home') {
      window.history.pushState({}, '', '/');
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('view', currentView);
      if (viewAnchor) {
        url.searchParams.set('anchor', viewAnchor);
      } else {
        url.searchParams.delete('anchor');
      }
      window.history.pushState({}, '', url.toString());
    }
  }, [currentView, viewAnchor]);

  useEffect(() => {
    const initSystem = async () => {
      try {
        const settings = await dataService.getPublicSettings();
        if (settings) {
          systemSettingsRef.current = settings;
          setSystemSettings(settings);
          setSystemStatus(checkSystemStatus(settings));
        } else {
          systemSettingsRef.current = null;
          setSystemStatus(checkSystemStatus(null));
        }
      } catch (e) {
        setSystemStatus(checkSystemStatus(null));
      }
    };
    initSystem();

    const interval = setInterval(() => {
      setSystemStatus(prev => {
        const newStatus = checkSystemStatus(systemSettingsRef.current);
        if (newStatus.isShabbat !== prev.isShabbat || 
            newStatus.isSupportActive !== prev.isSupportActive || 
            newStatus.isServiceActive !== prev.isServiceActive ||
            newStatus.isMaintenance !== prev.isMaintenance) {
          return newStatus;
        }
        return prev;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ... (rest of useEffects)

  const handleRequestTrial = (plan: Plan) => {
      setSelectedPlan(plan);
      setJoinOpen(true);
      // We need to tell JoinModal it's a trial. 
      // I'll add a state for isTrialMode
  };
  const [isTrialMode, setIsTrialMode] = useState(false);
  const [isPurchaseTermsOpen, setPurchaseTermsOpen] = useState(false);
  const [pendingPurchaseAction, setPendingPurchaseAction] = useState<(() => void) | null>(null);

  // Update handleSelectPlan to reset trial mode and show terms first
  const handleSelectPlan = (plan: Plan, type: CustomerType, serviceLevel: ServiceLevel) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setPendingPurchaseAction(() => () => {
      setSelectedPlan(plan);
      setSelectedCustomerType(type);
      setSelectedServiceLevel(serviceLevel);
      setModalOpen(true);
      setIsTrialMode(false);
      setPurchaseTermsOpen(false);
    });
    setPurchaseTermsOpen(true);
  };

  // Update handleRequestTrial to show terms first
  const onRequestTrial = (plan: Plan) => {
      if (!user) {
        setLoginOpen(true);
        return;
      }
      setPendingPurchaseAction(() => () => {
        setSelectedPlan(plan);
        setIsTrialMode(true);
        setJoinOpen(true);
        setPurchaseTermsOpen(false);
      });
      setPurchaseTermsOpen(true);
  };

  const handleStartNow = (action?: () => void) => {
    if (!user) {
      setLoginOpen(true);
    } else if (action) {
      action();
    } else {
      handleNavigate('home', 'pricing');
    }
  };

  const [homeTab, setHomeTab] = useState<'hero' | 'vod' | 'pricing' | 'recommended'>('hero');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const Content = () => {
    switch (currentView) {
      case 'profile':
        if (!user) {
          setLoginOpen(true);
          setCurrentView('home');
          return null;
        }
        return (
          <>
            <SEO 
              title={t('seo.profile.title')} 
              description={t('seo.profile.description')}
              canonical="https://kingtvland-iptv.netlify.app/?view=profile"
              url="https://kingtvland-iptv.netlify.app/?view=profile"
            />
            <Profile user={user} />
          </>
        );
      case 'promotions':
        return (
          <>
            <SEO 
              title={t('seo.promotions.title')} 
              description={t('seo.promotions.description')}
              keywords={t('seo.promotions.keywords')?.split(',') || []}
              canonical="https://kingtvland-iptv.netlify.app/?view=promotions"
              url="https://kingtvland-iptv.netlify.app/?view=promotions"
            />
            <Promotions user={user} onAuthRequired={() => handleStartNow()} />
          </>
        );
      case 'channels':
        return (
          <>
            <SEO 
              title={t('seo.channels.title')} 
              description={t('seo.channels.description')}
              keywords={t('seo.channels.keywords')?.split(',') || []}
              canonical="https://kingtvland-iptv.netlify.app/?view=channels"
              url="https://kingtvland-iptv.netlify.app/?view=channels"
            />
            <ChannelsViewer onNavigate={setCurrentView} systemSettings={systemSettings} />
          </>
        );
      case 'report':
        return (
          <>
            <SEO 
              title={t('seo.report.title')} 
              description={t('seo.report.description')}
              canonical="https://kingtvland-iptv.netlify.app/?view=report"
              url="https://kingtvland-iptv.netlify.app/?view=report"
            />
            <ReportIssue />
          </>
        );
      case 'request':
        return (
          <>
            <SEO 
              title={t('seo.request.title')} 
              description={t('seo.request.description')}
              canonical="https://kingtvland-iptv.netlify.app/?view=request"
              url="https://kingtvland-iptv.netlify.app/?view=request"
            />
            <RequestContent />
          </>
        );
      case 'admin':
        if (user?.role !== 'admin') {
          return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f0c29]">
              <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold text-red-400 mb-4">{t('app.accessDenied')}</h2>
                <p className="text-gray-400 mb-6">{t('app.noPermission')}</p>
                <button onClick={() => setCurrentView('home')} className="bg-indigo-600 px-6 py-2 rounded-lg font-bold">{t('app.backToHome')}</button>
              </div>
            </div>
          );
        }
        return (
          <>
            <SEO 
              title={t('seo.admin.title')} 
              description={t('seo.admin.description')}
              canonical="https://kingtvland-iptv.netlify.app/?view=admin"
              url="https://kingtvland-iptv.netlify.app/?view=admin"
            />
            <AdminDashboard 
              token={authToken}
              onLogout={() => {
                setUser(null);
                setAuthToken(null);
                localStorage.removeItem('authToken');
                localStorage.removeItem('adminMode');
                setCurrentView('home');
              }} 
            />
          </>
        );
      case 'guides':
        return (
          <>
            <SEO 
              title={t('seo.guides.title')} 
              description={t('seo.guides.description')}
              keywords={t('seo.guides.keywords')?.split(',') || []}
              canonical="https://kingtvland-iptv.netlify.app/?view=guides"
              url="https://kingtvland-iptv.netlify.app/?view=guides"
            />
            <AppsGuide onNavigate={handleNavigate} anchor={viewAnchor} />
          </>
        );
      case 'resellers':
        return (
          <>
            <SEO 
              title={t('seo.resellers.title')} 
              description={t('seo.resellers.description')}
              keywords={t('seo.resellers.keywords')?.split(',') || []}
              canonical="https://kingtvland-iptv.netlify.app/?view=resellers"
              url="https://kingtvland-iptv.netlify.app/?view=resellers"
            />
            <ResellerProgram onNavigate={handleNavigate} />
          </>
        );
      case 'terms':
        return (
          <>
            <SEO 
              title={t('seo.terms.title')} 
              description={t('seo.terms.description')}
              canonical="https://kingtvland-iptv.netlify.app/?view=terms"
              url="https://kingtvland-iptv.netlify.app/?view=terms"
            />
            <Terms />
          </>
        );
      case 'blog':
        return (
          <>
            <SEO 
              title={t('seo.blog.title')} 
              description={t('seo.blog.description')}
              canonical="https://kingtvland-iptv.netlify.app/?view=blog"
              url="https://kingtvland-iptv.netlify.app/?view=blog"
            />
            <Blog />
          </>
        );
      case 'store':
        return (
          <>
            <SEO 
              title={t('seo.store.title')} 
              description={t('seo.store.description')}
              canonical="https://kingtvland-iptv.netlify.app/?view=store"
              url="https://kingtvland-iptv.netlify.app/?view=store"
            />
            <Store />
          </>
        );
      case 'thankyou':
        return (
          <>
            <SEO 
              title={t('seo.thankyou.title')} 
              description={t('seo.thankyou.description')}
              canonical="https://kingtvland-iptv.netlify.app/?view=thankyou"
              url="https://kingtvland-iptv.netlify.app/?view=thankyou"
            />
            <ThankYouPage onNavigate={setCurrentView} />
          </>
        );
      case 'android':
      case 'smart-tv':
      case 'apple':
      case 'pc':
        return <DeviceLandingPage type={currentView} onNavigate={setCurrentView} />;
      case 'about':
        return <About onStartNow={() => handleStartNow()} />;
      case 'faq':
        return <FAQ />;
      case 'contact':
        return <Contact systemSettings={systemSettings} />;
      case 'accessibility':
        return <AccessibilityStatement />;
      case 'renew':
      case 'home':
      default:
        return (
          <>
            <SEO 
              title={systemSettings?.SITE_TITLE || t('seo.default.title')} 
              description={systemSettings?.SITE_DESCRIPTION || t('seo.default.description')}
              keywords={t('seo.default.keywords')?.split(',') || []}
              canonical="https://kingtvland-iptv.netlify.app/"
              schema={[
                {
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  "name": "KINGTVLAND",
                  "url": "https://kingtvland-iptv.netlify.app",
                  "logo": "https://kingtvland-iptv.netlify.app/logo.png",
                  "description": systemSettings?.SITE_DESCRIPTION || t('seo.default.description'),
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": systemSettings?.WHATSAPP_NUMBER ? `+${systemSettings.WHATSAPP_NUMBER}` : "+972-50-000-0000",
                    "contactType": "customer service"
                  }
                },
                {
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "name": "KINGTVLAND",
                  "url": "https://kingtvland-iptv.netlify.app"
                },
                {
                  "@context": "https://schema.org",
                  "@type": "Product",
                  "name": "KINGTVLAND Subscriptions",
                  "description": "Premium TV subscriptions including King, VOD, Israel, and Premium plans",
                  "brand": {
                    "@type": "Brand",
                    "name": "KINGTVLAND"
                  },
                  "offers": {
                    "@type": "AggregateOffer",
                    "lowPrice": "150",
                    "highPrice": "350",
                    "priceCurrency": "ILS",
                    "offerCount": "4"
                  }
                }
              ]}
            />
            
            {/* Mobile Tab Navigation (Scroll Links) */}
            <div className={`md:hidden sticky ${systemSettings?.PROMO_BANNER_TEXT ? 'top-[96px]' : 'top-[64px]'} z-40 bg-[#0f0c29]/95 backdrop-blur-md border-b border-white/10 px-2 py-3 transition-all duration-300`}>
              <div className="flex justify-between items-center bg-white/10 rounded-2xl p-1.5 border border-white/10 shadow-lg">
                <button 
                  onClick={() => { setHomeTab('hero'); handleNavigate('home', 'hero'); }}
                  className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all active:scale-95 ${homeTab === 'hero' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  {t('app.homeTab.main')}
                </button>
                <button 
                  onClick={() => { setHomeTab('pricing'); handleNavigate('home', 'pricing'); }}
                  className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all active:scale-95 ${homeTab === 'pricing' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  {t('app.homeTab.plans')}
                </button>
                <button 
                  onClick={() => { setHomeTab('vod'); handleNavigate('home', 'vod'); }}
                  className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all active:scale-95 ${homeTab === 'vod' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  {t('app.homeTab.vod')}
                </button>
                <button 
                  onClick={() => { setHomeTab('recommended'); handleNavigate('home', 'apps'); }}
                  className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all active:scale-95 ${homeTab === 'recommended' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  {t('app.homeTab.recommended')}
                </button>
              </div>
            </div>

            {/* Desktop & Mobile Sections */}
            <div className="space-y-0">
              {systemSettings?.SHOW_HERO !== false && (
                <KingTVLandHero 
                  onNavigate={handleNavigate} 
                  onStartNow={handleStartNow}
                />
              )}
              
              {systemSettings?.SHOW_VOD !== false && (
                <ContentShowcase onAuthRequired={() => handleStartNow()} />
              )}
              
              {systemSettings?.SHOW_DEALS !== false && <DealsSection onNavigate={handleNavigate} />}
              
              <SavingsComparison />
              
              {systemSettings?.SHOW_APPS !== false && <RecommendedApps onNavigate={handleNavigate} />}

              {systemSettings?.SHOW_PRICING !== false && (
                <Pricing 
                    onSelectPlan={handleSelectPlan} 
                    onNavigate={handleNavigate} 
                    isShabbat={!systemStatus.isServiceActive} 
                    onRequestTrial={onRequestTrial}
                />
              )}
            </div>
          </>
        );
    }
  };

  return (
    <>
      <div className={`min-h-screen bg-[#0f0c29] text-white font-sans ${isRTL ? 'dir-rtl' : 'dir-ltr'} ${isLocked ? 'pointer-events-none select-none blur-[2px]' : ''}`}>
        <Toaster position="top-center" />
      <ScrollProgress />
      <ScrollToTop />
      <Onboarding />
      {currentView !== 'admin' && (
        <AccessibilityWidget />
      )}

      {currentView !== 'admin' && (
      <Header 
        settings={systemSettings}
        onNavigate={handleNavigate} 
        user={user} 
        onLogout={() => {
          setUser(null);
          setAuthToken(null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('adminMode');
          toast.success(t('nav.logoutSuccess'));
        }}
        onAdminLogin={() => {
          setUser(prev => prev ? { ...prev, role: 'admin' } : { email: 'admin@kingtvland.com', subscriptions: [], role: 'admin' });
        }}
        onLoginClick={() => setLoginOpen(true)}
        onJoinClick={() => setRegisterOpen(true)}
        currentView={currentView}
        promoText={systemSettings?.PROMO_BANNER_TEXT}
        isSupportActive={systemStatus.isSupportActive}
      />
      )}

      <main className={currentView === 'admin' ? '' : (systemSettings?.PROMO_BANNER_TEXT ? 'pt-28 md:pt-32' : 'pt-20 md:pt-24')}>
        <Content />
      </main>

      {currentView !== 'admin' && <Footer onNavigate={handleNavigate} systemSettings={systemSettings} onAdminClick={() => setAdminLoginOpen(true)} />}

      {adminLoginOpen && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
           <div className="bg-slate-800 p-6 rounded-2xl border border-gray-600 shadow-2xl w-full max-w-sm text-center">
              <h3 className="text-xl font-bold text-white mb-4">{t('admin.title')}</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setCheckingAdmin(true);
                const result = await dataService.adminLogin(adminPass);
                setCheckingAdmin(false);
                if (result.success && result.token) {
                  localStorage.setItem('authToken', result.token);
                  localStorage.setItem('adminMode', 'true');
                  setAuthToken(result.token);
                  setUser(prev => prev ? { ...prev, role: 'admin' } : { email: 'admin@kingtvland.com', subscriptions: [], role: 'admin' });
                  handleNavigate('admin');
                  setAdminLoginOpen(false);
                  setAdminPass('');
                  toast.success(t('admin.welcome'));
                } else {
                  toast.error(result.error || t('admin.wrongPass'));
                }
              }}>
                  <input 
                    type="password" 
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder={t('admin.passPlaceholder')}
                    className="w-full bg-slate-700 border border-gray-500 rounded-lg px-4 py-2 text-white text-center tracking-widest mb-4 focus:ring-2 focus:ring-cyan-500 outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                      <button type="submit" disabled={checkingAdmin} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center">
                          {checkingAdmin ? <Spinner /> : t('admin.login')}
                      </button>
                      <button type="button" onClick={() => setAdminLoginOpen(false)} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 rounded-lg">{t('admin.cancel')}</button>
                  </div>
              </form>
           </div>
        </div>
      )}

      <MarketingPopupDisplay />
      
      {currentView !== 'admin' && (
        <>
          <div className="md:block hidden">
            <SupportMenu 
              isSupportActive={systemStatus.isSupportActive} 
              user={user}
              onNavigate={handleNavigate}
            />
            <ChatBot user={user} externalOpen={isChatOpen} onToggle={setIsChatOpen} onNavigate={setCurrentView} />
          </div>
          <div className="md:hidden block">
             {/* Mobile versions are triggered by the bottom menu and handle their own fixed positioning */}
             <SupportMenu 
              isSupportActive={systemStatus.isSupportActive} 
              user={user}
              onNavigate={handleNavigate}
            />
            <ChatBot user={user} externalOpen={isChatOpen} onToggle={setIsChatOpen} onNavigate={setCurrentView} />
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation Menu */}
      {currentView !== 'admin' && (
        <>
          <div className="md:hidden h-20" /> {/* Spacer for bottom menu */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#0f0c29]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => {
                const a11yBtn = document.querySelector('.accessibility-trigger-btn') as HTMLButtonElement;
                if (a11yBtn) a11yBtn.click();
              }}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-indigo-400 transition-colors"
            >
              <div className="p-2 bg-white/5 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <span className="text-[10px] font-bold">{t('app.accessibility')}</span>
            </button>

            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex flex-col items-center gap-1 transition-colors ${isChatOpen ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'}`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isChatOpen ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <span className="text-[10px] font-bold">{t('app.support')}</span>
            </button>

              <a 
                href="https://t.me/King_tv_land" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <div className="p-2 bg-white/5 rounded-xl">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.28-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-bold">{t('app.telegram')}</span>
              </a>
          </div>
        </>
      )}
    </div>

    {/* Overlays and Modals outside the locked container */}
    <div className="pointer-events-auto">
      <AuthNudge 
        user={user}
        onLogin={() => setLoginOpen(true)}
        onRegister={() => setRegisterOpen(true)}
        onLockChange={setIsLocked}
      />

      <LoginModal 
        isOpen={loginOpen} 
        onClose={() => setLoginOpen(false)}
        onLoginAttempt={async (email, username, password, twoFactorCode) => {
          const result = await dataService.secureLogin(email, username, password);
          if (result.success && result.token) {
            setAuthToken(result.token);
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('userEmail', email);
            
            // Fetch user data
            const subResult = await dataService.getUserSubscriptions(result.token);
            
            const isVip = subResult?.some((sub: Subscription) => sub.serviceLevel === 'VIP' || sub.serviceLevel === 'VIP') || false;
            
            // Mark as VIP in database (Firestore)
            await dataService.updateUserVipStatus(email, isVip);
            
            const userData: UserSession = {
              email,
              name: username,
              subscriptions: subResult || [],
              role: 'user'
            };
            setUser(userData);
            toast.success(`${t('nav.welcome')}, ${username}`);
            return { success: true };
          }
          return { success: false };
        }}
        onForgotPassword={() => {
          setLoginOpen(false);
          setResetPasswordOpen(true);
        }}
      />

      <RegisterModal 
        isOpen={registerOpen} 
        onClose={() => setRegisterOpen(false)} 
        onRegister={async (name, email, phone, username, password, emailCode, birthday) => {
          const result = await dataService.registerUser(name, email, phone, username, password, emailCode, birthday);
          if (result.success) {
            setRegisterOpen(false);
            setLoginOpen(true);
            toast.success(t('nav.registerSuccess'));
            return true;
          } else {
            toast.error(result.error || t('nav.registerError'));
            return false;
          }
        }}
      />

      <ResetPasswordModal
        isOpen={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
        onRequestReset={dataService.requestPasswordReset}
        onPerformReset={dataService.performPasswordReset}
        resetToken={resetToken}
      />

      <JoinModal 
        isOpen={joinOpen}
        onClose={() => { setJoinOpen(false); setIsTrialMode(false); }}
        plan={selectedPlan || undefined}
        isTrial={isTrialMode}
      />

      <PurchaseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={selectedPlan}
        customerType={selectedCustomerType}
        serviceLevel={selectedServiceLevel}
        initialUsername={initialUsername}
      />

      <PurchaseTermsModal 
        isOpen={isPurchaseTermsOpen}
        onClose={() => {
            setPurchaseTermsOpen(false);
            setPendingPurchaseAction(null);
        }}
        onAccept={() => {
            setPurchaseTermsOpen(false);
            if (pendingPurchaseAction) {
                pendingPurchaseAction();
                setPendingPurchaseAction(null);
            }
        }}
      />
      
      <ShabbatOverlay isVisible={systemStatus.isShabbat} />
      
      {systemStatus.isMaintenance && currentView !== 'admin' && (
          <div className="fixed inset-0 z-[999] bg-slate-900 flex flex-col items-center justify-center text-center p-4">
              <div className="bg-slate-800 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full">
                  <svg className="w-20 h-20 text-yellow-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <h1 className="text-3xl font-bold text-white mb-4">{t('app.maintenanceTitle')}</h1>
                  <p className="text-gray-300 mb-6">{t('app.maintenanceDesc')}</p>
                  <div className="text-sm text-gray-500">{t('app.maintenanceTeam')}</div>
                  
                  {/* Secret Admin Access */}
                  <button onClick={() => setCurrentView('admin')} className="mt-8 text-gray-700 hover:text-gray-600 text-xs">
                      {t('app.adminLogin')}
                  </button>
              </div>
          </div>
      )}
    </div>
    </>
  );
}

import ErrorBoundary from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ErrorBoundary>
          <MainApp />
        </ErrorBoundary>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;