
import React, { useState } from 'react';
import { ResellerPackage } from '../types';
import ResellerRegisterModal from './ResellerRegisterModal';

interface ResellerProgramProps {
    onNavigate: (view: any) => void;
}

const PACKAGES: ResellerPackage[] = [
    {
        id: 'starter',
        name: 'מתחילים (Starter)',
        price: 1200,
        credits: 10,
        features: [
            'פאנל ניהול בסיסי (DNS)',
            '10 קרדיטים שנתיים (שווי 2,500₪)',
            'תמיכה טכנית בוואטסאפ',
            'ניתן להטעין קרדיטים מחדש',
            'מנוי קינג או ישראלי בלבד',
            'אופציה: אתר מכירות מלא (כמו זה!) ב-1,500₪'
        ]
    },
    {
        id: 'pro',
        name: 'מקצוענים (Tycoon)',
        price: 3500,
        credits: 30,
        features: [
            'אתר מכירות מלא (כמו זה!)',
            'מיתוג האתר והלוגו לבחירתך',
            'פאנל ניהול מתקדם + CRM',
            '30 קרדיטים שנתיים (שווי 7,500₪)',
            'חיבור סליקה (אופציונלי)',
            'הדרכה אישית 1 על 1',
            'ניתן להטעין קרדיטים מחדש',
            'מנוי קינג או ישראלי בלבד'
        ],
        isPopular: true
    },
    {
        id: 'empire',
        name: 'אימפריה (Empire)',
        price: 10000,
        credits: 100,
        features: [
            'אתר מכירות מלא (כמו זה!)',
            'מיתוג האתר והלוגו לבחירתך',
            '100 קרדיטים שנתיים (שווי 25,000₪)',
            'פאנל ניהול מתקדם + CRM',
            'חיבור סליקה (אופציונלי)',
            'הדרכה אישית 1 על 1',
            'מערכת שותפים משלך',
            'ניתן להטעין קרדיטים מחדש',
            'מנוי קינג או ישראלי בלבד'
        ]
    }
];

const ResellerProgram: React.FC<ResellerProgramProps> = ({ onNavigate }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0f0c29] space-gradient pt-24 pb-20 px-4">
        
        {/* Registration Modal */}
        {selectedPlan && (
            <ResellerRegisterModal 
                planName={selectedPlan} 
                onClose={() => setSelectedPlan(null)} 
            />
        )}
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
                אל תהיה רק לקוח. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    תהיה הבעלים.
                </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                הצטרף למהפכת הסטרימינג והתחל עסק רווחי משלך בתוך 24 שעות. 
                אנחנו מספקים לך את הטכנולוגיה, התוכן והפלטפורמה - אתה דואג רק למכור.
            </p>
        </div>

        {/* Stats / Proof */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            <StatBox icon="📈" value="₪50k+" label="הכנסה חודשית ממוצעת לזכיין" />
            <StatBox icon="🌍" value="100%" label="עבודה מכל מקום בעולם" />
            <StatBox icon="⚡" value="24h" label="זמן הקמה עד למכירה ראשונה" />
        </div>

        {/* Packages */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {PACKAGES.map((pkg) => (
                <div 
                    key={pkg.id} 
                    className={`relative bg-slate-800/40 backdrop-blur-xl border rounded-3xl p-8 flex flex-col transition-transform hover:-translate-y-2 ${
                        pkg.isPopular 
                        ? 'border-yellow-500/50 shadow-2xl shadow-yellow-500/10 scale-105 z-10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                >
                    {pkg.isPopular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-6 py-1 rounded-full text-sm">
                            הכי משתלם
                        </div>
                    )}

                    <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                    <div className="text-4xl font-black text-white mb-6">
                        ₪{pkg.price.toLocaleString()}
                        <span className="text-lg font-normal text-gray-400"> / חד פעמי</span>
                    </div>

                    <div className="flex-1 space-y-4 mb-8">
                        {pkg.features.map((feat, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-gray-300 text-sm">{feat}</span>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setSelectedPlan(pkg.name)}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                            pkg.isPopular
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:opacity-90'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                    >
                        אני רוצה להתחיל
                    </button>
                </div>
            ))}
        </div>

        {/* Important Notes */}
        <div className="max-w-4xl mx-auto mb-20 text-center bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <p className="text-yellow-400 font-bold mb-2">💡 מידע חשוב לזכיינים:</p>
            <ul className="text-gray-300 text-sm space-y-1">
                <li>• המחירים לעיל מתייחסים למנויי KING או ישראלי בלבד.</li>
                <li>• עבור מנויי פרימיום, העלות לזכיין גבוהה ב-60%.</li>
                <li>• ניתן להטעין את המנוי בקרדיטים מחדש בכל עת בהתאם לכמות המנויים הפעילים.</li>
            </ul>
        </div>

        {/* Why Us */}
        <div className="max-w-4xl mx-auto bg-slate-900/50 p-10 rounded-3xl border border-gray-700 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">למה לעבוד איתנו?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                <div>
                    <h4 className="text-white font-bold text-xl mb-2">🚀 טכנולוגיה מוכנה</h4>
                    <p className="text-gray-400">אתה לא צריך מתכנתים. אתה מקבל אתר מלא (כמו זה), מערכת CRM לניהול לקוחות, ופאנל ניהול מתקדם שמאפשר לך לשלוט בהכל בלחיצת כפתור.</p>
                </div>
                <div>
                    <h4 className="text-white font-bold text-xl mb-2">💰 רווח נקי עצום</h4>
                    <p className="text-gray-400">עלות המנוי לזכיין היא אפסית. אתה מוכר ב-250₪ מנוי שעלה לך שקלים בודדים (במסגרת הקרדיטים). שולי רווח של 90%.</p>
                </div>
            </div>
        </div>

    </div>
  );
};

const StatBox = ({ icon, value, label }: any) => (
    <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5 text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <div className="text-3xl font-black text-white mb-1">{value}</div>
        <div className="text-gray-400 text-sm">{label}</div>
    </div>
);

export default ResellerProgram;
