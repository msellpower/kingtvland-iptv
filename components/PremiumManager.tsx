
import React, { useState, useEffect } from 'react';
import { managePremiumApi, syncPremiumUserToSheet } from '../services/sheetService';
import { PremiumPackage, PremiumResellerInfo } from '../types';

const PremiumManager: React.FC = () => {
    const [tab, setTab] = useState<'create' | 'renew' | 'info'>('create');
    const [resellerInfo, setResellerInfo] = useState<PremiumResellerInfo | null>(null);
    const [packages, setPackages] = useState<PremiumPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState<any>(null);

    // Form States
    const [subType, setSubType] = useState<'m3u' | 'mag'>('m3u');
    const [mac, setMac] = useState(''); 
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [duration, setDuration] = useState('12');
    const [selectedPack, setSelectedPack] = useState('');
    const [notes, setNotes] = useState('');
    const [country, setCountry] = useState('IL');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        // 1. Get Reseller Info
        const infoRes = await managePremiumApi({ subAction: 'reseller' });
        if (infoRes.result === 'success' && infoRes.data?.[0]) {
            setResellerInfo(infoRes.data[0]);
        }

        // 2. Get Packages
        const packRes = await managePremiumApi({ subAction: 'bouquet' });
        if (packRes.result === 'success' && Array.isArray(packRes.data)) {
            setPackages(packRes.data);
            if (packRes.data.length > 0) setSelectedPack(packRes.data[0].id);
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setApiResponse(null);

        const payload: any = {
            subAction: 'new',
            type: subType,
            sub: duration,
            pack: selectedPack,
            notes: notes || 'נוצר ע"י מנהל',
            country: country,
            isTrial: false // Explicitly not a trial
        };

        if (subType === 'mag') {
            if (!mac) { alert("חובה להזין כתובת MAC"); setLoading(false); return; }
            payload.mac = mac; 
        } else {
            if (username) payload.username = username;
            if (password) payload.password = password;
        }

        const res = await managePremiumApi(payload);
        setApiResponse(res.data?.[0] || res.error);
        
        if (res.result === 'success') fetchInitialData();
        setLoading(false);
    };

    const handleCreateTrial = async () => {
        setLoading(true);
        setApiResponse(null);

        // Generate a random username if not provided
        const trialUser = username || `Trial_${Math.floor(1000 + Math.random() * 9000)}`;
        const trialPass = password || Math.floor(100000 + Math.random() * 900000).toString();

        const payload: any = {
            subAction: 'new',
            type: 'm3u', 
            sub: '0', // 0 usually denotes trial in standard Xtream APIs
            username: trialUser,
            password: trialPass,
            pack: selectedPack,
            notes: '24H Trial - Admin Generated',
            country: country,
            isTrial: true // Flag for Backend Sheet Sync
        };
        
        const res = await managePremiumApi(payload);
        
        // Handle result logic: if API returns array, take first. If object, take it.
        const resultData = Array.isArray(res.data) ? res.data[0] : res.data;
        
        // Ensure the response has the credentials we generated if API didn't return them explicitly
        if (res.result === 'success' && resultData) {
             if (!resultData.username) resultData.username = trialUser;
             if (!resultData.password) resultData.password = trialPass;
             // Construct fallback URL if not returned
             if (!resultData.url) {
                 resultData.url = `http://shown66208.cdn-akm.me/get.php?username=${resultData.username}&password=${resultData.password}&type=m3u_plus&output=hls`;
             }
        }

        setApiResponse(resultData || res.error);
        
        if (res.result === 'success') fetchInitialData();
        setLoading(false);
    };

    const handleRenew = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setApiResponse(null);

        const payload: any = {
            subAction: 'renew',
            type: subType,
            sub: duration,
            isTrial: false
        };

        if (subType === 'mag') {
             if (!mac) { alert("חובה להזין MAC"); setLoading(false); return; }
             payload.mac_renew = mac; 
        } else {
             if (!username || !password) { alert("חובה להזין שם משתמש וסיסמה"); setLoading(false); return; }
             payload.username = username;
             payload.password = password;
        }

        const res = await managePremiumApi(payload);
        setApiResponse(res.data?.[0] || res.error);
        if (res.result === 'success') fetchInitialData();
        setLoading(false);
    };

    const handleInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setApiResponse(null);

        const payload: any = { subAction: 'device_info' };
        
        if (subType === 'mag') {
             if (!mac) { alert("חובה להזין MAC"); setLoading(false); return; }
             payload.mac_renew = mac; 
        } else {
             if (!username || !password) { alert("חובה להזין שם משתמש וסיסמה"); setLoading(false); return; }
             payload.username = username;
             payload.password = password;
        }

        const res = await managePremiumApi(payload);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setApiResponse(data || res.error);
        setLoading(false);
    };

    const toggleUserStatus = async (userId: string, currentStatus: string) => {
        if (!userId) return;
        setLoading(true);
        const newStatus = currentStatus === '1' ? 'disable' : 'enable'; 
        
        const res = await managePremiumApi({
            subAction: 'device_status',
            id: userId,
            status: newStatus
        });

        if (res.result === 'success') {
            alert(res.data?.[0]?.message || 'סטטוס שונה בהצלחה');
            const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
            handleInfo(fakeEvent);
        } else {
            alert('שגיאה בשינוי סטטוס');
        }
        setLoading(false);
    };

    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-gray-700 shadow-xl max-w-5xl mx-auto">
            
            {/* Header / Stats */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        ניהול ספק פרימיום
                    </h2>
                    <p className="text-gray-400 text-sm">my8k.me API Integration</p>
                </div>
                <div className="bg-indigo-900/50 px-6 py-3 rounded-xl border border-indigo-500/30 text-center">
                    <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider">יתרת קרדיטים</p>
                    <p className="text-2xl font-black text-white">{resellerInfo ? resellerInfo.credits : '...'}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-slate-900/50 p-1 rounded-xl">
                <TabButton active={tab === 'create'} onClick={() => setTab('create')} label="יצירת מנוי חדש" icon="plus" />
                <TabButton active={tab === 'renew'} onClick={() => setTab('renew')} label="חידוש מנוי" icon="refresh" />
                <TabButton active={tab === 'info'} onClick={() => setTab('info')} label="פרטי מנוי / חיפוש" icon="search" />
            </div>

            {/* Content Forms */}
            <div className="bg-slate-900 p-6 rounded-xl border border-gray-700">
                <form onSubmit={tab === 'create' ? handleCreate : (tab === 'renew' ? handleRenew : handleInfo)}>
                    
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">סוג מכשיר</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-white cursor-pointer">
                                    <input type="radio" name="type" checked={subType === 'm3u'} onChange={() => setSubType('m3u')} className="accent-purple-500" />
                                    <span>M3U (רשימה)</span>
                                </label>
                                <label className="flex items-center gap-2 text-white cursor-pointer">
                                    <input type="radio" name="type" checked={subType === 'mag'} onChange={() => setSubType('mag')} className="accent-purple-500" />
                                    <span>MAG (ממיר)</span>
                                </label>
                            </div>
                        </div>

                        {/* Fields based on Type & Tab */}
                        {subType === 'mag' ? (
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">כתובת MAC</label>
                                <input type="text" value={mac} onChange={e => setMac(e.target.value)} placeholder="00:1A:79:..." className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                            </div>
                        ) : (
                            /* M3U Fields */
                            <>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">שם משתמש {tab === 'create' && '(אופציונלי)'}</label>
                                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 text-white" placeholder={tab === 'create' ? 'השאר ריק ליצירה אוטומטית' : ''} />
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <label className="block text-gray-400 text-sm mb-2">סיסמה {tab === 'create' && '(אופציונלי)'}</label>
                                    <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 text-white" placeholder={tab === 'create' ? 'השאר ריק ליצירה אוטומטית' : ''} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Create / Renew Specifics */}
                    {tab !== 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">תקופה (חודשים)</label>
                                <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 text-white">
                                    <option value="1">חודש 1</option>
                                    <option value="3">3 חודשים</option>
                                    <option value="6">6 חודשים</option>
                                    <option value="12">12 חודשים</option>
                                </select>
                            </div>

                            {tab === 'create' && (
                                <>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">חבילת ערוצים (Bouquet)</label>
                                        <select value={selectedPack} onChange={e => setSelectedPack(e.target.value)} className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 text-white">
                                            {packages.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">מדינה (קוד 2 אותיות)</label>
                                        <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">הערות (עבור לקוח)</label>
                                        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Email / Note" className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {tab !== 'info' && (
                        <div className="flex items-center gap-2 mb-4 text-xs text-green-400 bg-green-900/20 p-2 rounded border border-green-900/30">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>הנתונים יסונכרנו אוטומטית ל-CRM</span>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`flex-1 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
                                tab === 'create' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 
                                tab === 'renew' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20' : 
                                'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                            }`}
                        >
                            {loading ? 'מבצע פעולה...' : (tab === 'create' ? 'צור מנוי' : tab === 'renew' ? 'חדש מנוי' : 'קבל פרטים')}
                        </button>

                        {tab === 'create' && (
                            <button 
                                type="button"
                                onClick={handleCreateTrial}
                                disabled={loading}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                יצירת ניסיון (24 שעות)
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Rich Result Card */}
            {apiResponse && (
                <div className="mt-8 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        {apiResponse.username || apiResponse.mac ? (
                            <>
                                <span className="bg-green-500/20 text-green-400 p-1 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span>
                                פעולה הושלמה בהצלחה
                            </>
                        ) : (
                            <span className="text-red-400">שגיאה: {JSON.stringify(apiResponse)}</span>
                        )}
                    </h3>

                    {(apiResponse.username || apiResponse.mac) && (
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border border-indigo-500/30 overflow-hidden shadow-2xl">
                            
                            {/* Header Stripe */}
                            <div className="bg-indigo-600/20 px-6 py-3 border-b border-indigo-500/20 flex justify-between items-center">
                                <span className="text-indigo-300 font-bold text-sm tracking-wider uppercase">פרטי מנוי</span>
                                <span className="text-xs text-gray-400">
                                    {apiResponse.exp_date ? `בתוקף עד: ${new Date(apiResponse.exp_date * 1000).toLocaleDateString()}` : 'מנוי פעיל'}
                                </span>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Username */}
                                {apiResponse.username && <CopyRow label="שם משתמש" value={apiResponse.username} />}
                                
                                {/* Password */}
                                {apiResponse.password && <CopyRow label="סיסמה" value={apiResponse.password} />}
                                
                                {/* MAC (If MAG) */}
                                {apiResponse.mac && <CopyRow label="MAC Address" value={apiResponse.mac} />}

                                {/* M3U Link (If M3U) */}
                                {(apiResponse.url || (apiResponse.username && apiResponse.password)) && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-gray-400 text-xs mb-2">קישור M3U מלא:</p>
                                        <div className="flex gap-2">
                                            <input 
                                                readOnly 
                                                value={apiResponse.url || `http://shown66208.cdn-akm.me/get.php?username=${apiResponse.username}&password=${apiResponse.password}&type=m3u_plus&output=hls`} 
                                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-green-300 font-mono focus:outline-none"
                                            />
                                            <button 
                                                onClick={() => {
                                                    const url = apiResponse.url || `http://shown66208.cdn-akm.me/get.php?username=${apiResponse.username}&password=${apiResponse.password}&type=m3u_plus&output=hls`;
                                                    navigator.clipboard.writeText(url);
                                                    alert("הועתק!");
                                                }}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                העתק
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Status Bar (for Info Tab) */}
                            {tab === 'info' && apiResponse.user_id && (
                                <div className="bg-black/20 px-6 py-3 border-t border-white/10 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${apiResponse.enabled === '1' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                        <span className="text-gray-300 text-sm">{apiResponse.enabled === '1' ? 'מנוי פעיל' : 'מנוי חסום'}</span>
                                    </div>
                                    <button 
                                        onClick={() => toggleUserStatus(apiResponse.user_id, apiResponse.enabled)}
                                        className="text-xs text-indigo-400 hover:text-white underline"
                                    >
                                        {apiResponse.enabled === '1' ? 'חסום גישה' : 'אפשר גישה'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const CopyRow = ({ label, value }: { label: string, value: string }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex justify-between items-center bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-colors">
            <span className="text-gray-400 text-sm font-medium">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-white font-mono font-bold tracking-wide select-all">{value}</span>
                <button 
                    onClick={handleCopy}
                    className={`p-1.5 rounded-md transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title="העתק"
                >
                    {copied ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                </button>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label, icon }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
            active 
            ? 'bg-indigo-600 text-white shadow-lg' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
        {icon === 'plus' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
        {icon === 'refresh' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
        {icon === 'search' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        <span className="font-bold text-sm">{label}</span>
    </button>
);

export default PremiumManager;
