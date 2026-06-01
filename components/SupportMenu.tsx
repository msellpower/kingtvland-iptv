
import React, { useState, useEffect, useRef } from 'react';
import { UserSession, ChatMessage } from '../types';
import { sendChatMessage, getChatMessages } from '../services/sheetService';
import { useLanguage } from '../i18n/LanguageContext';

interface SupportMenuProps {
    user: UserSession | null;
    isSupportActive: boolean;
    onNavigate: (view: any, anchor?: string) => void;
}

const SupportMenu: React.FC<SupportMenuProps> = ({ user, isSupportActive, onNavigate }) => {
    const { t, isRTL } = useLanguage();
    // State for Live Chat
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [sessionId] = useState(() => localStorage.getItem('chat_session_id') || `guest_${Math.random().toString(36).substr(2, 9)}`);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        const history = await getChatMessages(sessionId);
        if (history.length > 0) {
             setMessages(history);
             scrollToBottom();
        }
    };

    // Save session ID
    useEffect(() => {
        localStorage.setItem('chat_session_id', sessionId);
    }, [sessionId]);

    // Poll for messages when chat is open
    useEffect(() => {
        let interval: any;
        if (isChatOpen) {
            fetchMessages();
            interval = setInterval(fetchMessages, 5000);
        }
        return () => clearInterval(interval);
    }, [isChatOpen]);

    if (!isSupportActive) return null;

    const handleSend = async () => {
        if (!input.trim()) return;
        const tempMsg: ChatMessage = {
            sessionId,
            sender: 'user',
            text: input,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        setMessages(prev => [...prev, tempMsg]);
        setInput('');
        
        await sendChatMessage(sessionId, tempMsg.text, 'user');
        fetchMessages();
    };

    const handleWhatsApp = () => {
        const phoneNumber = "972549946953"; 
        const message = encodeURIComponent(t('support.chat.whatsappMsg'));
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    const handleTelegram = () => {
        window.open('https://t.me/King_tv_land', '_blank');
    };

    const isVip = user?.subscriptions.some(sub => sub.serviceLevel === 'VIP');

    return (
        <>
            {/* 1. Telegram Button (Side Widget) */}
            <div className={`fixed ${isRTL ? 'right-0' : 'left-0'} top-1/2 transform -translate-y-1/2 z-[500] group hidden md:block`}>
                <button
                    onClick={handleTelegram}
                    className={`bg-[#0088cc] text-white p-2 ${isRTL ? 'rounded-l-lg translate-x-2' : 'rounded-r-lg -translate-x-2'} shadow-lg shadow-blue-500/30 transition-all duration-300 hover:translate-x-0 flex items-center gap-2`}
                    aria-label={t('support.telegram')}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.56 8.35c.108-1.127-.197-2.348-.962-3.15-.765-.802-1.89-1.116-2.923-1.026l-7.79 3.097c-1.13.45-1.996 1.41-2.288 2.583-.292 1.173.047 2.458.91 3.298l2.062 1.954-1.78 6.44c-.114.417.02.857.348 1.144.328.287.77.346 1.156.155l10.965-5.58c.456-.233.79-.652.91-1.157z"/></svg>
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold opacity-0 group-hover:opacity-100">
                        {t('support.telegram')}
                    </span>
                </button>
            </div>

            {/* Support Actions Container */}
            <div className={`fixed bottom-24 ${isRTL ? 'right-6' : 'left-6'} z-[500] flex flex-col-reverse items-end gap-4 animate-fade-in-up hidden md:flex`}>
            
            {/* VIP Only Buttons or Nudge */}
            {isVip ? (
                <>
                    {/* 2. WhatsApp Button */}
                    <div className={`group relative flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <button
                            onClick={handleWhatsApp}
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-full shadow-lg shadow-green-500/30 transition-transform hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        </button>
                        <span className={`bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform ${isRTL ? 'translate-x-2' : '-translate-x-2'} pointer-events-none`}>
                            {t('support.whatsapp')}
                        </span>
                    </div>

                    {/* 3. Live Chat Trigger */}
                    <div className={`group relative flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <button
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-full shadow-lg shadow-indigo-500/30 transition-transform hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </button>
                        <span className={`bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform ${isRTL ? 'translate-x-2' : '-translate-x-2'} pointer-events-none`}>
                            {t('support.chat')}
                        </span>
                    </div>
                </>
            ) : (
                <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center shadow-2xl max-w-[200px]">
                    <p className="text-[10px] text-gray-400 mb-2 leading-tight">{t('support.vipOnly')}</p>
                    <button 
                        onClick={() => onNavigate('home', 'pricing')} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-colors w-full"
                    >
                         {t('pricing.chooseVIP')}
                    </button>
                </div>
            )}

            {/* Live Chat Window (Only visible if opened by VIP) */}
            {isChatOpen && user && (
                <div className={`fixed bottom-24 left-4 right-4 sm:left-auto sm:${isRTL ? 'right-6' : 'left-6'} z-[10001] bg-slate-800 border border-gray-600 w-[calc(100vw-2rem)] sm:w-80 h-[450px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in origin-bottom`} dir={isRTL ? 'rtl' : 'ltr'}>
                    {/* Header */}
                    <div className="bg-indigo-600 p-3 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <h3 className="font-bold text-sm">{t('support.chat.title')}</h3>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="hover:bg-indigo-700 p-1 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 bg-slate-900/50 p-4 overflow-y-auto space-y-4">
                        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                             <div className={`bg-slate-700 text-gray-200 rounded-2xl ${isRTL ? 'rounded-tr-none' : 'rounded-tl-none'} px-3 py-2 text-sm border border-gray-600 max-w-[90%]`}>
                                 {t('support.chat.welcome').replace('{name}', user.email.split('@')[0])}
                             </div>
                        </div>

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? (isRTL ? 'justify-end' : 'justify-start') : (isRTL ? 'justify-start' : 'justify-end')}`}>
                                <div className={`px-3 py-2 rounded-2xl text-sm max-w-[90%] ${
                                    msg.sender === 'user' 
                                    ? `bg-indigo-600 text-white ${isRTL ? 'rounded-tl-none' : 'rounded-tr-none'}` 
                                    : `bg-slate-700 text-gray-200 ${isRTL ? 'rounded-tr-none' : 'rounded-tl-none'} border border-gray-600`
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="bg-slate-800 p-3 border-t border-gray-700">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={t('support.chat.placeholder')}
                                className="flex-1 bg-slate-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg">
                                <svg className={`w-5 h-5 transform ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default SupportMenu;
