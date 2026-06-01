import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface PurchaseTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const PurchaseTermsModal: React.FC<PurchaseTermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500"></div>
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          תקנון שירות IPTV KINGTVLAND
        </h2>

        <div className={`space-y-4 text-sm text-gray-300 ${isRTL ? 'text-right' : 'text-left'} bg-black/30 p-4 rounded-2xl border border-white/5 w-full`}>
          <p>
            <strong className="text-white block mb-1">ביטולים והחזרים:</strong>
            ניתן לבטל עסקה בהתאם לחוק הגנת הצרכן - ניתן לבטל רק ב 24 שעות הראשונות.
          </p>
          <p>
            <strong className="text-white block mb-1">אין מעבר חבילות:</strong>
            לא ניתן להחליף או לשדרג/לשנמך חבילה לאחר הרכישה.
          </p>
          <p>
            <strong className="text-white block mb-1">תמיכה טכנית:</strong>
            אנו מספקים תמיכה טכנית למנוי VIP בלבד ולא למנויים פעילים רגילים.
          </p>
          <p>
            <strong className="text-white block mb-1">אחריות שירות:</strong>
            השירות מבוסס אינטרנט. הלקוח מאשר כי ייתכנו שיבושים זמניים. המערכת פועלת ביעילות ממוצעת של 94% בשנה.
          </p>
        </div>

        <p className="mt-6 text-indigo-300 font-medium text-sm">
          המשך שימוש בשירות מהווה הסכמה מלאה לתקנון זה.
        </p>

        <div className="mt-8 flex w-full gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10"
          >
            ביטול
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)] active:scale-95"
          >
            מאשר וממשיך
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTermsModal;
