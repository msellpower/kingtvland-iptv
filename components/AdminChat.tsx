
import React, { useState, useEffect, useRef } from 'react';
import { getAdminData, sendChatMessage, markMessagesAsRead, getChatMessages } from '../services/sheetService';
import { ChatSession, ChatMessage } from '../types';

interface AdminChatProps {
    token: string | null;
}

const AdminChat: React.FC<AdminChatProps> = ({ token }) => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]); // Current conversation
    const [adminInput, setAdminInput] = useState('');
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll sessions every 30s (matches cache TTL)
        return () => clearInterval(interval);
    }, [token]);

    // Poll messages for selected session
    useEffect(() => {
        let interval: any;
        if (selectedSession) {
            fetchMessages(selectedSession);
            interval = setInterval(() => fetchMessages(selectedSession), 5000); // Poll messages every 5s
        } else {
            setMessages([]);
        }
        return () => clearInterval(interval);
    }, [selectedSession]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        const res = await getAdminData(token);
        if (res && res.chatSessions) {
            setSessions(res.chatSessions);
            setLastUpdate(new Date());
        }
        setLoading(false);
    };

    const fetchMessages = async (sessionId: string) => {
        if (!sessionId) return;
        const msgs = await getChatMessages(sessionId);
        setMessages(msgs);
    };

    const handleSend = async () => {
        if (!selectedSession || !adminInput.trim()) return;
        const textToSend = adminInput;
        setAdminInput('');
        
        const success = await sendChatMessage(selectedSession, textToSend, 'admin');
        if (success) {
            fetchMessages(selectedSession);
        }
    };

    const handleMarkAsRead = async () => {
        if (!selectedSession) return;
        
        // Optimistic Update: Remove notification badge locally immediately
        setSessions(prev => prev.map(s => 
            s.sessionId === selectedSession ? { ...s, unreadCount: 0 } : s
        ));

        await markMessagesAsRead(selectedSession);
        fetchData(); // Refresh to sync backend state
    };

    return (
        <div className="flex h-[600px] bg-slate-800 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
            {/* Sidebar List */}
            <div className="w-1/3 border-l border-gray-700 bg-slate-900/50 flex flex-col">
                <div className="p-4 bg-slate-900 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-white">שיחות פעילות</h3>
                    <button 
                        onClick={fetchData} 
                        className={`text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 ${loading ? 'animate-spin' : ''}`}
                        title="רענן רשימה"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {sessions.map((s) => (
                        <div 
                            key={s.sessionId}
                            onClick={() => setSelectedSession(s.sessionId)}
                            className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-slate-800 transition-colors relative ${selectedSession === s.sessionId ? 'bg-indigo-900/30 border-r-4 border-indigo-500' : ''}`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className="text-white font-bold text-sm truncate w-24" title={s.sessionId}>{s.sessionId}</span>
                                <span className="text-xs text-gray-500">{s.lastTimestamp.split(' ')[1]}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className={`text-xs truncate max-w-[70%] ${s.unreadCount > 0 ? 'text-white font-bold' : 'text-gray-400'}`}>{s.lastMessage}</p>
                                {s.unreadCount > 0 && (
                                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-green-500/20 animate-pulse">
                                        {s.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {sessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 opacity-50">
                            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <p className="text-sm">אין שיחות פעילות</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-800">
                {selectedSession ? (
                    <>
                        <div className="p-4 bg-slate-900 border-b border-gray-700 flex justify-between items-center shadow-md z-10">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                     {selectedSession.substring(0, 2).toUpperCase()}
                                 </div>
                                 <div>
                                     <h3 className="text-white font-bold text-sm">שיחה עם {selectedSession}</h3>
                                     <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> פעיל</p>
                                 </div>
                             </div>
                             
                             <div className="flex gap-2">
                                <button 
                                    onClick={handleMarkAsRead}
                                    className="text-xs flex items-center gap-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 px-3 py-1.5 rounded-lg transition-colors border border-green-600/30"
                                    title="סמן הכל כנקרא"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7m0 0l-4 4m4-4L9 17" /></svg>
                                    <span className="hidden sm:inline">סמן כנקרא</span>
                                </button>
                                <button onClick={() => setSelectedSession(null)} className="text-xs text-gray-400 hover:text-white bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                                    סגור שיחה
                                </button>
                             </div>
                        </div>
                        
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-black/20 custom-scrollbar">
                             {messages.length === 0 ? (
                                 <div className="text-center text-gray-500 mt-20">
                                     <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                     <p>אין הודעות בשיחה זו</p>
                                 </div>
                             ) : (
                                 messages.map((msg, i) => (
                                     <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                                         <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-md ${
                                             msg.sender === 'admin' 
                                             ? 'bg-indigo-600 text-white rounded-tr-none' 
                                             : 'bg-slate-700 text-gray-100 rounded-tl-none'
                                         }`}>
                                             <p>{msg.text}</p>
                                             <span className="text-[10px] opacity-50 block mt-1 text-left">
                                                 {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                             </span>
                                         </div>
                                     </div>
                                 ))
                             )}
                             <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-gray-700 bg-slate-900">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={adminInput}
                                    onChange={(e) => setAdminInput(e.target.value)}
                                    className="flex-1 bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="הקלד תשובה ללקוח..."
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/20">שלח</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 flex-col bg-slate-800/50">
                        <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <p className="text-lg font-medium">בחר שיחה מהרשימה כדי להתחיל</p>
                        <p className="text-sm opacity-60">השיחות מתעדכנות בזמן אמת</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
