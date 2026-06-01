
import React, { useState, useEffect } from 'react';
import { UserSession, Subscription, Plan, CustomerType, ServiceLevel, UserNotification } from '../types';
import { requestTrial, getUserNotifications } from '../services/dataService';
import { PLANS } from '../constants';
import PurchaseModal from './PurchaseModal';
import confetti from 'canvas-confetti';
import Spinner from './Spinner';
import { useLanguage } from '../i18n/LanguageContext';
import { Smartphone, Tv, Monitor, Laptop, Download, ExternalLink, ChevronLeft, Info } from 'lucide-react';

interface ProfileProps {
  user: UserSession;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const { t, isRTL } = useLanguage();
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(user.subscriptions);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'vip' | 'downloads' | 'notifications'>('subscriptions');
  const [selectedDevice, setSelectedDevice] = useState<'android' | 'ios' | 'tv' | 'pc' | 'downloader'>('android');
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
        setLoadingNotifications(true);
        const plans = subscriptions.map(s => s.type.toLowerCase()).concat(subscriptions.map(s => {
            if (s.type.toLowerCase().includes('king')) return 'king';
            if (s.type.toLowerCase().includes('israel')) return 'israeli';
            if (s.type.toLowerCase().includes('premium')) return 'premium';
            if (s.type.toLowerCase().includes('gold')) return 'gold';
            if (s.type.toLowerCase().includes('crystal')) return 'crystal';
            return s.type.toLowerCase();
        }));
        
        const usernames = [...new Set(subscriptions.map(s => s.username))];
        const data = await getUserNotifications(user.email, plans, usernames[0] || ''); // Sending one username for now or we could send array if backed updated to support it, but email usually suffices.
        // Actually modifying backend to correctly check arrays would be better, but we let email handle it mainly.
        setNotifications(data);
        setLoadingNotifications(false);
    };
    fetchNotifs();
  }, [user.email, subscriptions]);
  
  const isVip = subscriptions.some(sub => sub.serviceLevel === ServiceLevel.VIP || sub.serviceLevel === 'VIP');
  
  // Birthday States
  const [showBirthdayPromo, setShowBirthdayPromo] = useState(false);
  const [isBirthdayWeek, setIsBirthdayWeek] = useState(false);
  const [birthday, setBirthday] = useState(user.birthday || '');

  useEffect(() => {
    if (user.birthday) {
      checkBirthdayWeek(user.birthday);
    }
  }, [user.birthday]);

  const checkBirthdayWeek = (bday: string) => {
    try {
      const today = new Date();
      const birthDate = new Date(bday);
      
      // Get birthday in current year
      const birthThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      // Calculate difference in days
      const diffTime = birthThisYear.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Recognition logic: Up to 3 days before or 4 days after (A "week" around)
      if (Math.abs(diffDays) <= 3) {
        setIsBirthdayWeek(true);
        setShowBirthdayPromo(true);
        triggerConfetti();
      }
    } catch (e) {
      console.error("Birthday check error:", e);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedTrialPlan, setSelectedTrialPlan] = useState('king');
  const [isGeneratingTrial, setIsGeneratingTrial] = useState(false);
  const [isAutoTrial, setIsAutoTrial] = useState(false); 
  const [createdSubDetails, setCreatedSubDetails] = useState<Subscription | null>(null); // Holds new credentials

  // Renewal State
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [planToRenew, setPlanToRenew] = useState<Plan | null>(null);

  // Crystal Restriction Modal State
  const [showCrystalModal, setShowCrystalModal] = useState(false);

  const totalSubs = subscriptions.length;
  const activeSubs = subscriptions.filter(s => Number(s.daysLeft) > 0).length;

  // Auto-close success modal only if it's NOT an auto-trial (credentials need to be seen)
  useEffect(() => {
      let timer: any;
      if (isSuccessModalOpen && !isAutoTrial) {
          timer = setTimeout(() => {
              setIsSuccessModalOpen(false);
          }, 20000);
      }
      return () => clearTimeout(timer);
  }, [isSuccessModalOpen, isAutoTrial]);

  const handleOpenTrialModal = () => {
      setShowCrystalModal(false);
      setIsTrialModalOpen(true);
  };

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmitTrial = async () => {
    setIsGeneratingTrial(true);
    
    // Call backend
    const result = await requestTrial(user.name || '', user.email, user.phone || '', '', selectedTrialPlan);
    
    setIsGeneratingTrial(false);
    setIsTrialModalOpen(false);

    if (result.success) {
      if (result.credentials) {
          setCreatedSubDetails({
              username: result.credentials.username,
              password: result.credentials.password,
              type: selectedTrialPlan,
              createdAt: new Date().toLocaleDateString(),
              expireDate: '24 Hours',
              daysLeft: '1',
              lastLogin: 'Never',
              notes: result.credentials.portal || 'http://livetvproo.com'
          } as any);
          setIsAutoTrial(true);
      }
      setSuccessMessage(result.message || 'בקשתך התקבלה בהצלחה!');
      setIsSuccessModalOpen(true);
    } else {
      alert(result.error || "אירעה שגיאה ביצירת מנוי הניסיון.");
    }
  };

   const copyCredentials = () => {
      if (!createdSubDetails) return;
      const portal = createdSubDetails.notes || 'http://livetvproo.com';
      const text = `שם משתמש: ${createdSubDetails.username}\nסיסמה: ${createdSubDetails.password}\nפורטל: ${portal}`;
      navigator.clipboard.writeText(text);
      alert("הפרטים הועתקו!");
  };

  const handleExtend = () => {
      if (!selectedSub) return;
      
      const type = (selectedSub.type || '').toLowerCase();

      // 1. Block Crystal
      if (type.includes('crystal') || type.includes('קריסטל')) {
          setShowCrystalModal(true);
          return;
      }

      // 2. Identify Plan
      let targetPlanId = 'king'; // Default
      if (type.includes('vod')) targetPlanId = 'vod';
      else if (type.includes('israel') || type.includes('ישראל')) targetPlanId = 'israel';
      else if (type.includes('premium') || type.includes('פרימיום')) targetPlanId = 'premium';
      else if (type.includes('king') || type.includes('קינג')) targetPlanId = 'king';

      const planObj = PLANS.find(p => p.id === targetPlanId);
      
      if (planObj) {
          setPlanToRenew(planObj);
          setRenewModalOpen(true);
      } else {
          alert("לא נמצאה חבילה תואמת לחידוש אוטומטי. אנא צור קשר עם התמיכה.");
      }
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 profile-header-container">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">שלום, {user.email.split('@')[0]}</h1>
            {isVip && (
              <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 text-slate-900 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.3)] border border-yellow-200/50">
                <span className="text-sm mt-0.5">👑</span> VIP
              </span>
            )}
            {isBirthdayWeek && (
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 animate-bounce shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                🎂 יום הולדת שמח!
              </span>
            )}
          </div>
          <p className="text-gray-400 mt-1">אזור ניהול מנויים אישי</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
             <button 
                onClick={handleOpenTrialModal}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-xl border border-green-500/30 flex items-center gap-3 shadow-lg shadow-green-500/10 transition-all transform hover:-translate-y-1"
             >
                <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <div className="text-right">
                    <p className="text-xs text-green-200">אין לך מנוי?</p>
                    <p className="text-lg font-bold">הזמן ניסיון ל-24 שעות</p>
                </div>
            </button>

            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 p-4 rounded-xl border border-cyan-500/30 flex items-center gap-4 shadow-lg shadow-cyan-500/10">
            <div className="bg-cyan-500 p-3 rounded-lg text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>
            <div>
                <p className="text-sm text-cyan-200">סה"כ מנויים</p>
                <p className="text-2xl font-black text-white">{totalSubs} <span className="text-sm font-normal text-gray-400">({activeSubs} פעילים)</span></p>
            </div>
            </div>
        </div>
      </div>

      {/* Birthday Promo Banner */}
      {showBirthdayPromo && (
        <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-indigo-900/40 border border-pink-500/30 rounded-2xl p-6 shadow-[0_20px_50px_rgba(236,72,153,0.2)] animate-in fade-in zoom-in duration-700">
           {/* Decorative elements */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
              <div className="flex items-center gap-6">
                <div className="text-6xl animate-bounce">🎂</div>
                <div>
                   <h2 className="text-2xl md:text-3xl font-black text-white mb-2">מזל טוב! השבוע יש לך יום הולדת! 🎈</h2>
                   <p className="text-pink-200 text-lg">חוגגים איתך ב-KINGTVLAND עם מתנה מיוחדת:</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[250px]">
                 <div className="text-xs text-gray-400 mb-1">הטבת יום הולדת בלעדית:</div>
                 <div className="text-2xl font-black text-white mb-3">חודש מתנה עלינו! 🎁</div>
                 <p className="text-[10px] text-pink-300 mb-4">*ההטבה מותנית ברכישה או בחידוש מנוי השבוע</p>
                 <button 
                  onClick={() => {
                    const pricingSection = document.getElementById('pricing');
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      // Navigate to home if needed
                      window.location.href = '/#pricing';
                    }
                  }}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 rounded-xl text-sm transition-all shadow-lg"
                 >
                   מימוש ההטבה עכשיו
                 </button>
              </div>
           </div>
           
           <button 
            onClick={() => setShowBirthdayPromo(false)}
            className="absolute top-2 left-2 text-gray-500 hover:text-white p-1"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
      )}

      {/* Birthday Setup (if missing) */}
      {!user.birthday && (
        <div className="mb-8 p-4 bg-slate-800/50 rounded-xl border border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-white font-bold text-sm">עדכן יום הולדת לקבלת הטבות!</p>
                <p className="text-gray-400 text-xs">נשמח להפתיע אותך ביום ההולדת שלך.</p>
              </div>
           </div>
           <div className="flex gap-2 w-full sm:w-auto">
              <input 
                type="date" 
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="bg-slate-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 flex-1"
              />
              <button 
                onClick={() => {
                  if (birthday) {
                    // Logic to update user in sheetService/Firebase
                    // For now we'll just mock local success and trigger week check
                    user.birthday = birthday; 
                    checkBirthdayWeek(birthday);
                    alert("יום ההולדת עודכן בהצלחה!");
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                שמור
              </button>
           </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-4 px-2 font-bold transition-all relative ${activeTab === 'subscriptions' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-400'}`}
        >
          המנויים שלי
          {activeTab === 'subscriptions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
        </button>
        {isVip && (
          <button
            onClick={() => setActiveTab('vip')}
            className={`pb-4 px-2 font-bold transition-all relative ${activeTab === 'vip' ? 'text-amber-400' : 'text-gray-500 hover:text-gray-400'}`}
          >
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline">💎</span> הטבות VIP
            </span>
            {activeTab === 'vip' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />}
          </button>
        )}
        <button
          onClick={() => setActiveTab('downloads')}
          className={`pb-4 px-2 font-bold transition-all relative ${activeTab === 'downloads' ? 'text-green-400' : 'text-gray-500 hover:text-gray-400'}`}
        >
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline">📥</span> {t('profile.tabs.downloads')}
          </span>
          {activeTab === 'downloads' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-4 px-2 font-bold transition-all relative ${activeTab === 'notifications' ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-400'}`}
        >
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline relative">
                🔔
                {notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">{notifications.length}</span>
                )}
            </span> הודעות מערכת
          </span>
          {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
        </button>
      </div>

      {activeTab === 'subscriptions' ? (
        <>
          {/* Grid of Subscriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-gray-700">
                    <p className="text-gray-400 text-lg">עדיין אין לך מנויים.</p>
                    <p className="text-gray-500">לחץ על הכפתור הירוק למעלה ליצירת מנוי ניסיון בחינם!</p>
                </div>
            ) : (
                subscriptions.map((sub, idx) => (
                <div 
                    key={idx}
                    onClick={() => setSelectedSub(sub)}
                    className="bg-slate-800/50 hover:bg-slate-700/50 border border-gray-700 hover:border-purple-500/50 rounded-xl p-6 transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${Number(sub.daysLeft) > 10 ? 'bg-green-500/20 text-green-400' : (Number(sub.daysLeft) > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400')}`}>
                        {Number(sub.daysLeft) > 0 ? `${sub.daysLeft} ימים נותרו` : 'פג תוקף'}
                    </span>
                    <div className="flex gap-2">
                        { (sub.serviceLevel === 'VIP' || sub.serviceLevel === ServiceLevel.VIP) && (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-md text-[10px] font-black tracking-wider">VIP</span>
                        )}
                        <span className="text-purple-400 bg-purple-900/30 px-2 py-1 rounded-md text-xs border border-purple-500/20">
                            {sub.type}
                        </span>
                    </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1 relative z-10">{sub.username}</h3>
                    <p className="text-gray-400 text-sm mb-4 relative z-10">נוצר ב: {sub.createdAt}</p>
                    
                    <div className="flex items-center text-indigo-400 text-sm font-medium group-hover:translate-x-1 transition-transform relative z-10">
                    לפרטים מלאים
                    <svg className="w-4 h-4 mr-1 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7-7-7" />
                    </svg>
                    </div>
                </div>
                ))
            )}
          </div>
        </>
      ) : activeTab === 'notifications' ? (
        <div className="animate-fade-in">
           <div className="bg-slate-800/40 border border-gray-700 w-full max-w-4xl mx-auto rounded-2xl p-6 md:p-10 backdrop-blur-md">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-3xl border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    💌
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-white">הודעות ועדכונים</h2>
                    <p className="text-cyan-400/80 font-medium tracking-wide">הודעות אישיות ועדכונים ממערכת KINGTV</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                 {loadingNotifications ? (
                    <div className="text-center py-12"><Spinner /></div>
                 ) : notifications.length === 0 ? (
                    <div className="text-center py-16 bg-slate-900/50 rounded-xl border border-dashed border-gray-700">
                        <div className="text-5xl mb-4 opacity-50">📭</div>
                        <p className="text-gray-400 text-lg">אין הודעות חדשות עבורך כרגע.</p>
                    </div>
                 ) : (
                    notifications.map(notif => (
                       <div key={notif.id} className="bg-slate-800/80 hover:bg-slate-700/80 transition-colors border border-gray-700 rounded-xl p-6 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-2 h-full bg-cyan-500"></div>
                           <div className="flex justify-between items-start mb-3 dir-rtl text-right">
                               <h3 className="text-xl font-bold text-white pr-4">{notif.title}</h3>
                               <span className="text-xs text-gray-500 whitespace-nowrap bg-slate-900 px-3 py-1 rounded-full border border-gray-700">{new Date(notif.timestamp).toLocaleString('he-IL')}</span>
                           </div>
                           <p className="text-gray-300 pr-4 leading-relaxed whitespace-pre-wrap">{notif.message}</p>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      ) : activeTab === 'vip' ? (
        <div className="animate-fade-in">
          <div className="bg-slate-800/40 border border-amber-500/20 rounded-2xl p-8 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-3xl border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                👑
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">הטבות VIP EXCLUSIVE</h2>
                <p className="text-amber-400/80 font-medium tracking-wide">מנוי זה מקנה לך את הסטנדרט הגבוה ביותר בסטרימינג</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'תמיכה טכנית בעדיפות עליונה', desc: 'מענה מהיר בווטסאפ ובטלגרם בשעות הפעילות (א\'-ו\'), עם עקיפת התור וטיפול אישי ומקצועי.', icon: '💎' },
                { title: 'איכות 4K Ultra HD', desc: 'גישה לכל הערוצים בשידור חי וב-VOD באיכות המקסימלית הנתמכת לחוויה מושלמת.', icon: '📺' },
                { title: 'ליווי והתקנה אישית', desc: 'עזרה מרחוק בהתקנת האפליקציות והגדרת המכשירים לצפייה אופטימלית (בימי חול).', icon: '🛠️' },
                { title: 'ניהול בקשות תוכן VIP', desc: 'עדיפות בטיפול בבקשות לתוכן חדש (Request Content) עם התחייבות לטיפול מהיר בימי הפעילות.', icon: '🎬' },
                { title: 'שירות החלפת פרטים מהיר', desc: 'במקרה של תקלה טכנית או צורך באיפוס, לקוחות VIP מקבלים טיפול מהיר ומענה מיידי.', icon: '🔄' },
                { title: 'ארכיון מלא לשבוע', desc: 'אפשרות לחזור אחורה בזמן בכל הערוצים המובילים עד 7 ימים לאחור.', icon: '⏪' }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors group">
                  <div className="text-2xl group-hover:scale-125 transition-transform">{benefit.icon}</div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{benefit.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl border-l-4 border-amber-500">
               <p className="text-white font-bold italic">"תודה שבחרת בשירות ה-VIP של KINGTV. אנחנו כאן כדי להבטיח לך חוויית צפייה מלכותית."</p>
               <p className="text-gray-500 text-xs mt-2">— צוות KINGTVLAND</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-8">
          <div className="bg-slate-800/40 border border-gray-700 rounded-2xl p-8 backdrop-blur-md">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                {t('profile.download.title')}
              </h2>
              <p className="text-gray-400 mt-2">{t('profile.download.subtitle')}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
              {[
                { id: 'android', label: t('profile.download.android'), icon: Smartphone, color: 'text-green-400' },
                { id: 'ios', label: t('profile.download.ios'), icon: Smartphone, color: 'text-blue-400' },
                { id: 'tv', label: t('profile.download.tv'), icon: Tv, color: 'text-purple-400' },
                { id: 'pc', label: t('profile.download.pc'), icon: Monitor, color: 'text-cyan-400' },
                { id: 'downloader', label: t('profile.download.downloader'), icon: Download, color: 'text-orange-400' },
              ].map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id as any)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-3 ${
                    selectedDevice === device.id
                      ? `bg-white/10 border-white/30 shadow-lg scale-105`
                      : 'bg-black/20 border-white/5 hover:border-white/20'
                  }`}
                >
                  <device.icon className={`w-8 h-8 ${device.color}`} />
                  <span className={`text-[10px] sm:text-xs font-bold text-center ${selectedDevice === device.id ? 'text-white' : 'text-gray-500'}`}>
                    {device.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 min-h-[300px] flex flex-col">
              {selectedDevice === 'android' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {isVip && (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                      <AppDownloadCard 
                        title="PREMIUM VIP App"
                        desc="גרסת הפרימיום הבלעדית למנויי VIP - חווית צפייה ללא פשרות"
                        link="https://drive.google.com/file/d/1Tl3SiZynilGipjZ6e55t2NJa-V8Yc6U_/view?usp=sharing"
                        isRTL={isRTL}
                      />
                      <div className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full z-10 shadow-lg">
                        VIP ONLY
                      </div>
                    </div>
                  )}
                  <AppDownloadCard 
                    title="KING"
                    desc="אפליקציית KING הייעודית למנויי השירות"
                    link="https://drive.google.com/file/d/1Tl3SiZynilGipjZ6e55t2NJa-V8Yc6U_/view?usp=sharing"
                    isRTL={isRTL}
                  />
                  <AppDownloadCard 
                    title="IPTV Smarters Pro"
                    desc={t('guides.app.smarters.desc')}
                    link="https://drive.google.com/file/d/1IRTIqfbsXprKLL5R8pnyZ4hSOmuKJUMU/view"
                    isRTL={isRTL}
                  />
                  <AppDownloadCard 
                    title="Televizo"
                    desc="נגן עוצמתי ונוח במיוחד למכשירי אנדרואיד"
                    link="https://drive.google.com/file/d/1kAA0DNdfZOGo9v0itUa0UtmawrFzjHHz/view"
                    isRTL={isRTL}
                  />
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-200">
                      {t('guides.noteText')}
                    </p>
                  </div>
                </div>
              )}

              {selectedDevice === 'ios' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <AppDownloadCard 
                    title="IPTV Smarters Pro"
                    desc="האפליקציה המוכרת והאהובה בחנות הרשמית"
                    link="https://apps.apple.com/us/app/iptv-smarters-pro/id1383561081"
                    isRTL={isRTL}
                    external
                  />
                  <AppDownloadCard 
                    title="GSE Smart IPTV"
                    desc="נגן מתקדם עם תאימות גבוהה למכשירי Apple"
                    link="https://apps.apple.com/us/app/gse-smart-iptv/id1028734023"
                    isRTL={isRTL}
                    external
                  />
                </div>
              )}

              {selectedDevice === 'tv' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="p-8 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl border border-white/10 text-center">
                     <Tv className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">{t('profile.download.tv.guide')}</h3>
                     <p className="text-gray-400 text-sm mb-6">חפשו את האפליקציות הבאות בחנות האפליקציות של הטלוויזיה שלכם:</p>
                     <div className="flex flex-wrap justify-center gap-3">
                        {['IPTV Smarters Pro', 'Smart One', 'Nanomid', 'IBO Player', 'Set IPTV'].map((app) => (
                           <span key={app} className="px-4 py-2 bg-white/10 rounded-full text-white text-xs font-bold border border-white/5">{app}</span>
                        ))}
                     </div>
                   </div>
                   <AppDownloadCard 
                    title="TiviMate (Premium)"
                    desc="האפליקציה הטובה ביותר לסטרימרים (Android TV / Firestick)"
                    link="https://play.google.com/store/apps/details?id=ar.tvplayer.tv"
                    isRTL={isRTL}
                    external
                  />
                </div>
              )}

              {selectedDevice === 'pc' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <AppDownloadCard 
                    title="IPTV Smarters (Windows)"
                    desc="גרסת המחשב של הנגן המפורסם"
                    link="https://www.iptvsmarters.com/download?download=windows"
                    isRTL={isRTL}
                    external
                  />
                  <AppDownloadCard 
                    title="VLC Media Player"
                    desc="הנגן האוניברסלי - פשוט פתחו את הלינק שקיבלתם"
                    link="https://www.videolan.org/vlc/"
                    isRTL={isRTL}
                    external
                  />
                </div>
              )}

              {selectedDevice === 'downloader' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="p-8 bg-black/40 rounded-2xl border border-orange-500/30 text-center">
                     <Download className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">{t('profile.download.downloaderCode')}</h3>
                     <div className="text-4xl font-black text-white bg-slate-700 py-4 px-8 rounded-xl inline-block shadow-lg border border-white/10 tracking-widest my-4">
                       81442
                     </div>
                     <p className="text-gray-400 text-sm mt-4">הזינו את הקוד באפליקציית Downloader בסטרימר שלכם להתקנה מהירה.</p>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h4 className="text-white font-bold mb-2">איך מתקינים?</h4>
                        <ol className="text-xs text-gray-400 space-y-2 text-right list-decimal list-inside">
                          <li>הורידו את אפליקציית Downloader מחנות האפליקציות.</li>
                          <li>פתחו את האפליקציה וכנסו להגדרות (Settings).</li>
                          <li>אפשרו "Install from Unknown Sources".</li>
                          <li>חזרו למסך הראשי והזינו את הקוד מלעיל.</li>
                        </ol>
                      </div>
                      <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10 flex items-center justify-center">
                        <div className="text-center">
                           <Download className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                           <p className="text-xs text-orange-200 font-bold italic">הדרך המהירה ביותר לסטרימרים!</p>
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trial Request Modal */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={() => setIsTrialModalOpen(false)}></div>
            <div className="bg-slate-800 rounded-2xl w-full max-w-md z-10 border border-gray-600 shadow-2xl p-8 relative">
                <button 
                    onClick={() => setIsTrialModalOpen(false)}
                    className="absolute top-4 left-4 text-gray-400 hover:text-white z-10 p-2 bg-black/20 rounded-full transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-white mb-4">הזמנת מנוי ניסיון 🎁</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">האימייל שלך</label>
                        <input type="text" value={user.email} disabled className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed" />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm mb-1 font-bold">בחר סוג מנוי לניסיון</label>
                        <select 
                            value={selectedTrialPlan}
                            onChange={(e) => setSelectedTrialPlan(e.target.value)}
                            className="w-full bg-slate-700 border border-gray-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="king">KING (מומלץ)</option>
                            <option value="vod">VOD</option>
                            <option value="israel">ISRAEL (אוטומטי)</option>
                            <option value="premium">PREMIUM (4K)</option>
                        </select>
                        {selectedTrialPlan === 'israel' && (
                            <p className="text-xs text-green-400 mt-1">✨ מנוי ישראלי מופעל אוטומטית ומיידית!</p>
                        )}
                    </div>

                    <button 
                        onClick={handleSubmitTrial}
                        disabled={isGeneratingTrial}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg mt-4 disabled:opacity-50 flex items-center justify-center"
                    >
                        {isGeneratingTrial ? <Spinner /> : 'אשר ושלח'}
                    </button>
                    
                    <button onClick={() => setIsTrialModalOpen(false)} className="w-full text-gray-400 hover:text-white text-sm py-2">
                        ביטול
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center px-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={() => setIsSuccessModalOpen(false)}></div>
            <div className="bg-slate-800 rounded-2xl w-full max-w-md z-10 border border-green-500/50 shadow-2xl p-8 text-center relative overflow-hidden">
                <button onClick={() => setIsSuccessModalOpen(false)} className="absolute top-3 left-3 text-gray-400 hover:text-white bg-black/20 p-2 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-4">בקשתך התקבלה! ⏳</h3>
                
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {successMessage}
                </p>

                {createdSubDetails && (
                    <div className="bg-slate-900/80 rounded-xl p-4 border border-gray-700 text-right space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-gray-400 text-xs">שם משתמש</span>
                            <span className="text-green-400 font-mono font-bold select-all">{createdSubDetails.username}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-gray-400 text-xs">סיסמה</span>
                            <span className="text-pink-400 font-mono font-bold select-all">{createdSubDetails.password}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">פורטל</span>
                            <span className="text-cyan-400 font-mono font-bold select-all text-[10px]">{createdSubDetails.notes || 'http://livetvproo.com'}</span>
                        </div>
                        
                        <button 
                            onClick={copyCredentials}
                            className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            העתק פרטי התחברות
                        </button>
                    </div>
                )}
                
                <button onClick={() => setIsSuccessModalOpen(false)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl w-full">
                    סגור
                </button>
            </div>
        </div>
      )}

      {/* Details Modal (Full View) */}
      {selectedSub && (
        <div className="fixed inset-0 z-[250] overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedSub(null)}></div>
            
            <div className="bg-slate-800 rounded-2xl w-full max-w-lg z-10 border border-gray-600 shadow-2xl overflow-hidden relative transform transition-all scale-100">
              <button onClick={() => setSelectedSub(null)} className="absolute top-4 left-4 text-gray-400 hover:text-white bg-slate-700/50 rounded-full p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                    <div className="p-3 bg-indigo-600 rounded-lg"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
                    <h3 className="text-2xl font-bold text-white">פרטי מנוי מלאים</h3>
                </div>
                
                <div className="space-y-4">
                  <DetailRow label="שם משתמש" value={selectedSub.username} copy />
                  <DetailRow label="סיסמה" value={selectedSub.password || '******'} copy />
                  <DetailRow label="סוג מנוי" value={selectedSub.type} />
                  {(selectedSub.serviceLevel === 'VIP' || selectedSub.serviceLevel === ServiceLevel.VIP) && (
                      <DetailRow label="רמת שירות" value="✨ VIP Service (Full)" />
                  )}
                  <DetailRow label="תאריך תפוגה" value={selectedSub.expireDate} />
                  <DetailRow label="נוצר בתאריך" value={selectedSub.createdAt} />
                  <DetailRow label="התחברות אחרונה" value={selectedSub.lastLogin} />
                  
                  <div className="bg-slate-900/50 p-4 rounded-lg mt-4 border border-slate-700">
                    <span className="text-gray-400 text-xs block mb-1">אימייל משויך (Notes)</span>
                    <p className="text-indigo-300 text-sm font-mono">{selectedSub.notes}</p>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-3">
                    <button onClick={() => setSelectedSub(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors">סגור</button>
                    <button onClick={handleExtend} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-purple-500/20">הארך מנוי</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crystal Block Modal */}
      {showCrystalModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={() => setShowCrystalModal(false)}></div>
            <div className="bg-slate-800 rounded-2xl w-full max-w-md z-10 border border-gray-600 shadow-2xl overflow-hidden relative p-8 text-center transform scale-100 transition-all">
                <button onClick={() => setShowCrystalModal(false)} className="absolute top-4 left-4 text-gray-400 hover:text-white bg-slate-700/50 rounded-full p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">היי {selectedSub?.username || user.email.split('@')[0]} 👋</h3>
                <p className="text-gray-300 text-base leading-relaxed mb-8">מתנצלים, לא ניתן לחדש מנוי מסוג <strong>קריסטל (Crystal)</strong>. <br/> אנו מזמינים אותך להתנסות באחת החבילות המתקדמות שלנו!</p>
                <div className="flex flex-col gap-3">
                    <button onClick={handleOpenTrialModal} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-500/20">קבל מנוי ניסיון בחינם</button>
                    <button onClick={() => setShowCrystalModal(false)} className="text-gray-400 hover:text-white font-medium py-2 transition-colors text-sm">סגור חלונית</button>
                </div>
            </div>
        </div>
      )}

      {/* Renew / Purchase Modal */}
      {planToRenew && (
          <PurchaseModal 
            isOpen={renewModalOpen}
            onClose={() => setRenewModalOpen(false)}
            plan={planToRenew}
            customerType={CustomerType.EXISTING}
            serviceLevel={ServiceLevel.VIP}
          />
      )}
    </div>
  );
};

const DetailRow: React.FC<{label: string, value: string, copy?: boolean}> = ({label, value, copy}) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="flex justify-between items-center bg-slate-700/30 p-3 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
      <span className="text-gray-400 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-white font-mono font-bold tracking-wide">{value}</span>
        {copy && (
          <button onClick={copyToClipboard} className={`p-1.5 rounded-md transition-all ${copied ? 'text-green-400 bg-green-400/10' : 'text-indigo-400 hover:text-white hover:bg-white/10'}`} title="העתק">
            {copied ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          </button>
        )}
      </div>
    </div>
  );
};

const AppDownloadCard: React.FC<{ title: string, desc: string, link: string, isRTL: boolean, external?: boolean }> = ({ title, desc, link, isRTL, external }) => {
  return (
    <div className="bg-slate-700/30 border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group">
      <div className="flex-1 text-center sm:text-right">
        <h4 className="text-xl font-black text-white mb-1">{title}</h4>
        <p className="text-gray-400 text-sm">{desc}</p>
      </div>
      <button 
        onClick={() => window.open(link, '_blank')}
        className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95 group-hover:shadow-purple-500/20"
      >
        <span>{external ? 'למעבר לחנות' : 'הורדה מיידית'}</span>
        {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default Profile;
