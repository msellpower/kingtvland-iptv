
import React, { useState, useEffect } from 'react';
import { submitReport } from '../services/dataService';
import { fetchMetadata } from '../services/m3uService';
import { ContentItem } from '../types';
import Spinner from './Spinner';

const PLANS = [
  { id: 'king', name: 'KING' },
  { id: 'vod', name: 'VOD' },
  { id: 'israel', name: 'ISRAEL' },
  { id: 'premium', name: 'PREMIUM' }
];

const CONTENT_TYPES = ['Channel', 'Movie', 'Series'];

const ISSUE_OPTIONS = [
    "לא עובד",
    "איכות ירודה",
    "אין תרגום",
    "אין סאונד",
    "אין וידאו",
    "תקיעות / באפרינג",
    "הערוץ בלופ",
    "אחר"
];

const ReportIssue: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('king');
  const [selectedType, setSelectedType] = useState('Channel');
  
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  
  // Selection States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  
  // Description is now the selected issue from dropdown
  const [issueType, setIssueType] = useState('');
  const [freeText, setFreeText] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContent(selectedPlan);
  }, [selectedPlan]);

  const fetchContent = async (planId: string) => {
    setLoadingContent(true);
    // Clear previous data
    setContent([]);
    
    try {
        // Use fast metadata fetch (TXT files)
        const channels = await fetchMetadata(planId);
        
        // Map to ContentItem with heuristic for Type
        const mappedContent: ContentItem[] = channels.map(ch => {
            const group = (ch.group || '').toLowerCase();
            let type: 'Channel' | 'Movie' | 'Series' = 'Channel';
            
            // Simple heuristic to distinguish VOD from Live based on group name
            if (group.includes('movie') || group.includes('vod') || group.includes('cinema') || group.includes('film')) {
                type = 'Movie';
            } else if (group.includes('series') || group.includes('tv show') || group.includes('série')) {
                type = 'Series';
            }
            
            return {
                type,
                category: ch.group || 'Uncategorized',
                name: ch.name
            };
        });

        console.log("Fetched Metadata for", planId, mappedContent.length, "items");
        setContent(mappedContent);
    } catch (error) {
        console.error("Error fetching content metadata:", error);
        setContent([]);
    }

    setLoadingContent(false);
    
    // Reset fields
    setSelectedCategory('');
    setSelectedName('');
  };

  // Improved Filter Logic: Robust string comparison (case insensitive, trimmed)
  const filteredContent = content.filter(item => 
    item.type.trim().toLowerCase() === selectedType.trim().toLowerCase()
  );

  const categories = Array.from(new Set(filteredContent.map(item => item.category))).sort();
  const names = filteredContent
    .filter(item => item.category === selectedCategory)
    .map(item => item.name)
    .sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const finalDescription = issueType === 'אחר' ? `אחר: ${freeText}` : issueType;

    const success = await submitReport({
        planId: selectedPlan,
        type: selectedType,
        category: selectedCategory,
        name: selectedName,
        season,
        episode,
        description: finalDescription
    });

    setSubmitting(false);
    if (success) {
        alert("הדיווח התקבל בהצלחה! הצוות שלנו יטפל בזה בהקדם.");
        setIssueType('');
        setFreeText('');
        setSelectedName('');
        setSelectedCategory('');
        setSeason('');
        setEpisode('');
    } else {
        alert("אירעה שגיאה בשליחת הדיווח.");
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-2">דיווח על תקלה 🛠️</h1>
            <p className="text-gray-400">נתקלתם בבעיה? מלאו את הטופס ונפתור אותה במהירות האור</p>
        </div>

        <div className="glass-panel p-4 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                
                {/* 1. Plan Selection */}
                <div>
                    <label className="block text-gray-300 font-bold mb-2 text-right">בחר מנוי</label>
                    <div className="grid grid-cols-2 gap-2 md:flex md:gap-4 justify-start">
                        {PLANS.map(plan => (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`py-2 md:py-3 md:flex-1 rounded-xl border font-bold transition-all text-sm md:text-base ${
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

                {/* 2. Type Selection */}
                <div>
                    <label className="block text-gray-300 font-bold mb-2 text-right">סוג התוכן</label>
                    <div className="grid grid-cols-3 gap-2 md:flex md:gap-4">
                        {CONTENT_TYPES.map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => {
                                    setSelectedType(type);
                                    setSelectedCategory('');
                                    setSelectedName('');
                                }}
                                className={`py-2 md:flex-1 rounded-lg text-xs md:text-sm font-medium transition-colors ${
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

                {loadingContent ? (
                    <div className="text-center py-8">
                        <svg className="w-10 h-10 text-cyan-500 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-cyan-400">טוען נתונים מהגלקסיה...</p>
                    </div>
                ) : (
                    <>
                        {content.length === 0 ? (
                             <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-lg text-center flex flex-col items-center gap-2">
                                <p>לא נמצאו נתונים עבור חבילה זו.</p>
                                <button 
                                    type="button" 
                                    onClick={() => fetchContent(selectedPlan)}
                                    className="bg-red-600/50 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
                                >
                                    נסה לרענן
                                </button>
                             </div>
                        ) : (
                            <>
                                {/* 3. Category (Country/Genre) */}
                                <div>
                                    <label className="block text-gray-300 text-sm mb-1">
                                        {selectedType === 'Channel' ? 'מדינה' : 'קטגוריה'}
                                    </label>
                                    <select
                                        required
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            setSelectedName('');
                                        }}
                                        className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                                    >
                                        <option value="">בחר...</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    {categories.length === 0 && (
                                        <div className="mt-2 text-xs text-yellow-500 flex items-center gap-2">
                                            <span>לא נמצאו קטגוריות לסוג זה ({selectedType}).</span>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Name */}
                                <div>
                                    <label className="block text-gray-300 text-sm mb-1">
                                        {selectedType === 'Channel' ? 'שם הערוץ' : 'שם הכותר'}
                                    </label>
                                    <select
                                        required
                                        value={selectedName}
                                        onChange={(e) => setSelectedName(e.target.value)}
                                        disabled={!selectedCategory}
                                        className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 appearance-none"
                                    >
                                        <option value="">בחר...</option>
                                        {names.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 5. Extra details for Series */}
                                {selectedType === 'Series' && (
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-gray-300 text-sm mb-1">עונה</label>
                                            <input
                                                type="text"
                                                value={season}
                                                onChange={(e) => setSeason(e.target.value)}
                                                placeholder="מספר עונה"
                                                className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-gray-300 text-sm mb-1">פרק</label>
                                            <input
                                                type="text"
                                                value={episode}
                                                onChange={(e) => setEpisode(e.target.value)}
                                                placeholder="מספר פרק"
                                                className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* 6. Issue Type Dropdown (Description Replacement) */}
                <div>
                    <label className="block text-gray-300 text-sm mb-1">סוג תקלה</label>
                    <div className="relative">
                        <select
                            required
                            value={issueType}
                            onChange={(e) => setIssueType(e.target.value)}
                            className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
                        >
                            <option value="">בחר סוג תקלה...</option>
                            {ISSUE_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 text-gray-400">
                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Optional Free Text for 'Other' */}
                {issueType === 'אחר' && (
                    <div className="animate-fade-in">
                         <label className="block text-gray-300 text-sm mb-1">פרט את הבעיה</label>
                         <textarea
                            required
                            value={freeText}
                            onChange={(e) => setFreeText(e.target.value)}
                            rows={3}
                            placeholder="כתוב כאן תיאור מפורט..."
                            className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                         ></textarea>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting || (content.length > 0 && !selectedName) || !issueType}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
                >
                    {submitting ? <Spinner /> : 'שלח דיווח'}
                </button>

            </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
