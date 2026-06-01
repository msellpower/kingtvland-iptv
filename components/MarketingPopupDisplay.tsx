
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { MarketingPopup, Config } from '../types';
import { getPublicSettings } from '../services/sheetService';

const MarketingPopupDisplay: React.FC = () => {
    const [popups, setPopups] = useState<MarketingPopup[]>([]);
    const [currentPopup, setCurrentPopup] = useState<MarketingPopup | null>(null);
    const [shownPopupIds, setShownPopupIds] = useState<string[]>([]);
    const [startTime] = useState<number>(Date.now());

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getPublicSettings();
            if (settings && settings.marketingPopups) {
                const activePopups = settings.marketingPopups
                    .filter((p: MarketingPopup) => p.isActive)
                    .sort((a: MarketingPopup, b: MarketingPopup) => a.order - b.order);
                setPopups(activePopups);
            }
        };
        fetchSettings();

        // Load shown popups from session storage to avoid double popups in same session
        const stored = sessionStorage.getItem('shown_marketing_popups');
        if (stored) {
            setShownPopupIds(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        if (popups.length === 0 || currentPopup) return;

        const interval = setInterval(() => {
            const elapsedTime = (Date.now() - startTime) / 1000;
            
            // Find next popup to show
            const nextPopup = popups.find(p => 
                !shownPopupIds.includes(p.id) && 
                elapsedTime >= p.delaySeconds
            );

            if (nextPopup) {
                setCurrentPopup(nextPopup);
                const newShown = [...shownPopupIds, nextPopup.id];
                setShownPopupIds(newShown);
                sessionStorage.setItem('shown_marketing_popups', JSON.stringify(newShown));
                clearInterval(interval);
            }
        }, 2000); // Check every 2 seconds

        return () => clearInterval(interval);
    }, [popups, shownPopupIds, currentPopup, startTime]);

    if (!currentPopup) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-800 border border-indigo-500/30 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(79,70,229,0.3)] relative animate-scale-in">
                <button 
                    onClick={() => setCurrentPopup(null)}
                    className="absolute top-4 left-4 text-gray-400 hover:text-white p-2 bg-slate-900/50 rounded-full transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="text-center">
                    <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                        <span className="text-4xl animate-bounce">🎁</span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-white mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentPopup.title) }} />
                    
                    <div className="text-gray-300 text-lg mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentPopup.content) }} />
                    
                    <div className="space-y-3">
                        <a 
                            href={currentPopup.ctaLink}
                            onClick={() => setCurrentPopup(null)}
                            className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 text-center transform hover:scale-105"
                        >
                            {currentPopup.ctaText}
                        </a>
                        
                        <button 
                            onClick={() => setCurrentPopup(null)}
                            className="w-full text-gray-500 hover:text-gray-400 font-medium py-2 text-sm transition-colors"
                        >
                            אולי אחר כך
                        </button>
                    </div>
                </div>
                
                {/* Visual accents */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default MarketingPopupDisplay;
