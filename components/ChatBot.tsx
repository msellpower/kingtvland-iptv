
import React, { useState, useRef, useEffect } from 'react';
// import { sendMessageToGemini } from '../services/geminiService';
import * as sheetService from '../services/sheetService';

import { KNOWLEDGE_BASE } from '../services/knowledgeBase';

const sendMessageToGemini = async (message: string): Promise<string> => {
    try {
        const response = await fetch('/api/public/chat/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        return data.text || "מצטער, נתקלתי בבעיה בחיבור לשירות המלאכותי.";
    } catch (e) {
        console.error("AI Proxy Error", e);
        return "מצטער, הייתה בעיה בחיבור לשרת. נסה שוב.";
    }
};

// Renamed to avoid conflict with global ChatMessage interface
interface AIChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface ChatBotProps {
  user?: any;
  externalOpen?: boolean;
  onToggle?: (open: boolean) => void;
  onNavigate?: (view: any) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ user, externalOpen, onToggle, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [troubleshootStep, setTroubleshootStep] = useState<number>(0);
  const [troubleshootType, setTroubleshootType] = useState<'none' | 'login' | 'streaming'>('none');
  const [troubleshootData, setTroubleshootData] = useState<any>({});
  const [anonMessageCount, setAnonMessageCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-collapse trigger after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Sync with externalOpen prop
  useEffect(() => {
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen);
    }
  }, [externalOpen]);

  // Load anonMessageCount from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('anon_message_count');
    if (savedCount) {
      setAnonMessageCount(parseInt(savedCount, 10));
    }
  }, []);

  // Save anonMessageCount to localStorage
  useEffect(() => {
    localStorage.setItem('anon_message_count', anonMessageCount.toString());
  }, [anonMessageCount]);

  const toggleChat = (val: boolean) => {
    setIsOpen(val);
    if (onToggle) onToggle(val);
  };

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chat_history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Date objects are stored as strings in JSON, need to convert back
        const reconstructedHistory = parsedHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(reconstructedHistory);
      } catch (e) {
        console.error("Failed to parse chat history", e);
        // Fallback if error
        setMessages([
          {
            role: 'model',
            text: 'שלום! אני הטכנאי החכם של KINGTVLAND 🛠️. נתקלת בבעיה? אני כאן לעזור.',
            timestamp: new Date()
          }
        ]);
      }
    } else {
      // Default welcome message if no history
      setMessages([
        {
          role: 'model',
          text: 'שלום! אני הטכנאי החכם של KINGTVLAND 🛠️. נתקלת בבעיה? אני כאן לעזור.',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Save history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const renderMessageText = (text: string) => {
    if (typeof text !== 'string') return text;
    
    const parseBold = (str: string) => {
      const boldRegex = /\*(.*?)\*/g;
      const bParts = [];
      let bLast = 0;
      let bMatch;
      let keyCounter = 0;
      while ((bMatch = boldRegex.exec(str)) !== null) {
          if (bMatch.index > bLast) bParts.push(str.substring(bLast, bMatch.index));
          bParts.push(<strong key={`b-${keyCounter++}-${bMatch.index}`}>{bMatch[1]}</strong>);
          bLast = boldRegex.lastIndex;
      }
      if (bLast < str.length) bParts.push(str.substring(bLast));
      return bParts.length > 0 ? bParts : [str];
    };

    // Check for [Link Text](viewName) pattern
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before link
      if (match.index > lastIndex) {
        parts.push(...parseBold(text.substring(lastIndex, match.index)));
      }

      const linkText = match[1];
      const viewName = match[2];

      parts.push(
        <button 
          key={`link-${match.index}`}
          onClick={() => onNavigate && onNavigate(viewName as any)}
          className="text-purple-400 font-bold underline hover:text-purple-300 transition-colors mx-1 inline-block"
        >
          {linkText}
        </button>
      );

      lastIndex = linkRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(...parseBold(text.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : parseBold(text);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (!user && anonMessageCount >= 2) {
      addBotMessage("להמשך השיחה ולהודעות נוספות, יש להירשם באתר.");
      return;
    }

    const userMsg: AIChatMessage = {
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!user) {
      setAnonMessageCount(prev => prev + 1);
    }
    const currentInput = inputText;
    setInputText('');
    setIsThinking(true);

    // Knowledge Base Lookup
    const kbMatch = KNOWLEDGE_BASE.find(entry => 
      entry.keywords.some(keyword => currentInput.toLowerCase().includes(keyword.toLowerCase()))
    );

    if (kbMatch) {
      addBotMessage(kbMatch.response);
      if (kbMatch.action === 'navigate' && onNavigate && kbMatch.actionValue) {
        setTimeout(() => onNavigate(kbMatch.actionValue), 2000);
      }
      setIsThinking(false);
      return;
    }

    // Troubleshoot Logic
    if (currentInput.includes('לא עובד') || currentInput.includes('תקלה') || currentInput.includes('תקיעות') || currentInput.includes('באפר') || troubleshootStep > 0) {
      handleTroubleshoot(currentInput);
      return;
    }

    const fetchGeminiWithRetry = async (input: string, retries = 3): Promise<string> => {
      try {
        return await sendMessageToGemini(input);
      } catch (error) {
        if (retries > 0) {
          await new Promise(res => setTimeout(res, 2000)); // Wait 2s before retry
          return fetchGeminiWithRetry(input, retries - 1);
        }
        throw error;
      }
    };

    try {
      const responseText = await fetchGeminiWithRetry(currentInput);
      addBotMessage(responseText);
    } catch (error) {
      addBotMessage("מצטער, חלה שגיאה בחיבור לשרת הבינה המלאכותית. אנא נסה שוב בעוד מספר רגעים.");
      console.error("Gemini Error:", error);
    }
    
    setIsThinking(false);
  };

  const addBotMessage = (text: string) => {
    const botMsg: AIChatMessage = {
      role: 'model',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMsg]);
  };

  const handleTroubleshoot = (input: string) => {
    setTimeout(async () => {
      let response = "";
      let nextStep = troubleshootStep;
      let nextType = troubleshootType;

      // Detect Type
      if (troubleshootStep === 0) {
        if (input.includes('תקיעות') || input.includes('באפר')) {
          nextType = 'streaming';
        } else {
          nextType = 'login';
        }
      }

      if (nextType === 'streaming') {
        if (troubleshootStep === 0) {
          response = "שלום 🛡️\nבוא נפתור את בעיית התקיעות. שלב ראשון:\n\n1️⃣ **איפוס ציוד (ריסט):** נתק גם את הראוטר וגם את המכשיר מהחשמל לחלוטין למשך כ-30 שניות. לאחר מכן, חבר אותם חזרה והמתן שהאינטרנט יחזור.\n\nהאם זה עזר? (כן/לא)";
          nextStep = 1;
        } else if (troubleshootStep === 1) {
          if (input.includes('כן')) {
            response = "מעולה! שמחתי לעזור. צפייה מהנה! 📺";
            nextStep = 0;
            nextType = 'none';
          } else {
            response = "הבנתי. האם התקיעות הן בערוצים מסוימים או בכולם?";
            nextStep = 2;
          }
        } else if (troubleshootStep === 2) {
          if (input.includes('כולם')) {
            // Save to system (Mocking sheet update)
            try {
              await sheetService.submitReport({
                planId: user?.subscriptions?.[0]?.planId || 'unknown',
                type: 'streaming_all',
                category: 'ChatBot',
                name: 'כל הערוצים',
                description: `משתמש: ${user?.email || 'אורח'} | דיווח על תקיעה בכל הערוצים`,
                timestamp: new Date().toISOString(),
                status: 'pending'
              });
            } catch (e) {}

            response = "הפניה התקבלה ונשמרה במערכת הניהול ⚙️\nנציג יבדוק את הנושא ויחזור אליך במידת הצורך.";
            nextStep = 0;
            nextType = 'none';
          } else {
            response = "הבנתי. במקרה של תקלה בערוצים מסוימים, יש לדווח עליהם באופן פרטני בדף הדיווח שלנו כדי שהטכנאים יטפלו בזה.\n\n🔗 [לחץ כאן למעבר לדף הדיווח](report)";
            if (onNavigate) {
              setTimeout(() => {
                onNavigate('report');
              }, 5000);
            }
            nextStep = 0;
            nextType = 'none';
          }
        }
      } else {
        // Login / General Fail Flow (Simplified)
        if (troubleshootStep === 0) {
          response = "שלום 🛡️\nבוא נבדוק למה המנוי לא עובד. שלב ראשון:\n\n1️⃣ **בדיקת רשת:** ודא שהמכשיר מחובר לאינטרנט.\n\nהאם זה עזר? (כן/לא)";
          nextStep = 1;
        } else if (troubleshootStep === 1) {
          if (input.includes('כן')) {
            response = "מעולה! צפייה מהנה! 📺";
            nextStep = 0;
            nextType = 'none';
          } else {
            response = "נעבור לשלב הבא:\n\n2️⃣ **איפוס ציוד:** נתק ראוטר ומכשיר מהחשמל ל-30 שניות וחבר חזרה.\n\nהאם זה עזר? (כן/לא)";
            nextStep = 2;
          }
        } else if (troubleshootStep === 2) {
          response = "הפרטים הועברו לטיפול המערכת ⚙️\nנציג יבדוק את תקינות המנוי שלך ויחזור אליך.";
          nextStep = 0;
          nextType = 'none';
        }
      }

      addBotMessage(response);
      setTroubleshootStep(nextStep);
      setTroubleshootType(nextType);
      setIsThinking(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const clearHistory = () => {
    localStorage.removeItem('chat_history');
    setMessages([
      {
        role: 'model',
        text: 'הצ\'אט אופס. איך אפשר לעזור?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-6 md:right-6 z-[500]">
      {!isOpen && (
        <button
          onClick={() => toggleChat(true)}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          className={`ChatBot-trigger bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full p-4 shadow-lg shadow-purple-500/40 transition-all duration-300 hover:scale-110 flex items-center justify-center gap-2 hidden md:flex ${isExpanded ? 'w-auto px-6' : 'w-16 h-16'}`}
          aria-label="תמיכה טכנית"
        >
          <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className={`font-bold transition-all duration-300 overflow-hidden whitespace-nowrap ${isExpanded ? 'max-w-[150px] opacity-100 ml-2' : 'max-w-0 opacity-0 hidden'}`}>תמיכה טכנית</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-slate-800 border border-gray-700 w-[calc(100vw-2rem)] sm:w-96 fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 z-[10001] rounded-2xl shadow-2xl flex flex-col h-[60vh] max-h-[600px] min-h-[400px] overflow-hidden transition-all animate-fade-in-up origin-bottom">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-white font-bold">KING TV Support</h3>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={clearHistory} title="נקה היסטוריה" className="text-gray-400 hover:text-white p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                {/* Close Button */}
                <button onClick={() => toggleChat(false)} className="text-gray-300 hover:text-white p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-slate-700 text-gray-200 rounded-bl-none border border-gray-600'
                  }`}
                >
                  {renderMessageText(msg.text)}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-end">
                <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-600 flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-800 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="כתוב הודעה..."
                className="flex-1 bg-slate-900 border border-gray-600 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isThinking}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
