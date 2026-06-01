
import React, { useState } from 'react';
import { submitRequest } from '../services/dataService';
import Spinner from './Spinner';

const PLANS = [
  { id: 'king', name: 'KING' },
  { id: 'vod', name: 'VOD' },
  { id: 'israel', name: 'ISRAEL' },
  { id: 'premium', name: 'PREMIUM' }
];

const CONTENT_TYPES = ['Channel', 'Movie', 'Series'];

const RequestContent: React.FC = () => {
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('king');
  const [selectedType, setSelectedType] = useState('Movie');
  const [contentName, setContentName] = useState('');
  const [details, setDetails] = useState(''); // Season/Episode or other notes
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentName.trim() || !email.trim()) return;

    setSubmitting(true);

    const success = await submitRequest({
        email,
        planId: selectedPlan,
        type: selectedType,
        contentName,
        details
    });

    setSubmitting(false);
    if (success) {
        alert("הבקשה נשלחה בהצלחה! נעשה מאמץ להוסיף את התוכן בהקדם.");
        setContentName('');
        setDetails('');
    } else {
        alert("אירעה שגיאה בשליחת הבקשה.");
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen space-gradient">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-2">בקשת תוכן 🎬</h1>
            <p className="text-gray-400">לא מצאתם את מה שחיפשתם? תבקשו ונדאג להוסיף!</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email */}
                <div>
                    <label className="block text-gray-300 font-bold mb-2">אימייל ליצירת קשר</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                </div>

                {/* Plan Selection */}
                <div>
                    <label className="block text-gray-300 font-bold mb-2">לאיזה מנוי?</label>
                    <div className="flex gap-4 flex-wrap">
                        {PLANS.map(plan => (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`flex-1 min-w-[100px] py-3 rounded-xl border font-bold transition-all ${
                                    selectedPlan === plan.id 
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30' 
                                    : 'bg-slate-800 border-gray-700 text-gray-400 hover:border-gray-500'
                                }`}
                            >
                                {plan.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Type Selection */}
                <div>
                    <label className="block text-gray-300 font-bold mb-2">סוג התוכן</label>
                    <div className="flex gap-4">
                        {CONTENT_TYPES.map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setSelectedType(type)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedType === type
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                {type === 'Channel' ? 'ערוץ טלוויזיה' : (type === 'Movie' ? 'סרט' : 'סדרה')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Name */}
                <div>
                    <label className="block text-gray-300 font-bold mb-2">
                        {selectedType === 'Channel' ? 'שם הערוץ המבוקש' : 'שם הסרט / הסדרה'}
                    </label>
                    <input
                        type="text"
                        required
                        disabled={submitting}
                        value={contentName}
                        onChange={(e) => setContentName(e.target.value)}
                        placeholder={selectedType === 'Channel' ? 'למשל: ערוץ הספורט 5 לייב' : 'למשל: הנוקמים: סוף המשחק'}
                        className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    />
                </div>

                {/* Extra Details (Season/Episode/Notes) */}
                <div>
                    <label className="block text-gray-300 text-sm mb-1">
                        {selectedType === 'Series' ? 'עונה / פרק (אופציונלי)' : 'הערות נוספות'}
                    </label>
                    <input
                        type="text"
                        disabled={submitting}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder={selectedType === 'Series' ? 'עונה 3 פרק 5' : 'שנת יציאה, שפה וכו\''}
                        className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
                >
                    {submitting ? <Spinner /> : 'שלח בקשה'}
                </button>

            </form>
        </div>
      </div>
    </div>
  );
};

export default RequestContent;
