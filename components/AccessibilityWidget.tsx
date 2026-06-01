import React, { useState, useEffect } from 'react';
import { Accessibility, Eye, EyeOff, Type, Sun, Moon, Contrast, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 100, // percentage
    contrast: 'normal', // normal, high, grayscale
    highlightLinks: false,
    readableFont: false,
  });

  const toggleWidget = () => setIsOpen(!isOpen);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      fontSize: 100,
      contrast: 'normal',
      highlightLinks: false,
      readableFont: false,
    });
  };

  // Apply styles to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Font Size
    root.style.fontSize = `${settings.fontSize}%`;
    
    // Contrast & Grayscale
    if (settings.contrast === 'high') {
      root.classList.add('high-contrast');
      root.classList.remove('grayscale-mode');
    } else if (settings.contrast === 'grayscale') {
      root.classList.add('grayscale-mode');
      root.classList.remove('high-contrast');
    } else {
      root.classList.remove('high-contrast', 'grayscale-mode');
    }

    // Highlight Links
    if (settings.highlightLinks) {
      root.classList.add('highlight-links');
    } else {
      root.classList.remove('highlight-links');
    }

    // Readable Font
    if (settings.readableFont) {
      root.classList.add('readable-font');
    } else {
      root.classList.remove('readable-font');
    }

  }, [settings]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleWidget}
        className="fixed bottom-6 right-6 md:left-6 md:right-auto z-[9999] p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 accessibility-trigger-btn hidden md:block"
        aria-label="פתח תפריט נגישות"
        title="תפריט נגישות"
      >
        <Accessibility className="w-8 h-8" />
      </button>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 left-6 right-6 md:right-auto md:left-6 z-[10001] bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-[calc(100vw-3rem)] mx-auto md:mx-0 flex flex-col max-h-[70vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-title"
          >
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white flex-shrink-0">
              <h2 id="a11y-title" className="font-bold text-lg flex items-center gap-2">
                <Accessibility className="w-5 h-5" />
                כלי נגישות
              </h2>
              <button onClick={toggleWidget} className="hover:bg-indigo-700 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto" dir="rtl">
              
              {/* Font Size */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  גודל טקסט
                </label>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => updateSetting('fontSize', Math.max(100, settings.fontSize - 10))}
                    className="flex-1 py-2 bg-white rounded shadow-sm hover:bg-slate-50 text-sm font-bold"
                    aria-label="הקטן טקסט"
                  >
                    A-
                  </button>
                  <span className="flex items-center justify-center px-2 text-xs font-mono text-slate-500 w-12">
                    {settings.fontSize}%
                  </span>
                  <button 
                    onClick={() => updateSetting('fontSize', Math.min(200, settings.fontSize + 10))}
                    className="flex-1 py-2 bg-white rounded shadow-sm hover:bg-slate-50 text-sm font-bold"
                    aria-label="הגדל טקסט"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Contrast Modes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Contrast className="w-4 h-4" />
                  ניגודיות וצבעים
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSetting('contrast', 'normal')}
                    className={`p-2 rounded-lg text-xs font-medium border ${settings.contrast === 'normal' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                  >
                    רגיל
                  </button>
                  <button
                    onClick={() => updateSetting('contrast', 'high')}
                    className={`p-2 rounded-lg text-xs font-medium border ${settings.contrast === 'high' ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'}`}
                  >
                    גבוהה
                  </button>
                  <button
                    onClick={() => updateSetting('contrast', 'grayscale')}
                    className={`p-2 rounded-lg text-xs font-medium border ${settings.contrast === 'grayscale' ? 'bg-gray-200 border-gray-400 text-gray-800' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
                  >
                    אפור
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => updateSetting('highlightLinks', !settings.highlightLinks)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${settings.highlightLinks ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    הדגשת קישורים
                  </span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.highlightLinks ? 'bg-blue-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.highlightLinks ? 'left-1' : 'left-6'}`} />
                  </div>
                </button>

                <button
                  onClick={() => updateSetting('readableFont', !settings.readableFont)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${settings.readableFont ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    גופן קריא
                  </span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.readableFont ? 'bg-blue-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.readableFont ? 'left-1' : 'left-6'}`} />
                  </div>
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetSettings}
                className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                אפס הגדרות
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <a href="/?view=accessibility" className="text-xs text-blue-600 hover:underline">
                  הצהרת נגישות מלאה
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityWidget;
