
import React, { useState } from 'react';
import { UserSession, ReferralData } from '../types';
import { getReferralStatus } from '../services/sheetService';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../i18n/LanguageContext';

interface PromotionsProps {
  user: UserSession | null;
  onAuthRequired?: () => void;
}

const Promotions: React.FC<PromotionsProps> = ({ user, onAuthRequired }) => {
  const { t, isRTL } = useLanguage();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loadingRef, setLoadingRef] = useState(false);
  
  const [renewCoupon, setRenewCoupon] = useState<{code: string, discount: string} | null>(null);
  const [renewMessage, setRenewMessage] = useState<string>('');

  const generateCode = (prefix: string) => {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${random}`;
  };

  const handleFriendCoupon = async () => {
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      else toast.error('יש להתחבר או להירשם על מנת לאפשר קבלת קוד');
      return;
    }
    if (referralData) return;
    setLoadingRef(true);
    // Fetch or create code from backend
    const data = await getReferralStatus(user.email);
    if (data) {
        setReferralData(data);
    } else {
        // Fallback demo data if backend fails
        setReferralData({ code: generateCode('FRIEND'), count: 0, rewardsAvailable: 0 });
    }
    setLoadingRef(false);
  };

  const handleRenewCoupon = () => {
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      else toast.error('יש להתחבר או להירשם על מנת לאפשר קבלת קוד');
      return;
    }
    // Logic: 
    // > 90 days (3 months) -> 20%
    // < 14 days (2 weeks) -> 10%
    // Else -> Not eligible yet
    
    // Check all subscriptions and take the best offer eligible
    let bestOffer = 0; // 0 = none, 1 = 10%, 2 = 20%

    // Helper to parse DD/MM/YYYY
    const parseDate = (dateStr: string) => {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return new Date(); // fallback
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    };

    const now = new Date();

    user.subscriptions.forEach(sub => {
      const expDate = parseDate(sub.expireDate);
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 90) { // 3 months
        if (bestOffer < 2) bestOffer = 2;
      } else if (diffDays <= 14 && diffDays > 0) { // 2 weeks
        if (bestOffer < 1) bestOffer = 1;
      }
    });

    if (bestOffer === 2) {
      setRenewCoupon({ code: generateCode('EARLY20'), discount: '20%' });
      setRenewMessage('');
    } else if (bestOffer === 1) {
      setRenewCoupon({ code: generateCode('LAST10'), discount: '10%' });
      setRenewMessage('');
    } else {
      setRenewMessage('לא נמצא מנוי העומד בתנאי המבצע כרגע (3 חודשים או שבועיים לפני סיום).');
      setRenewCoupon(null);
    }
  };

  // Calculate progress for the circular bar or linear bar
  const referralCount = referralData?.count || 0;
  const progressPercent = Math.min((referralCount % 6) / 6 * 100, 100);
  const nextMilestone = 6 - (referralCount % 6);

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-4">מבצעים בלעדיים למנויים 🎁</h1>
        <p className="text-xl text-indigo-300">הטבות מיוחדות שאסור לפספס</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Deal 1: Friend Brings Friend (Referral) */}
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-8 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
            הכי שווה
          </div>
          <h2 className="text-3xl font-black text-white mb-2">חבר מביא חבר 🤝</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            שלחו לחברים קופון ל-<strong>10% הנחה</strong>.<br/>
            על כל <strong>6 חברים</strong> שיצטרפו, תקבלו <strong>חודש מתנה</strong> למנוי שלכם!
          </p>
          
          <div className="mt-auto">
            {!referralData ? (
                <button 
                onClick={handleFriendCoupon}
                disabled={loadingRef}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-green-500/20 flex justify-center items-center gap-2"
                >
                {loadingRef ? (
                     <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'יצירת קוד הזמנה אישי'}
                </button>
            ) : (
                <div className="animate-fade-in space-y-6">
                    {/* Code Display */}
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-green-500/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <p className="text-gray-300 text-sm mb-1">הקוד האישי שלך:</p>
                        <div className="text-3xl font-mono font-black text-green-400 tracking-wider select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(referralData.code)}>
                            {referralData.code}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">לחצו להעתקה</p>
                    </div>

                    {/* Progress Bar */}
                    <div>
                         <div className="flex justify-between text-sm mb-2 text-white font-bold">
                             <span>ההתקדמות שלך:</span>
                             <span>{referralCount % 6} / 6 חברים</span>
                         </div>
                         <div className="w-full bg-black/40 rounded-full h-4 overflow-hidden border border-white/10">
                             <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-400 h-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${progressPercent}%` }}
                             >
                                 {progressPercent >= 100 && <div className="absolute inset-0 animate-pulse bg-white/30"></div>}
                             </div>
                         </div>
                         <p className="text-xs text-green-300 mt-2 text-center">
                             {referralData.rewardsAvailable > 0 
                                ? `🎉 מגיע לך ${referralData.rewardsAvailable} חודשים מתנה! פנה לנציג.` 
                                : `עוד ${nextMilestone} חברים לקבלת חודש חינם!`}
                         </p>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Deal 2: Early Renewal */}
        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-2xl p-8 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
            חיסכון
          </div>
          <h2 className="text-3xl font-black text-white mb-2">חידוש מנוי 🔄</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            מחדשים את המנוי <strong>3 חודשים</strong> לפני סיום ונהנים מ-20% הנחה! <br/>
            נזכרתם רק <strong>שבועיים</strong> לפני? קבלו 10% הנחה.
          </p>
          
          <div className="mt-auto">
            {!renewCoupon && !renewMessage && (
                <button 
                onClick={handleRenewCoupon}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
                >
                בדוק זכאות לקוד
                </button>
            )}

            {renewMessage && (
                <div className="bg-orange-900/50 text-orange-200 p-3 rounded-lg border border-orange-500/30 text-sm text-center">
                {renewMessage}
                </div>
            )}

            {renewCoupon && (
                <div className="animate-fade-in bg-white/10 p-4 rounded-xl border border-white/20 text-center">
                    <p className="text-gray-300 text-sm mb-1">הקוד שלך ל-{renewCoupon.discount} הנחה:</p>
                    <div className="text-2xl font-mono font-bold text-orange-400 tracking-wider select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(renewCoupon.code)}>
                    {renewCoupon.code}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">צלם מסך או העתק ושלח לנציג</p>
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Promotions;
