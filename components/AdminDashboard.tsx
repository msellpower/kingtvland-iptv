
import React, { useState, useEffect } from 'react';
import { List } from 'react-window';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { getAdminData, updateStatus, getResellerCrmData, addResellerTransaction, getPublicSettings, updateSiteSettings, migrateAllData, getDbMode, setDbMode, getTelegramSettings, saveTelegramSettings, publishTelegramPost, sendNotification } from '../services/dataService';
import { AdminDataResponse, DashboardStats, ResellerCrmData, ResellerTransaction, MarketingPopup } from '../types';
import PremiumManager from './PremiumManager';
import AdminChat from './AdminChat';
import PlansManager from './PlansManager';
import { useQuery } from '@tanstack/react-query';

const NotificationsManager = ({ token, customers = [] }: { token: string, customers?: any[] }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetType, setTargetType] = useState<'all' | 'plan' | 'users'>('all');
    const [targetPlans, setTargetPlans] = useState<string[]>([]);
    const [targetUsers, setTargetUsers] = useState<string[]>([]);
    const [userSearchText, setUserSearchText] = useState('');
    const [status, setStatus] = useState('');

    const handleSend = async () => {
        if (!title || !message) {
            setStatus('שגיאה: חובה להזין כותרת ותוכן הודעה');
            return;
        }

        setStatus('שולח...');
        const plans = targetPlans;
        const users = targetType === 'users' ? targetUsers : [];

        const success = await sendNotification(token, {
            title,
            message,
            targetType,
            targetPlans: plans,
            targetUsers: users
        });

        if (success) {
            setStatus('ההודעה נשלחה בהצלחה!');
            setTitle('');
            setMessage('');
            setTargetPlans([]);
            setTargetUsers([]);
            setTimeout(() => setStatus(''), 3000);
        } else {
            setStatus('שגיאה בשליחת ההודעה.');
        }
    };

    const handlePlanToggle = (plan: string) => {
        setTargetPlans(prev => prev.includes(plan) ? prev.filter(p => p !== plan) : [...prev, plan]);
    };

    return (
        <div className="bg-slate-800 rounded-xl p-8 border border-gray-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <h2 className="text-3xl font-bold text-white mb-8 text-right flex items-center justify-end gap-3">
                שליחת הודעות למנויים
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </h2>
            <div className="space-y-6 max-w-3xl ml-auto dir-rtl text-right">
                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">כותרת ההודעה</label>
                   <input className="w-full bg-slate-900 border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg p-3 text-white outline-none transition-all" value={title} onChange={e => setTitle(e.target.value)} placeholder="הזן כותרת ברורה ותמציתית" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">תוכן ההודעה</label>
                   <textarea rows={4} className="w-full bg-slate-900 border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg p-3 text-white outline-none transition-all resize-none" value={message} onChange={e => setMessage(e.target.value)} placeholder="הקלד את תוכן ההודעה שיופיע למנויים באזור האישי..." />
                </div>
                
                <div className="p-4 bg-slate-900/50 rounded-lg border border-gray-700/50">
                    <label className="block text-sm font-bold text-gray-300 mb-3">למי מיועדת ההודעה?</label>
                    <select className="w-full bg-slate-900 border border-gray-700 rounded-lg p-3 text-white text-right outline-none focus:border-cyan-500" value={targetType} onChange={(e: any) => setTargetType(e.target.value)}>
                        <option value="all">🌐 לכל המנויים כולם</option>
                        <option value="plan">📦 למנויים של חבילה ספציפית</option>
                        <option value="users">🎯 פרטני (בחירת לקוחות ספציפיים)</option>
                    </select>

                    {targetType === 'plan' && (
                        <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-slate-800">
                             <label className="block text-sm font-medium text-gray-400 mb-3">סמן את החבילות אליהן תשלח ההודעה:</label>
                             <div className="flex gap-3 flex-wrap text-right">
                                 {['King', 'Israeli', 'Premium', 'Gold', 'Crystal'].map(plan => (
                                     <button key={plan} onClick={() => handlePlanToggle(plan.toLowerCase())} className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all ${targetPlans.includes(plan.toLowerCase()) ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                                         {targetPlans.includes(plan.toLowerCase()) && <span className="mr-2">✓</span>}
                                         {plan}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    )}

                    {targetType === 'users' && (
                        <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-slate-800">
                            <label className="block text-sm font-medium text-gray-400 mb-2">חיפוש ובחירת משתמשים לשליחה:</label>
                            
                            <div className="relative mb-4">
                                <input className="w-full bg-slate-900 border border-gray-700 focus:border-cyan-500 rounded-lg p-3 text-white text-right dir-rtl outline-none" placeholder="חפש לקוח לפי שם, אימייל או שם משתמש..." value={userSearchText} onChange={e => setUserSearchText(e.target.value)} />
                                {userSearchText && (
                                     <div className="absolute top-full left-0 right-0 max-h-48 overflow-y-auto bg-slate-800 border border-gray-600 rounded-b-lg shadow-xl z-20">
                                         {customers.filter(c => c && (String(c.username||'').toLowerCase().includes(userSearchText.toLowerCase()) || String(c.email||'').toLowerCase().includes(userSearchText.toLowerCase()) || String(c.name||'').toLowerCase().includes(userSearchText.toLowerCase()))).slice(0, 10).map((c, i) => (
                                              <div key={i} className="p-3 border-b border-gray-700 hover:bg-slate-700 transition-colors cursor-pointer text-sm" onClick={() => {
                                                   if (!targetUsers.includes(c.email)) {
                                                        setTargetUsers([...targetUsers, c.email]);
                                                   }
                                                   setUserSearchText('');
                                              }}>
                                                   <div className="font-bold text-white">{c.username || c.name || 'ללא שם'}</div>
                                                   <div className="font-mono text-xs text-gray-400">{c.email}</div>
                                              </div>
                                         ))}
                                         {customers.filter(c => c && (String(c.username||'').toLowerCase().includes(userSearchText.toLowerCase()) || String(c.email||'').toLowerCase().includes(userSearchText.toLowerCase()) || String(c.name||'').toLowerCase().includes(userSearchText.toLowerCase()))).length === 0 && (
                                             <div className="p-3 text-gray-500 text-sm text-center">לא נמצאו תוצאות</div>
                                         )}
                                     </div>
                                )}
                            </div>
                            
                            {targetUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                     {targetUsers.map(email => {
                                          const user = customers.find(c => c && c.email === email);
                                          return (
                                              <span key={email} className="bg-indigo-900 border border-indigo-700 text-indigo-200 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                                                  <span className="font-bold">{user?.username || user?.name || email.split('@')[0]}</span>
                                                  <button onClick={() => setTargetUsers(targetUsers.filter(e => e !== email))} className="text-indigo-400 hover:text-white transition-colors bg-indigo-950/50 rounded-full w-5 h-5 flex items-center justify-center font-bold">×</button>
                                              </span>
                                          );
                                     })}
                                </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-2">חפש ובחר את הלקוחות מרשימת הרשומים במערכת. ההודעה תוצג להם באיזור האישי.</p>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-700">
                    <button onClick={handleSend} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-lg w-full transition-all shadow-lg hover:shadow-cyan-500/25 active:scale-95 flex justify-center items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        שלח הודעה כעת
                    </button>
                    {status && (
                        <div className={`mt-4 p-4 rounded-lg text-center text-sm font-bold border ${status.includes('שגיאה') ? 'bg-red-900/30 text-red-400 border-red-800/50' : status.includes('שולח') ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-green-900/30 text-green-400 border-green-800/50'}`}>
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface AdminDashboardProps {
  onLogout: () => void;
  token: string | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, token }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'customers' | 'reports' | 'leads' | 'premium' | 'plans' | 'chat' | 'comments' | 'trials' | 'reseller_crm' | 'reseller_leads' | 'marketing' | 'data_migration' | 'settings' | 'tasks' | 'integrations' | 'notifications'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);

  const { data, isLoading: loading, isError, refetch, isFetching: refreshing } = useQuery({
    queryKey: ['adminData', token],
    queryFn: () => getAdminData(token!),
    enabled: !!token,
    staleTime: 60 * 1000 // 1 minute
  });

  const fetchData = async (force = false) => {
    if (!token) return;
    await refetch();
  };

  const handleStatusUpdate = async (sheetName: string, rowIndex: any, newStatus: string) => {
    const success = await updateStatus(sheetName, rowIndex, newStatus);
    if (success) {
      alert("סטטוס עודכן בהצלחה");
      fetchData(); // Refresh data
    } else {
      alert("שגיאה בעדכון");
    }
  };

  const handleViewCustomer = (email: string) => {
    if (!email) {
        alert("אין אימייל ללקוח זה");
        return;
    }
    setSelectedCustomerEmail(email);
  };

  const closeCustomerView = () => {
    setSelectedCustomerEmail(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <svg className="w-16 h-16 text-cyan-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white text-xl">טוען נתונים מהגלקסיה...</p>
         </div>
      </div>
    );
  }

  if (!data) return <div className="text-white text-center pt-20">שגיאה בטעינת הנתונים</div>;

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden" dir={data?.settings?.defaultLanguage === 'en' ? 'ltr' : 'rtl'}>
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-800 border-e border-gray-700 hidden md:flex flex-col flex-shrink-0 z-40 relative`}>
        <div className={`p-6 border-b border-gray-700 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && (
            <div>
              <h2 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
                CRM
              </h2>
              <p className="text-gray-400 text-[10px] mt-1 whitespace-nowrap">ניהול אימפריית הטלוויזיה</p>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="text-gray-400 hover:text-white p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition"
          >
            {isSidebarCollapsed ? (
              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            )}
          </button>
        </div>
        
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
           <SidebarItem icon="dashboard" label="דאשבורד" active={activeTab === 'dashboard'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('dashboard')} />
           <SidebarItem icon="settings" label="הגדרות אתר" active={activeTab === 'settings'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('settings')} />
           <SidebarItem icon="tasks" label="משימות" active={activeTab === 'tasks'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('tasks')} />
           <SidebarItem icon="chat" label="צ'אט" active={activeTab === 'chat'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('chat')} />
           <SidebarItem icon="alert" label="הודעות למנויים" active={activeTab === 'notifications'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('notifications')} />
           <SidebarItem icon="cart" label="הזמנות" active={activeTab === 'orders'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('orders')} />
           <SidebarItem icon="users" label="לקוחות פעילים" active={activeTab === 'customers'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('customers')} />
           <SidebarItem icon="trial" label="בקשות ניסיון" active={activeTab === 'trials'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('trials')} />
           <SidebarItem icon="alert" label="דיווחים" active={activeTab === 'reports'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('reports')} />
           <SidebarItem icon="leads" label="לידים (נרשמים)" active={activeTab === 'leads'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('leads')} />
           <SidebarItem icon="alert" label="פופ-אפים שיווקיים" active={activeTab === 'marketing'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('marketing')} />
           <SidebarItem icon="premium" label="ספק פרימיום" active={activeTab === 'premium'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('premium')} />
           <SidebarItem icon="cart" label="ניהול חבילות" active={activeTab === 'plans'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('plans')} />
           <SidebarItem icon="money" label="Reseller CRM" active={activeTab === 'reseller_crm'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('reseller_crm')} />
           <SidebarItem icon="users" label="זכיינים חדשים" active={activeTab === 'reseller_leads'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('reseller_leads')} />
           <SidebarItem icon="alert" label="אינטגרציות ובוטים" active={activeTab === 'integrations'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('integrations')} />
           <SidebarItem icon="comments" label="תגובות בלוג" active={activeTab === 'comments'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('comments')} />
           <SidebarItem icon="settings" label="בסיס נתונים" active={activeTab === 'data_migration'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('data_migration')} />
        </nav>

        <div className={`p-4 border-t border-gray-700 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
           <button onClick={onLogout} className={`flex items-center gap-2 text-red-400 hover:text-white transition-colors ${isSidebarCollapsed ? 'justify-center p-2 rounded-lg bg-red-900/20 hover:bg-red-900/40' : 'w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl'}`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {!isSidebarCollapsed && <span className="font-bold">התנתק</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative h-full">
        {refreshing && (
          <div className="fixed top-4 left-4 z-50 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs font-bold">מעדכן נתונים...</span>
          </div>
        )}
        {activeTab === 'dashboard' && (
          <DashboardOverview 
            stats={data.stats} 
            trialCount={data.requests?.length || 0}
            leadCount={data.subscribers?.length || 0}
            unreadChatCount={data.chatSessions?.reduce((acc, s) => acc + (s.unreadCount || 0), 0) || 0}
            pendingCommentsCount={data.blogComments?.filter(c => c.status === 'Pending').length || 0}
            onNavigate={(tab: any) => setActiveTab(tab)} 
          />
        )}
        {activeTab === 'settings' && <SiteSettings initialSettings={data.settings} onRefresh={fetchData} />}
        {activeTab === 'marketing' && <MarketingPopupsManager initialPopups={data.settings?.marketingPopups} onRefresh={fetchData} />}
        {activeTab === 'tasks' && <AdminTasks />}
        {activeTab === 'chat' && <AdminChat token={token} />}
        {activeTab === 'notifications' && <NotificationsManager token={token!} customers={data?.customers || []} />}
        {activeTab === 'orders' && <OrdersTable orders={data.orders} onUpdate={handleStatusUpdate} onViewCustomer={handleViewCustomer} />}
        {activeTab === 'trials' && <TrialsTable requests={data.requests || []} onUpdate={handleStatusUpdate} />}
        {activeTab === 'reports' && <ReportsTable reports={data.reports} onUpdate={handleStatusUpdate} />}
        {activeTab === 'customers' && <ClassifiedCustomersTables customers={data.customers} onViewCustomer={handleViewCustomer} />}
        {activeTab === 'leads' && <LeadsTable leads={data.subscribers} />}
        {activeTab === 'premium' && <PremiumManager />}
        {activeTab === 'plans' && <PlansManager onRefresh={fetchData} />}
        {activeTab === 'reseller_crm' && <ResellerCrm initialData={data.resellerCrm} onRefresh={fetchData} />}
        {activeTab === 'reseller_leads' && <ResellerLeadsTable registrations={data.resellerRegistrations || []} onUpdate={handleStatusUpdate} />}
        {activeTab === 'integrations' && <IntegrationsManager token={token} />}
        {activeTab === 'comments' && <BlogCommentsTable comments={data.blogComments || []} onUpdate={handleStatusUpdate} />}
        {activeTab === 'data_migration' && <DataMigration token={token} />}

        {/* Customer Details Modal */}
        {selectedCustomerEmail && (
            <CustomerDetailsModal 
                email={selectedCustomerEmail} 
                customers={data.customers} 
                orders={data.orders}
                requests={data.requests}
                onClose={closeCustomerView} 
            />
        )}
      </main>
    </div>
  );
};

// --- New Components ---

const SiteSettings = ({ initialSettings, onRefresh }: { initialSettings?: any, onRefresh: () => void }) => {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        shabbatOverride: false,
        registrationOpen: true,
        promoBanner: '',
        supportMessage: '',
        renewalReminderDays: 0,
        showHero: true,
        showVod: true,
        showDeals: true,
        showApps: true,
        showPricing: true,
        whatsappNumber: '',
        contactEmail: '',
        telegramLink: '',
        siteTitle: '',
        siteUrl: 'https://kingtvland-iptv.netlify.app',
        siteDescription: '',
        youtubeVideoUrl: '',
        appVideoUrls: {} as Record<string, string>,
        dbMode: 'sheets' as 'firebase' | 'sheets',
        serverStatuses: {
            plan1: { label: 'V.O.D', status: 'online' },
            plan2: { label: 'LIVE TV', status: 'online' },
            plan3: { label: 'VIP', status: 'online' }
        } as Record<string, { label: string; status: 'online' | 'maintenance' | 'crashed' }>
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialSettings) {
            setSettings({
                maintenanceMode: initialSettings.MAINTENANCE_MODE === 'TRUE' || initialSettings.MAINTENANCE_MODE === true,
                shabbatOverride: initialSettings.SHABBAT_OVERRIDE === 'TRUE' || initialSettings.SHABBAT_OVERRIDE === true,
                registrationOpen: initialSettings.REGISTRATION_OPEN !== 'FALSE' && initialSettings.REGISTRATION_OPEN !== false,
                promoBanner: initialSettings.PROMO_BANNER_TEXT || '',
                supportMessage: initialSettings.SUPPORT_MESSAGE || '',
                renewalReminderDays: parseInt(initialSettings.RENEWAL_REMINDER_DAYS_AFTER) || 0,
                showHero: initialSettings.SHOW_HERO !== 'FALSE' && initialSettings.SHOW_HERO !== false,
                showVod: initialSettings.SHOW_VOD !== 'FALSE' && initialSettings.SHOW_VOD !== false,
                showDeals: initialSettings.SHOW_DEALS !== 'FALSE' && initialSettings.SHOW_DEALS !== false,
                showApps: initialSettings.SHOW_APPS !== 'FALSE' && initialSettings.SHOW_APPS !== false,
                showPricing: initialSettings.SHOW_PRICING !== 'FALSE' && initialSettings.SHOW_PRICING !== false,
                whatsappNumber: initialSettings.WHATSAPP_NUMBER || '',
                contactEmail: initialSettings.CONTACT_EMAIL || '',
                telegramLink: initialSettings.TELEGRAM_LINK || '',
                siteTitle: initialSettings.SITE_TITLE || '',
                siteUrl: initialSettings.SITE_URL || 'https://kingtvland-iptv.netlify.app',
                siteDescription: initialSettings.SITE_DESCRIPTION || '',
                youtubeVideoUrl: initialSettings.youtubeVideoUrl || '',
                appVideoUrls: initialSettings.appVideoUrls || {},
                dbMode: getDbMode(),
                serverStatuses: initialSettings.serverStatuses || {
                    plan1: { label: 'V.O.D', status: 'online' },
                    plan2: { label: 'LIVE TV', status: 'online' },
                    plan3: { label: 'VIP', status: 'online' }
                }
            });
        }
    }, [initialSettings]);

    const handleSave = async () => {
        setLoading(true);
        const success = await updateSiteSettings({
            MAINTENANCE_MODE: settings.maintenanceMode,
            SHABBAT_OVERRIDE: settings.shabbatOverride,
            REGISTRATION_OPEN: settings.registrationOpen,
            PROMO_BANNER_TEXT: settings.promoBanner,
            SUPPORT_MESSAGE: settings.supportMessage,
            RENEWAL_REMINDER_DAYS_AFTER: settings.renewalReminderDays,
            SHOW_HERO: settings.showHero,
            SHOW_VOD: settings.showVod,
            SHOW_DEALS: settings.showDeals,
            SHOW_APPS: settings.showApps,
            SHOW_PRICING: settings.showPricing,
            WHATSAPP_NUMBER: settings.whatsappNumber,
            CONTACT_EMAIL: settings.contactEmail,
            TELEGRAM_LINK: settings.telegramLink,
            SITE_TITLE: settings.siteTitle,
            SITE_URL: settings.siteUrl,
            SITE_DESCRIPTION: settings.siteDescription,
            youtubeVideoUrl: settings.youtubeVideoUrl,
            appVideoUrls: settings.appVideoUrls,
            serverStatuses: settings.serverStatuses,
        });

        if (success) {
            setDbMode(settings.dbMode);
            alert('הגדרות נשמרו בהצלחה');
            onRefresh();
        } else {
            alert('שגיאה בשמירת ההגדרות');
        }
        setLoading(false);
    };

    if (loading && !settings.promoBanner && !settings.supportMessage) {
        return <div className="text-white text-center">טוען הגדרות...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <h2 className="text-3xl font-bold text-white mb-6">הגדרות אתר ⚙️</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Status */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        סטטוס מערכת
                    </h3>
                    <div className="space-y-4">
                        <ToggleItem 
                            label="מצב תחזוקה" 
                            description="האתר יהיה סגור לגולשים" 
                            active={settings.maintenanceMode} 
                            onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} 
                            color="red"
                        />
                        <ToggleItem 
                            label="עקיפת מצב שבת" 
                            description="הפעלת האתר גם בשבת (חירום)" 
                            active={settings.shabbatOverride} 
                            onClick={() => setSettings({...settings, shabbatOverride: !settings.shabbatOverride})} 
                            color="orange"
                        />
                        <ToggleItem 
                            label="הרשמה פתוחה" 
                            description="אפשר למשתמשים חדשים להירשם" 
                            active={settings.registrationOpen} 
                            onClick={() => setSettings({...settings, registrationOpen: !settings.registrationOpen})} 
                            color="green"
                        />
                        <div className="pt-4 mt-4 border-t border-gray-700">
                            <label className="block text-sm font-medium text-gray-400 mb-2">בסיס נתונים פעיל</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setSettings({...settings, dbMode: 'sheets'})}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${settings.dbMode === 'sheets' ? 'bg-green-600 text-white' : 'bg-slate-900 text-gray-400 border border-gray-700'}`}
                                >
                                    Google Sheets (רגוע)
                                </button>
                                <button 
                                    onClick={() => setSettings({...settings, dbMode: 'firebase'})}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${settings.dbMode === 'firebase' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-gray-400 border border-gray-700'}`}
                                >
                                    Firebase (מהיר ובטוח 🚀)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Component Visibility */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        נראות רכיבים (דף הבית)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ToggleItem label="באנר ראשי (Hero)" active={settings.showHero} onClick={() => setSettings({...settings, showHero: !settings.showHero})} />
                        <ToggleItem label="תצוגת תוכן (VOD)" active={settings.showVod} onClick={() => setSettings({...settings, showVod: !settings.showVod})} />
                        <ToggleItem label="מבצעים חמים" active={settings.showDeals} onClick={() => setSettings({...settings, showDeals: !settings.showDeals})} />
                        <ToggleItem label="אפליקציות מומלצות" active={settings.showApps} onClick={() => setSettings({...settings, showApps: !settings.showApps})} />
                        <ToggleItem label="טבלת מחירים" active={settings.showPricing} onClick={() => setSettings({...settings, showPricing: !settings.showPricing})} />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        פרטי התקשרות
                    </h3>
                    <div className="space-y-4">
                        <InputItem label="מספר וואטסאפ (ללא +)" value={settings.whatsappNumber} onChange={(val: string) => setSettings({...settings, whatsappNumber: val})} placeholder="972500000000" />
                        <InputItem label="קישור טלגרם" value={settings.telegramLink} onChange={(val: string) => setSettings({...settings, telegramLink: val})} placeholder="https://t.me/yourname" />
                        <InputItem label="אימייל ליצירת קשר" value={settings.contactEmail} onChange={(val: string) => setSettings({...settings, contactEmail: val})} placeholder="kingtvland@gmail.com" />
                        <InputItem label="כתובת סרטון יוטיוב (להצגה במדריכים)" value={settings.youtubeVideoUrl || ''} onChange={(val: string) => setSettings({...settings, youtubeVideoUrl: val})} placeholder="https://www.youtube.com/embed/..." />
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">קישורי וידאו לאפליקציות לפי ID (פורמט JSON)</label>
                            <textarea 
                                value={JSON.stringify(settings.appVideoUrls || {}, null, 2)}
                                onChange={(e) => {
                                    try {
                                        setSettings({...settings, appVideoUrls: JSON.parse(e.target.value)});
                                    } catch (err) {}
                                }}
                                className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none text-xs font-mono"
                                placeholder='{"tivimate": "https://www.youtube.com/embed/...", "smarters": "..."}'
                            />
                        </div>
                    </div>
                </div>

                {/* SEO Settings */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        הגדרות SEO
                    </h3>
                    <div className="space-y-4">
                        <InputItem label="כותרת האתר (Title)" value={settings.siteTitle} onChange={(val: string) => setSettings({...settings, siteTitle: val})} />
                        <InputItem label="כתובת האתר (Site URL)" value={settings.siteUrl} onChange={(val: string) => setSettings({...settings, siteUrl: val})} />
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">תיאור האתר (Meta Description)</label>
                            <textarea 
                                value={settings.siteDescription}
                                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                                className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 outline-none h-20 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Settings */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700 lg:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        תוכן והודעות
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <InputItem label="טקסט באנר עליון" value={settings.promoBanner} onChange={(val: string) => setSettings({...settings, promoBanner: val})} />
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">הודעת תמיכה</label>
                                <textarea 
                                    value={settings.supportMessage}
                                    onChange={(e) => setSettings({...settings, supportMessage: e.target.value})}
                                    className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                                />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-700 md:border-t-0 md:border-r md:pr-6">
                            <label className="block text-sm font-medium text-gray-400 mb-1">תזכורת חידוש מנוי (ימים לאחר סיום)</label>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="number" 
                                    min="0"
                                    max="30"
                                    value={settings.renewalReminderDays}
                                    onChange={(e) => setSettings({...settings, renewalReminderDays: parseInt(e.target.value) || 0})}
                                    className="w-24 bg-slate-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none text-center"
                                />
                                <span className="text-xs text-gray-500">
                                    0 = ללא תזכורת נוספת. המערכת שולחת אוטומטית שבוע לפני וביום הסיום.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Server Statuses */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700 lg:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                        סטטוס שרתים ומנויים (מוצג בתפריט העליון)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries((settings.serverStatuses as Record<string, any>) || {}).map(([key, server]) => (
                            <div key={key} className="bg-slate-900 p-4 rounded-xl border border-gray-700">
                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-400 mb-1">סוג מנוי / שם השרת</label>
                                    <input 
                                        type="text" 
                                        value={server.label}
                                        onChange={(e) => setSettings({
                                            ...settings, 
                                            serverStatuses: {
                                                ...settings.serverStatuses, 
                                                [key]: { ...server, label: e.target.value }
                                            }
                                        })}
                                        className="w-full bg-slate-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-bold"
                                        placeholder="למשל: V.O.D, VIP"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">מצב השרת</label>
                                    <select
                                        value={server.status}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            serverStatuses: {
                                                ...settings.serverStatuses,
                                                [key]: { ...server, status: e.target.value as 'online' | 'maintenance' | 'crashed' }
                                            }
                                        })}
                                        className="w-full bg-slate-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                                    >
                                        <option value="online">🟢 שרת פעיל (ירוק)</option>
                                        <option value="maintenance">🟡 שרת בתיקון / תחזוקה (צהוב)</option>
                                        <option value="crashed">🔴 שרת קרס / מנותק (אדום)</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end sticky bottom-4 z-30">
                <button 
                    onClick={handleSave}
                    className={`bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-12 rounded-2xl shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            שומר...
                        </>
                    ) : 'שמור את כל השינויים'}
                </button>
            </div>
        </div>
    );
};

const ToggleItem = ({ label, description, active, onClick, color = 'indigo' }: any) => {
    const colors: any = {
        red: 'bg-red-500',
        orange: 'bg-orange-500',
        green: 'bg-green-500',
        indigo: 'bg-indigo-500',
    };

    return (
        <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
            <div>
                <p className="text-white font-bold text-sm">{label}</p>
                {description && <p className="text-[10px] text-gray-500">{description}</p>}
            </div>
            <button 
                onClick={onClick}
                className={`w-10 h-5 rounded-full transition-colors relative ${active ? colors[color] : 'bg-gray-700'}`}
            >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-0.5' : 'left-5.5'}`} />
            </button>
        </div>
    );
};

const InputItem = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input 
            type={type} 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
    </div>
);

const AdminTasks = () => {
    const CATEGORIES = [
        'Bug Fix',
        'Feature Request',
        'UI Improvement',
        'הארכת מנוי',
        'תמיכה טכנית',
        'אחר'
    ];

    const [tasks, setTasks] = useState<any[]>([
        { id: 1, text: 'לבדוק מלאי מנויים', done: false, category: 'אחר', dueDate: '' },
        { id: 2, text: 'לעדכן מבצעים לחג', done: true, category: 'שיפור ממשק', dueDate: '' },
        { id: 3, text: 'לענות לתגובות בבלוג', done: false, category: 'תמיכה טכנית', dueDate: '' },
    ]);
    const [newTask, setNewTask] = useState('');
    const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
    const [newDueDate, setNewDueDate] = useState('');

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, done: false, category: newCategory, dueDate: newDueDate }]);
        setNewTask('');
        setNewCategory(CATEGORIES[0]);
        setNewDueDate('');
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const updateTaskCategory = (id: number, category: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, category } : t));
    };

    const updateTaskDueDate = (id: number, dueDate: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, dueDate } : t));
    };

    const deleteTask = (id: number) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">משימות לביצוע ✅</h2>
            
            <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
                    <input 
                        type="text" 
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                        placeholder="הוסף משימה חדשה..."
                        className="col-span-1 md:col-span-12 lg:col-span-5 bg-slate-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <select 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="col-span-1 md:col-span-4 lg:col-span-3 bg-slate-900 border border-gray-600 rounded-lg px-2 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input 
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="col-span-1 md:col-span-4 lg:col-span-2 bg-slate-900 border border-gray-600 rounded-lg px-2 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <button 
                        onClick={addTask}
                        className="col-span-1 md:col-span-4 lg:col-span-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold"
                    >
                        הוסף
                    </button>
                </div>

                <div className="space-y-3">
                    {tasks.map(task => (
                        <div key={task.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${task.done ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-700 border-slate-600'}`}>
                            <div className="flex items-start md:items-center gap-3 w-full md:w-auto flex-1">
                                <button 
                                    onClick={() => toggleTask(task.id)}
                                    className={`mt-1 md:mt-0 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-400 hover:border-green-400'}`}
                                >
                                    {task.done && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                </button>
                                <span className={`text-white font-medium break-words w-full ${task.done ? 'line-through text-gray-500' : ''}`}>{task.text}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-600 pt-3 md:pt-0">
                                <div className="flex items-center gap-2">
                                    <select 
                                        value={task.category || CATEGORIES[0]}
                                        onChange={(e) => updateTaskCategory(task.id, e.target.value)}
                                        className="bg-slate-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 focus:ring-1 focus:ring-green-500 outline-none"
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <input 
                                        type="date"
                                        value={task.dueDate || ''}
                                        onChange={(e) => updateTaskDueDate(task.id, e.target.value)}
                                        className="bg-slate-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 focus:ring-1 focus:ring-green-500 outline-none"
                                    />
                                </div>
                                <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-400 p-1 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && <p className="text-center text-gray-500 py-4">אין משימות. קח הפסקה! ☕</p>}
                </div>
            </div>
        </div>
    );
};

// --- Integrations Manager ---

const IntegrationsManager = ({ token }: { token: string | null }) => {
    const [settings, setSettings] = useState({
        alertBotToken: '',
        alertChatId: '',
        announcementBotToken: '',
        announcementChatId: ''
    });
    const [postContent, setPostContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const [generatingAI, setGeneratingAI] = useState(false);
    const [aiTopic, setAiTopic] = useState('');

    useEffect(() => {
        if (token) fetchSettings();
    }, [token]);

    const fetchSettings = async () => {
        setLoading(true);
        if (token) {
            const data = await getTelegramSettings(token);
            if (data) setSettings({
                alertBotToken: data.alertBotToken || '',
                alertChatId: data.alertChatId || '',
                announcementBotToken: data.announcementBotToken || '',
                announcementChatId: data.announcementChatId || ''
            });
        }
        setLoading(false);
    };

    const handleGenerateAI = async () => {
        if (!token || !aiTopic) return;
        setGeneratingAI(true);
        try {
            const response = await fetch('/api/admin/telegram/generate', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ topic: aiTopic })
            });
            const data = await response.json();
            if (data.text) {
                setPostContent(data.text);
                setAiTopic('');
            } else {
                alert('שגיאה ביצירת פוסט AI');
            }
        } catch (e) {
            alert('שגיאה בתקשורת');
        }
        setGeneratingAI(false);
    };

    const handleSaveSettings = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch('/api/admin/telegram/settings', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(settings)
            });
            const data = await response.json();
            if (data.success) {
                alert('הגדרות בוטים נשמרו בהצלחה! ✅');
            } else {
                alert(`שגיאה בשמירת הגדרות: ${data.error || 'שגיאה לא ידועה'}\n${data.details || ''}`);
            }
        } catch (error) {
            console.error('saveTelegramSettings error:', error);
            alert('שגיאה בתקשורת עם השרת');
        }
        setLoading(false);
    };

    const handlePublish = async () => {
        if (!token || !postContent) return;
        setPublishing(true);
        const success = await publishTelegramPost(token, postContent);
        if (success) {
            alert('הפוסט פורסם בהצלחה בטלגרם! 🚀');
            setPostContent('');
        } else {
            alert('שגיאה בפרסום הפוסט');
        }
        setPublishing(false);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <h2 className="text-3xl font-bold text-white mb-6">אינטגרציות ובוטים 🤖</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bot Settings */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        הגדרות בוטים (Telegram)
                    </h3>
                    
                    <div className="space-y-6">
                        {/* Alerts Bot */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-gray-700">
                            <h4 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                                בוט התרעות (Alerts Bot) - פרטי
                            </h4>
                            <div className="space-y-3">
                                <InputItem 
                                    label="Bot Token" 
                                    value={settings.alertBotToken} 
                                    onChange={(val: string) => setSettings({...settings, alertBotToken: val})} 
                                    placeholder="123456789:ABCDEF..."
                                    type="password"
                                />
                                <InputItem 
                                    label="Chat ID / Group ID" 
                                    value={settings.alertChatId} 
                                    onChange={(val: string) => setSettings({...settings, alertChatId: val})} 
                                    placeholder="-100123456789" 
                                />
                            </div>
                        </div>

                        {/* Announcement Bot */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-gray-700">
                            <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                בוט פרסום (Announcement Bot) - קבוצה/ערוץ
                            </h4>
                            <div className="space-y-3">
                                <InputItem 
                                    label="Bot Token" 
                                    value={settings.announcementBotToken} 
                                    onChange={(val: string) => setSettings({...settings, announcementBotToken: val})} 
                                    placeholder="123456789:ABCDEF..."
                                    type="password"
                                />
                                <InputItem 
                                    label="Chat ID / Channel Name (@...)" 
                                    value={settings.announcementChatId} 
                                    onChange={(val: string) => setSettings({...settings, announcementChatId: val})} 
                                    placeholder="@mychannel" 
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveSettings}
                            className={`w-full py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'שומר...' : 'שמור הגדרות בוטים'}
                        </button>
                    </div>
                </div>

                {/* Post Generator */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            מחולל פוסטים (Post Generator)
                        </div>
                        <span className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-full uppercase tracking-wider font-black">AI Enabled ✨</span>
                    </h3>

                    <div className="flex-1 flex flex-col space-y-4">
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-purple-500/30">
                            <label className="block text-xs font-bold text-purple-400 mb-2">חולל פוסט באמצעות AI</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={aiTopic}
                                    onChange={e => setAiTopic(e.target.value)}
                                    placeholder="על מה הפוסט? (למשל: סרט חדש בדיסני)"
                                    className="flex-1 bg-slate-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-purple-500 outline-none"
                                />
                                <button 
                                    onClick={handleGenerateAI}
                                    disabled={generatingAI || !aiTopic}
                                    className={`bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all ${generatingAI ? 'animate-pulse' : ''}`}
                                >
                                    {generatingAI ? 'מחולל...' : 'צור פוסט'}
                                </button>
                            </div>
                        </div>

                        <div className="relative flex-1">
                            <textarea 
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="כתוב כאן את הפוסט לפרסום בטלגרם... (תומך ב-HTML)"
                                className="w-full h-full min-h-[300px] bg-slate-900 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none custom-scrollbar"
                            />
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <button onClick={() => setPostContent(postContent + '<b></b>')} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-[10px] text-white">Bold</button>
                                <button onClick={() => setPostContent(postContent + '<i></i>')} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-[10px] text-white">Italic</button>
                                <button onClick={() => setPostContent(postContent + '<a href=""></a>')} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-[10px] text-white">Link</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={handlePublish}
                                className={`py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 ${publishing || !postContent ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95'}`}
                                disabled={publishing || !postContent}
                             >
                                {publishing ? 'מפרסם...' : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        פרסם עכשיו בטלגרם
                                    </>
                                )}
                             </button>
                             <button className="py-4 rounded-xl font-bold bg-slate-900 text-gray-400 border border-gray-700 hover:bg-slate-700 transition-all cursor-not-allowed">
                                שמור כטיוטה
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub Components ---

const SidebarItem = ({ icon, label, active, collapsed, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center ${collapsed ? 'justify-center py-3' : 'gap-3 px-4 py-3'} rounded-xl transition-all relative group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}
  >
     {/* Simple icons based on name */}
     {icon === 'dashboard' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
     {icon === 'chat' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
     {icon === 'cart' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
     {icon === 'users' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
     {icon === 'trial' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
     {icon === 'alert' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
     {icon === 'leads' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
     {icon === 'premium' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
     {icon === 'comments' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>}
     {icon === 'money' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
     {icon === 'settings' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
     {icon === 'tasks' && <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
     {!collapsed && <span className="font-bold">{label}</span>}
     {collapsed && (
       <div className="absolute start-14 opacity-0 group-hover:opacity-100 bg-slate-900 border border-gray-700 text-white px-2 py-1 rounded w-max text-xs z-50 pointer-events-none transition-opacity">
         {label}
       </div>
     )}
  </button>
);

const DashboardOverview = ({ 
    stats, 
    trialCount, 
    leadCount, 
    unreadChatCount, 
    pendingCommentsCount,
    onNavigate 
}: { 
    stats: DashboardStats, 
    trialCount: number, 
    leadCount: number,
    unreadChatCount: number,
    pendingCommentsCount: number,
    onNavigate: (tab: string) => void 
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">מבט על 📊</h2>
            <button 
                onClick={async () => {
                    try {
                        const token = localStorage.getItem('adminToken');
                        const res = await fetch('/api/admin/telegram/stats', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) alert('הדו"ח נשלח בהצלחה לטלגרם! ✅');
                        else alert('שגיאה בשליחת הדו"ח');
                    } catch (e) {
                        alert('שגיאה בתקשורת');
                    }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all active:scale-95"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                שלח דוח לטלגרם
            </button>
        </div>
        
        {/* KPI Cards - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <KPICard title="הכנסות משוערות" value={`₪${stats.totalRevenue}`} color="green" icon="money" />
            <KPICard title="מנויים פעילים" value={stats.activeSubscribers} color="purple" icon="users" />
            <KPICard title="מסתיים החודש" value={stats.expiringThisMonth || 0} color="orange" icon="clock" />
            <KPICard title="תקלות פתוחות" value={stats.openTickets} color="red" icon="alert" />
            <KPICard 
                title="בקשות ניסיון" 
                value={trialCount} 
                color="blue" 
                icon="trial" 
                onClick={() => onNavigate('trials')}
                clickable
            />
        </div>

        {/* KPI Cards - Row 2 (Secondary Metrics) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard 
                title="לידים חדשים (נרשמים)" 
                value={leadCount} 
                color="blue" 
                icon="leads" 
                onClick={() => onNavigate('leads')}
                clickable
            />
            <KPICard 
                title="הודעות צ'אט ממתינות" 
                value={unreadChatCount} 
                color="orange" 
                icon="chat" 
                onClick={() => onNavigate('chat')}
                clickable
            />
            <KPICard 
                title="תגובות בלוג לאישור" 
                value={pendingCommentsCount} 
                color="purple" 
                icon="comments" 
                onClick={() => onNavigate('comments')}
                clickable
            />
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">הזמנות ב-7 ימים אחרונים</h3>
                <div className="h-64 w-full" style={{ direction: 'ltr' }}>
                    {stats.chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#374151', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="הזמנות" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500 text-center">אין מספיק נתונים</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">התפלגות חבילות</h3>
                <div className="h-64 w-full" style={{ direction: 'ltr' }}>
                    {stats.planDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.planDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.planDistribution.map((entry, index) => {
                                        const colors = ['#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#f59e0b'];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                    })}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500 text-center">אין מספיק נתונים</p>
                        </div>
                    )}
                </div>
                {/* Custom Legend */}
                {stats.planDistribution.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                        {stats.planDistribution.map((entry, index) => {
                            const colors = ['#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#f59e0b'];
                            return (
                                <div key={index} className="flex items-center gap-1.5" dir="rtl">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                                    <span className="text-sm text-gray-300">{entry.name} ({entry.value})</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

const KPICard = ({ title, value, color, icon, onClick, clickable }: any) => {
    const colors: any = {
        green: 'from-emerald-500 to-green-600',
        purple: 'from-purple-500 to-indigo-600',
        red: 'from-red-500 to-pink-600',
        blue: 'from-blue-500 to-cyan-600',
        orange: 'from-orange-500 to-amber-600',
    };

    return (
        <div 
            onClick={onClick}
            className={`bg-slate-800 p-6 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden group transition-all ${clickable ? 'cursor-pointer hover:-translate-y-2 hover:border-indigo-500/50' : 'hover:-translate-y-1'}`}
        >
            <div className={`absolute top-0 right-0 w-2 h-full bg-gradient-to-b ${colors[color]}`}></div>
            <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-gray-400 text-sm font-medium mb-1 break-words leading-tight">{title}</p>
                    <p className="text-3xl font-black text-white truncate">{value}</p>
                </div>
                {clickable && (
                    <div className="flex-shrink-0 bg-white/10 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </div>
                )}
            </div>
            <div className={`absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr ${colors[color]} opacity-10 rounded-full group-hover:scale-150 transition-transform`}></div>
        </div>
    );
};

// --- Table Components ---

const OrdersTable = ({ orders, onUpdate, onViewCustomer }: any) => {
    const [filter, setFilter] = useState('');
    const filtered = (orders || []).filter((o: any) => {
        if (!o) return false;
        const nameMatch = o.Name ? String(o.Name).includes(filter) : false;
        const phoneMatch = o.Phone ? String(o.Phone).includes(filter) : false;
        const emailMatch = o.Email ? String(o.Email).includes(filter) : false;
        return nameMatch || phoneMatch || emailMatch;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">ניהול הזמנות</h2>
                <input 
                    type="text" 
                    placeholder="חיפוש..." 
                    className="bg-slate-800 border border-gray-600 text-white px-4 py-2 rounded-lg"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>
            <div className="bg-slate-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="w-full text-right min-w-[1000px]">
                    <div className="flex w-full bg-slate-900 text-gray-200 text-sm border-b border-gray-700 p-4 font-bold items-center">
                        <div className="w-[10%] pr-2">תאריך</div>
                        <div className="w-[15%] pr-2">שם</div>
                        <div className="w-[15%] pr-2">אימייל</div>
                        <div className="w-[12%] pr-2">טלפון</div>
                        <div className="w-[12%] pr-2">חבילה</div>
                        <div className="w-[10%] pr-2">סוג</div>
                        <div className="w-[8%] pr-2">תשלום</div>
                        <div className="w-[8%] pr-2">סטטוס</div>
                        <div className="w-[10%] pr-2">פעולות</div>
                    </div>
                    <div className="text-gray-200 text-sm divide-y divide-gray-700/50">
                        {filtered.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                אין נתונים עבור מחלקה זו
                            </div>
                        ) : (
                            <List
                                height={600}
                                itemCount={filtered.length}
                                itemSize={70}
                                width="100%"
                                itemData={filtered}
                                children={(({ index, style, data }: any) => {
                                    const order = data[index];
                                    return (
                                        <div style={style} className="flex hover:bg-slate-700/50 transition-colors items-center px-4 w-full">
                                            <div className="w-[10%] pr-2 text-xs truncate">{order.Date.split('T')[0]}</div>
                                            <div className="w-[15%] pr-2 font-bold text-white truncate">{order.Name}</div>
                                            <div className="w-[15%] pr-2 text-xs font-mono text-gray-400 truncate">{order.Email}</div>
                                            <div className="w-[12%] pr-2 font-mono truncate">{order.Phone}</div>
                                            <div className="w-[12%] pr-2 flex flex-col justify-center min-w-0">
                                                <span className="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded text-[10px] font-bold w-fit border border-indigo-500/30 truncate">{order['Plan ID']}</span>
                                                {order.IsRenewal === 'Renewal' && <span className="text-[10px] text-yellow-500 mt-1 font-medium truncate">חידוש: {order.TargetUsername}</span>}
                                            </div>
                                            <div className="w-[10%] pr-2 truncate text-xs text-gray-400">
                                                {order['Customer Type']} / {order['Service Type']}
                                            </div>
                                            <div className="w-[8%] pr-2 truncate">
                                                <span className="text-xs bg-slate-900/50 border border-gray-700 px-2 py-1 rounded text-gray-300">{order.PaymentMethod || '-'}</span>
                                            </div>
                                            <div className="w-[8%] pr-2 truncate">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${order.Status === 'Pending' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50' : 'bg-green-900/40 text-green-300 border border-green-700/50'}`}>
                                                    {order.Status}
                                                </span>
                                            </div>
                                            <div className="w-[10%] pr-2 flex gap-2 overflow-hidden">
                                                {order.Status === 'Pending' && (
                                                    <button 
                                                        onClick={() => onUpdate('Orders', order.rowIndex, 'Approved')}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95 whitespace-nowrap"
                                                    >
                                                        אשר
                                                    </button>
                                                )}
                                                {order.Email && (
                                                    <button 
                                                        onClick={() => onViewCustomer(order.Email)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-indigo-900/20 transition-all active:scale-95 whitespace-nowrap"
                                                    >
                                                        צפה בלקוח
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }) as any}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TrialsTable = ({ requests, onUpdate }: any) => {
    const safeRequests = Array.isArray(requests) ? requests.map((req: any, index: number) => ({ ...req, originalIndex: index })).filter((req: any) => req && Object.keys(req).length > 2) : [];
    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">בקשות ניסיון (Trials)</h2>
            <div className="bg-slate-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="w-full text-right min-w-[800px] overflow-x-auto">
                    <div className="flex bg-slate-900 text-gray-200 text-sm border-b border-gray-700">
                        <div className="p-4 font-bold w-[15%]">תאריך</div>
                        <div className="p-4 font-bold w-[20%]">שם</div>
                        <div className="p-4 font-bold w-[20%]">אימייל</div>
                        <div className="p-4 font-bold w-[15%]">פרטים</div>
                        <div className="p-4 font-bold w-[15%]">סטטוס</div>
                        <div className="p-4 font-bold w-[15%]">פעולות</div>
                    </div>
                    <div className="text-gray-200 text-sm divide-y divide-gray-700/50">
                        <List
                            height={500}
                            itemCount={safeRequests.length}
                            itemSize={60}
                            width="100%"
                            itemData={safeRequests}
                            children={(({ index, style, data }: any) => {
                                const req = data[index];
                                return (
                                    <div style={style} className="flex items-center hover:bg-slate-700/50 transition-colors">
                                        <div className="p-4 whitespace-nowrap w-[15%] truncate">{req?.date || ''}</div>
                                        <div className="p-4 font-bold text-white whitespace-nowrap w-[20%] truncate">{req?.name || ''}</div>
                                        <div className="p-4 whitespace-nowrap font-mono text-xs text-gray-400 w-[20%] truncate">{req?.email || ''}</div>
                                        <div className="p-4 whitespace-nowrap text-xs text-gray-300 w-[15%] truncate">{req?.plan || ''} - {req?.type || ''}</div>
                                        <div className="p-4 whitespace-nowrap w-[15%] truncate">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${req?.status === 'Pending' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50' : 'bg-green-900/40 text-green-300 border border-green-700/50'}`}>
                                                {req?.status || 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="p-4 whitespace-nowrap w-[15%] truncate">
                                            {req?.status === 'Pending' && (
                                                <button 
                                                    onClick={() => onUpdate('Requests', req.id || req.originalIndex, 'Approved')} 
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95"
                                                >
                                                    טופל
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) as any}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportsTable = ({ reports, onUpdate }: any) => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">ניהול תקלות</h2>
            <div className="bg-slate-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="w-full text-right min-w-[800px] overflow-x-auto">
                    <div className="flex bg-slate-900 text-gray-200 text-sm border-b border-gray-700">
                        <div className="p-4 font-bold w-[15%]">סוג</div>
                        <div className="p-4 font-bold w-[25%]">שם התוכן</div>
                        <div className="p-4 font-bold w-[30%]">תיאור</div>
                        <div className="p-4 font-bold w-[15%]">סטטוס</div>
                        <div className="p-4 font-bold w-[15%]">פעולות</div>
                    </div>
                    <div className="text-gray-200 text-sm divide-y divide-gray-700/50">
                        <List
                            height={500}
                            itemCount={reports.length}
                            itemSize={60}
                            width="100%"
                            itemData={reports}
                            children={(({ index, style, data }: any) => {
                                const r = data[index];
                                return (
                                    <div style={style} className="flex hover:bg-slate-700/50 transition-colors items-center">
                                        <div className="p-4 whitespace-nowrap text-xs font-bold text-indigo-300 w-[15%] truncate">{r.Type}</div>
                                        <div className="p-4 text-white font-bold whitespace-nowrap w-[25%] truncate">{r.Name}</div>
                                        <div className="p-4 w-[30%] truncate text-gray-400" title={r.Description}>{r.Description}</div>
                                        <div className="p-4 whitespace-nowrap w-[15%] truncate">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.Status === 'Open' ? 'bg-red-900/40 text-red-300 border border-red-700/50' : 'bg-gray-900/40 text-gray-400 border border-gray-700/50'}`}>
                                                {r.Status}
                                            </span>
                                        </div>
                                        <div className="p-4 whitespace-nowrap w-[15%] truncate">
                                            {r.Status === 'Open' && (
                                                <button 
                                                    onClick={() => onUpdate('Reports', r.rowIndex, 'Closed')}
                                                    className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
                                                >
                                                    סגור טיפול
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) as any}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// New Classified Customers Tables
const ClassifiedCustomersTables = ({ customers, onViewCustomer }: any) => {
    const [subTab, setSubTab] = useState<'king' | 'crystal' | 'israel' | 'premium'>('king');

    // Filter customers based on Type column (case insensitive)
    const filteredCustomers = (customers || []).filter((c: any) => {
        if (!c) return false;
        const type = String(c?.Type || '').toLowerCase();
        return type.includes(subTab);
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">לקוחות רשומים (Costumers)</h2>
            </div>
            
            {/* Class Tabs */}
            <div className="flex gap-2 mb-4 bg-slate-800/50 p-1 rounded-xl w-fit">
                {['king', 'crystal', 'israel', 'premium'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setSubTab(t as any)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                            subTab === t 
                            ? 'bg-indigo-600 text-white shadow' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="bg-slate-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="w-full text-right min-w-[1000px]">
                    <div className="flex w-full bg-slate-900 text-gray-200 text-sm border-b border-gray-700 font-bold p-4 text-right items-center">
                        <div className="w-[12%] pr-2">Username</div>
                        <div className="w-[12%] pr-2">Password</div>
                        <div className="w-[12%] pr-2">Created At</div>
                        <div className="w-[12%] pr-2">Expire date</div>
                        <div className="w-[10%] pr-2">Days Left</div>
                        <div className="w-[20%] pr-2">Notes (Email)</div>
                        <div className="w-[10%] pr-2">Type</div>
                        <div className="w-[12%] pr-2">פעולות</div>
                    </div>
                    <div className="text-gray-200 text-sm divide-y divide-gray-700/50">
                        {filteredCustomers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                אין נתונים עבור מחלקה זו
                            </div>
                        ) : (
                            <List
                                height={600}
                                itemCount={filteredCustomers.length}
                                itemSize={70}
                                width="100%"
                                itemData={filteredCustomers}
                                children={(({ index, style, data }: any) => {
                                    const c = data[index];
                                    return (
                                        <div style={style} className="flex hover:bg-slate-700/50 transition-colors items-center px-4 w-full">
                                            <div className="w-[12%] font-mono text-cyan-300 font-bold truncate pr-2">{c.Username}</div>
                                            <div className="w-[12%] font-mono text-xs text-gray-400 truncate pr-2">{c.Password}</div>
                                            <div className="w-[12%] text-xs pr-2">{c['Created At']}</div>
                                            <div className="w-[12%] text-xs font-bold text-white pr-2">{c['Expire date']}</div>
                                            <div className="w-[10%] pr-2">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold border whitespace-nowrap ${
                                                    c.Days_Left > 30 ? 'bg-green-900/40 text-green-300 border-green-700/50' :
                                                    c.Days_Left > 0 ? 'bg-orange-900/40 text-orange-300 border-orange-700/50' :
                                                    'bg-red-900/40 text-red-300 border-red-700/50'
                                                }`}>
                                                    {c.Days_Left} ימים
                                                </span>
                                            </div>
                                            <div className="w-[20%] truncate text-xs text-gray-400 pr-2" title={c.Notes}>{c.Notes}</div>
                                            <div className="w-[10%] capitalize text-xs font-medium text-indigo-300 truncate pr-2">{c.Type}</div>
                                            <div className="w-[12%] pr-2">
                                                <button 
                                                    onClick={() => onViewCustomer(c.Notes)} 
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
                                                >
                                                    היסטוריה
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }) as any}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Customer Details Modal
const CustomerDetailsModal = ({ email, customers, orders, requests, onClose }: any) => {
    const customerSubs = Array.isArray(customers) ? customers.filter((c: any) => c && String(c?.Notes || '').toLowerCase() === email.toLowerCase()) : [];
    const customerOrders = Array.isArray(orders) ? orders.filter((o: any) => o && String(o?.Email || '').toLowerCase() === email.toLowerCase()) : [];
    const customerTrials = Array.isArray(requests) ? requests.filter((r: any) => r && String(r?.email || '').toLowerCase() === email.toLowerCase()) : [];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block align-bottom bg-slate-800 rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-700">
                    <div className="bg-slate-700 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white">תיק לקוח: {email}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    
                    <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                        
                        {/* Subscriptions */}
                        <div>
                            <h4 className="text-xl font-bold text-cyan-400 mb-3">מנויים פעילים (Costumers)</h4>
                            {customerSubs.length > 0 ? (
                                <div className="bg-slate-900 rounded-lg border border-gray-700 overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-sm text-right text-gray-300 min-w-[600px]">
                                        <thead className="bg-slate-800 text-gray-200 border-b border-gray-700">
                                            <tr>
                                                <th className="p-3 font-bold">Username</th>
                                                <th className="p-3 font-bold">Password</th>
                                                <th className="p-3 font-bold">Type</th>
                                                <th className="p-3 font-bold">Expires</th>
                                                <th className="p-3 font-bold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {customerSubs.map((sub: any, i: number) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-3 font-mono text-white whitespace-nowrap">{sub.Username}</td>
                                                    <td className="p-3 font-mono text-xs text-gray-400 whitespace-nowrap">{sub.Password}</td>
                                                    <td className="p-3 whitespace-nowrap text-xs text-indigo-300">{sub.Type}</td>
                                                    <td className="p-3 whitespace-nowrap text-xs">{sub['Expire date']}</td>
                                                    <td className="p-3 whitespace-nowrap">
                                                        <span className="bg-green-900/40 text-green-300 px-2 py-0.5 rounded text-[10px] font-bold border border-green-700/50">{sub.Status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p className="text-gray-500">אין מנויים פעילים</p>}
                        </div>

                        {/* Orders History */}
                        <div>
                            <h4 className="text-xl font-bold text-purple-400 mb-3">היסטוריית הזמנות</h4>
                            {customerOrders.length > 0 ? (
                                <div className="bg-slate-900 rounded-lg border border-gray-700 overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-sm text-right text-gray-300 min-w-[600px]">
                                        <thead className="bg-slate-800 text-gray-200 border-b border-gray-700">
                                            <tr>
                                                <th className="p-3 font-bold">Date</th>
                                                <th className="p-3 font-bold">Plan</th>
                                                <th className="p-3 font-bold">Payment</th>
                                                <th className="p-3 font-bold">Type</th>
                                                <th className="p-3 font-bold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {customerOrders.map((order: any, i: number) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-3 whitespace-nowrap text-xs">{order.Date.split('T')[0]}</td>
                                                    <td className="p-3 whitespace-nowrap text-xs font-bold text-white">{order['Plan ID']}</td>
                                                    <td className="p-3 whitespace-nowrap text-xs text-gray-400">{order.PaymentMethod}</td>
                                                    <td className="p-3 whitespace-nowrap text-xs">{order.IsRenewal === 'Renewal' ? 'Renewal' : 'New'}</td>
                                                    <td className="p-3 whitespace-nowrap">
                                                        <span className="bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-700/50">{order.Status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p className="text-gray-500">אין הזמנות קודמות</p>}
                        </div>

                        {/* Trial Requests */}
                        <div>
                            <h4 className="text-xl font-bold text-orange-400 mb-3">בקשות ניסיון</h4>
                            {customerTrials.length > 0 ? (
                                <div className="bg-slate-900 rounded-lg border border-gray-700 overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-sm text-right text-gray-300 min-w-[600px]">
                                        <thead className="bg-slate-800 text-gray-200 border-b border-gray-700">
                                            <tr>
                                                <th className="p-3 font-bold">Date</th>
                                                <th className="p-3 font-bold">Plan</th>
                                                <th className="p-3 font-bold">Details</th>
                                                <th className="p-3 font-bold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {customerTrials.filter(Boolean).map((req: any, i: number) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-3 whitespace-nowrap text-xs">{req?.date || ''}</td>
                                                    <td className="p-3 whitespace-nowrap text-xs font-bold text-white">{req?.plan || ''}</td>
                                                    <td className="p-3 text-xs text-gray-400">{req?.details || ''}</td>
                                                    <td className="p-3 whitespace-nowrap">
                                                        <span className="bg-orange-900/40 text-orange-300 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-700/50">{req?.status || 'Unknown'}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p className="text-gray-500">אין בקשות ניסיון</p>}
                        </div>

                    </div>
                    <div className="bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm" onClick={onClose}>
                            סגור
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LeadsTable = ({ leads }: any) => (
    <div>
        <h2 className="text-3xl font-bold text-white mb-6">לידים מהאתר</h2>
        <div className="bg-slate-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="w-full text-right min-w-[700px]">
                <div className="flex w-full bg-slate-900 text-gray-200 text-sm border-b border-gray-700 p-4 font-bold items-center">
                    <div className="w-[25%] pr-2">תאריך</div>
                    <div className="w-[25%] pr-2">שם</div>
                    <div className="w-[25%] pr-2">טלפון</div>
                    <div className="w-[25%] pr-2">אימייל</div>
                </div>
                    <div className="text-gray-200 text-sm divide-y divide-gray-700/50">
                        <List
                            height={500}
                            itemCount={leads.length}
                            itemSize={60}
                            width="100%"
                            itemData={leads}
                            children={(({ index, style, data }: any) => {
                                const l = data[index];
                                return (
                                    <div style={style} className="flex hover:bg-slate-700/50 transition-colors items-center px-4 w-full">
                                        <div className="w-[25%] pr-2 text-xs truncate">{l.Timestamp ? l.Timestamp.split('T')[0] : ''}</div>
                                        <div className="w-[25%] pr-2 font-bold text-white truncate">{l.Name}</div>
                                        <div className="w-[25%] pr-2 font-mono text-xs text-indigo-300 truncate">{l.Phone}</div>
                                        <div className="w-[25%] pr-2 font-mono text-xs text-gray-400 truncate">{l.Email}</div>
                                    </div>
                                );
                            }) as any}
                        />
                    </div>
            </div>
        </div>
    </div>
);

const BlogCommentsTable = ({ comments, onUpdate }: any) => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">ניהול תגובות בלוג</h2>
            <div className="bg-slate-800 rounded-xl border border-gray-700 overflow-x-auto custom-scrollbar">
                <table className="w-full text-right min-w-[800px]">
                    <thead className="bg-slate-900 text-gray-200 text-sm border-b border-gray-700">
                        <tr>
                            <th className="p-4 font-bold">תאריך</th>
                            <th className="p-4 font-bold">שם</th>
                            <th className="p-4 font-bold">תגובה</th>
                            <th className="p-4 font-bold">סטטוס</th>
                            <th className="p-4 font-bold">פעולות</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-200 text-sm divide-y divide-gray-700/50">
                        {comments.map((c: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                                <td className="p-4 whitespace-nowrap text-xs">{c.Timestamp ? new Date(c.Timestamp).toLocaleDateString('he-IL') : ''}</td>
                                <td className="p-4 font-bold text-white whitespace-nowrap">{c.UserName}</td>
                                <td className="p-4 max-w-md truncate text-gray-400 text-xs" title={c.Text}>{c.Text}</td>
                                <td className="p-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                        c.Status === 'Approved' ? 'bg-green-900/40 text-green-300 border-green-700/50' :
                                        c.Status === 'Pending' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' :
                                        'bg-red-900/40 text-red-300 border-red-700/50'
                                    }`}>
                                        {c.Status}
                                    </span>
                                </td>
                                <td className="p-4 whitespace-nowrap space-x-2 space-x-reverse">
                                    {c.Status === 'Pending' && (
                                        <button 
                                            onClick={() => onUpdate('BlogComments', c.rowIndex, 'Approved')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
                                        >
                                            אשר
                                        </button>
                                    )}
                                    {c.Status !== 'Deleted' && (
                                        <button 
                                            onClick={() => {
                                                if (window.confirm('האם אתה בטוח שברצונך למחוק תגובה זו?')) {
                                                    onUpdate('BlogComments', c.rowIndex, 'Deleted');
                                                }
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
                                        >
                                            מחק
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ResellerLeadsTable = ({ registrations, onUpdate }: any) => (
    <div>
        <h2 className="text-3xl font-bold text-white mb-6">בקשות הצטרפות לזכיינות</h2>
        <div className="bg-slate-800 rounded-xl border border-gray-700 overflow-x-auto custom-scrollbar">
            <table className="w-full text-right min-w-[1000px]">
                <thead className="bg-slate-900 text-gray-200 text-sm border-b border-gray-700">
                    <tr>
                        <th className="p-4 font-bold">תאריך</th>
                        <th className="p-4 font-bold">שם</th>
                        <th className="p-4 font-bold">אימייל</th>
                        <th className="p-4 font-bold">טלפון</th>
                        <th className="p-4 font-bold">לקוח קיים</th>
                        <th className="p-4 font-bold">חבילה</th>
                        <th className="p-4 font-bold">תוכנית</th>
                        <th className="p-4 font-bold">סטטוס</th>
                        <th className="p-4 font-bold">פעולות</th>
                    </tr>
                </thead>
                <tbody className="text-gray-200 text-sm divide-y divide-gray-700/50">
                    {registrations.map((r: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                            <td className="p-4 whitespace-nowrap text-xs">{r.Date ? r.Date.split('T')[0] : ''}</td>
                            <td className="p-4 font-bold text-white whitespace-nowrap">{r.Name}</td>
                            <td className="p-4 whitespace-nowrap text-xs text-gray-400">{r.Email}</td>
                            <td className="p-4 whitespace-nowrap font-mono text-xs text-indigo-300">{r.Phone}</td>
                            <td className="p-4 whitespace-nowrap text-xs">{r.IsExisting}</td>
                            <td className="p-4 whitespace-nowrap text-xs text-cyan-300">{r.PackageType}</td>
                            <td className="p-4 whitespace-nowrap text-xs font-bold text-purple-300">{r.PlanType}</td>
                            <td className="p-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                    r.Status === 'Approved' ? 'bg-green-900/40 text-green-300 border-green-700/50' :
                                    r.Status === 'Pending' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' :
                                    'bg-red-900/40 text-red-300 border-red-700/50'
                                }`}>
                                    {r.Status}
                                </span>
                            </td>
                            <td className="p-4 whitespace-nowrap space-x-2 space-x-reverse">
                                {r.Status === 'Pending' && (
                                    <button 
                                        onClick={() => onUpdate('ResellerRegistrations', r.rowIndex, 'Approved')}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
                                    >
                                        אשר
                                    </button>
                                )}
                                <button 
                                    onClick={() => onUpdate('ResellerRegistrations', r.rowIndex, 'Rejected')}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
                                >
                                    דחה
                                </button>
                            </td>
                        </tr>
                    ))}
                    {registrations.length === 0 && (
                        <tr>
                            <td colSpan={9} className="p-8 text-center text-gray-500">אין בקשות הצטרפות להצגה</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const ResellerCrm = ({ initialData, onRefresh }: { initialData?: any[], onRefresh: () => void }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, netProfit: 0 });
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        resellerName: '',
        type: 'Income' as 'Income' | 'Expense',
        amount: 0,
        category: 'Starter',
        description: ''
    });

    useEffect(() => {
        if (initialData) {
            setTransactions(initialData);
            const income = initialData.filter(t => t.Type === 'Income').reduce((sum, t) => sum + (parseFloat(t.Amount) || 0), 0);
            const expenses = initialData.filter(t => t.Type === 'Expense').reduce((sum, t) => sum + (parseFloat(t.Amount) || 0), 0);
            setStats({
                totalIncome: income,
                totalExpenses: expenses,
                netProfit: income - expenses
            });
        }
    }, [initialData]);

    const handleAddTransaction = async () => {
        if (!newTransaction.resellerName || newTransaction.amount <= 0) {
            alert('נא למלא את כל השדות');
            return;
        }
        setLoading(true);
        const success = await addResellerTransaction(newTransaction);
        if (success) {
            alert('עסקה נוספה בהצלחה');
            setShowAddModal(false);
            setNewTransaction({
                resellerName: '',
                type: 'Income',
                amount: 0,
                category: 'Starter',
                description: ''
            });
            onRefresh();
        } else {
            alert('שגיאה בהוספת עסקה');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Reseller CRM 💼</h2>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all"
                >
                    + הוסף תנועה
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">סה"כ הכנסות</p>
                    <p className="text-3xl font-black text-green-400">₪{stats.totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">סה"כ הוצאות</p>
                    <p className="text-3xl font-black text-red-400">₪{stats.totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">רווח נקי</p>
                    <p className={`text-3xl font-black ${stats.netProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                        ₪{stats.netProfit.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-slate-800 rounded-xl border border-gray-700 overflow-x-auto custom-scrollbar">
                <table className="w-full text-right min-w-[800px]">
                    <thead className="bg-slate-900 text-gray-200 text-sm border-b border-gray-700">
                        <tr>
                            <th className="p-4 font-bold">תאריך</th>
                            <th className="p-4 font-bold">שם זכיין</th>
                            <th className="p-4 font-bold">סוג</th>
                            <th className="p-4 font-bold">סכום</th>
                            <th className="p-4 font-bold">קטגוריה</th>
                            <th className="p-4 font-bold">תיאור</th>
                            <th className="p-4 font-bold">סטטוס</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-200 text-sm divide-y divide-gray-700/50">
                        {transactions.map((t, i) => (
                            <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                                <td className="p-4 whitespace-nowrap text-xs">{t.Date ? t.Date.split('T')[0] : ''}</td>
                                <td className="p-4 font-bold text-white whitespace-nowrap">{t.ResellerName}</td>
                                <td className="p-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${t.Type === 'Income' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                                        {t.Type === 'Income' ? 'הכנסה' : 'הוצאה'}
                                    </span>
                                </td>
                                <td className={`p-4 font-bold ${t.Type === 'Income' ? 'text-green-400' : 'text-red-400'}`}>₪{t.Amount.toLocaleString()}</td>
                                <td className="p-4 whitespace-nowrap text-xs text-indigo-300">{t.Category}</td>
                                <td className="p-4 max-w-xs truncate text-gray-400" title={t.Description}>{t.Description}</td>
                                <td className="p-4 whitespace-nowrap">
                                    <span className="bg-slate-900/50 border border-gray-700 px-2 py-1 rounded text-[10px] text-gray-300">{t.Status}</span>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">אין תנועות להצגה</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-gray-700 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in">
                        <h3 className="text-2xl font-bold text-white mb-6">הוספת תנועה חדשה</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">שם הזכיין</label>
                                <input 
                                    type="text" 
                                    value={newTransaction.resellerName}
                                    onChange={e => setNewTransaction({...newTransaction, resellerName: e.target.value})}
                                    className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">סוג</label>
                                    <select 
                                        value={newTransaction.type}
                                        onChange={e => setNewTransaction({...newTransaction, type: e.target.value as any})}
                                        className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Income">הכנסה</option>
                                        <option value="Expense">הוצאה</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">סכום (₪)</label>
                                    <input 
                                        type="number" 
                                        value={newTransaction.amount}
                                        onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                                        className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">קטגוריה</label>
                                <select 
                                    value={newTransaction.category}
                                    onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                                    className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Starter">Starter</option>
                                    <option value="Tycoon">Tycoon</option>
                                    <option value="Empire">Empire</option>
                                    <option value="Credits">טעינת קרדיטים</option>
                                    <option value="Website">בניית אתר</option>
                                    <option value="Other">אחר</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">תיאור</label>
                                <textarea 
                                    value={newTransaction.description}
                                    onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                                    className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button 
                                onClick={handleAddTransaction}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                שמור
                            </button>
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MarketingPopupsManager = ({ initialPopups, onRefresh }: { initialPopups?: MarketingPopup[], onRefresh: () => void }) => {
    const [popups, setPopups] = useState<MarketingPopup[]>(initialPopups || []);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPopup, setEditingPopup] = useState<MarketingPopup | null>(null);
    const [formData, setFormData] = useState<Partial<MarketingPopup>>({
        title: '',
        content: '',
        ctaText: '',
        ctaLink: '',
        delaySeconds: 60,
        order: popups.length + 1,
        isActive: true
    });

    useEffect(() => {
        if (initialPopups) setPopups(initialPopups);
    }, [initialPopups]);

    const handleOpenModal = (popup?: MarketingPopup) => {
        if (popup) {
            setEditingPopup(popup);
            setFormData(popup);
        } else {
            setEditingPopup(null);
            setFormData({
                title: '',
                content: '',
                ctaText: '',
                ctaLink: '',
                delaySeconds: 60,
                order: popups.length + 1,
                isActive: true
            });
        }
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            alert('כותרת ותוכן הם שדות חובה');
            return;
        }

        let updatedPopups;
        if (editingPopup) {
            updatedPopups = popups.map(p => p.id === editingPopup.id ? { ...p, ...formData } : p);
        } else {
            const id = Math.random().toString(36).substr(2, 9);
            updatedPopups = [...popups, { ...formData, id } as MarketingPopup];
        }

        // Sort by order
        updatedPopups.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

        const success = await updateSiteSettings({ marketingPopups: updatedPopups });
        if (success) {
            alert('הפופ-אפ נשמר בהצלחה');
            setShowAddModal(false);
            onRefresh();
        } else {
            alert('שגיאה בשמירה');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק פופ-אפ זה?')) return;
        const updatedPopups = popups.filter(p => p.id !== id);
        const success = await updateSiteSettings({ marketingPopups: updatedPopups });
        if (success) {
            alert('נמחק בהצלחה');
            onRefresh();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <h2 className="text-3xl font-bold text-white">פופ-אפים שיווקיים 📣</h2>
                   <p className="text-gray-400 mt-1">נהל חלוניות שקופצות למשתמשים לפי זמן שהייה וסדר הופעה</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                    + הוסף פופ-אפ חדש
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {popups.map((popup) => (
                    <div key={popup.id} className={`bg-slate-800 p-6 rounded-2xl border transition-all ${popup.isActive ? 'border-gray-700 hover:border-indigo-500/50' : 'border-red-900/30 opacity-60'}`}>
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex gap-4">
                               <div className="bg-slate-900/80 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold border border-gray-700">
                                  {popup.order}
                               </div>
                               <div>
                                  <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                     {popup.title}
                                     {!popup.isActive && <span className="text-[10px] bg-red-900/50 text-red-400 px-2 py-0.5 rounded uppercase">מושבת</span>}
                                  </h4>
                                  <p className="text-gray-400 text-sm mt-1 max-w-2xl">{popup.content}</p>
                                  <div className="flex flex-wrap gap-4 mt-3">
                                     <span className="bg-slate-900 px-2 py-1 rounded text-xs text-indigo-300">השהיה: {popup.delaySeconds} שניות</span>
                                     <span className="bg-slate-900 px-2 py-1 rounded text-xs text-emerald-300">CTA: {popup.ctaText}</span>
                                     <span className="bg-slate-900 px-2 py-1 rounded text-xs text-amber-300 truncate max-w-[200px]">לינק: {popup.ctaLink}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-3 self-end md:self-center">
                                <button onClick={() => handleOpenModal(popup)} className="p-3 bg-slate-700 hover:bg-indigo-600 text-white rounded-xl transition-all" title="ערוך">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => handleDelete(popup.id)} className="p-3 bg-slate-700 hover:bg-red-600 text-white rounded-xl transition-all" title="מחק">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {popups.length === 0 && (
                    <div className="text-center py-20 bg-slate-800/40 rounded-3xl border border-dashed border-gray-700">
                        <div className="text-5xl mb-4 opacity-20">📢</div>
                        <p className="text-gray-500 font-bold">אין פופ-אפים שיווקיים מוגדרים במערכת.</p>
                        <button onClick={() => handleOpenModal()} className="mt-4 text-indigo-400 hover:text-indigo-300 underline">צור את הפופ-אפ הראשון שלך עכשיו!</button>
                    </div>
                )}
            </div>

            {/* Scale-in Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-slate-800 border border-gray-700 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar animate-scale-in">
                         <button onClick={() => setShowAddModal(false)} className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                         <h3 className="text-2xl font-bold text-white mb-8 border-b border-gray-700 pb-4">{editingPopup ? 'עריכת פופ-אפ' : 'יצירת פופ-אפ שיווקי חדש'}</h3>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">כותרת הפופ-אפ (מעודדת ומכירתית)</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="לדוגמה: מבצע מטורף לסופש!" />
                             </div>
                             
                             <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">תוכן ההודעה (שכנע את הלקוח)</label>
                                <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" placeholder="פירוט ההטבה או המבצע..." />
                             </div>

                             <div>
                                <label className="block text-sm text-gray-400 mb-1">טקסט כפתור (CTA)</label>
                                <input type="text" value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})} className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="לדוגמה: רכוש עכשיו" />
                             </div>

                             <div>
                                <label className="block text-sm text-gray-400 mb-1">קישור לכפתור (URL)</label>
                                <input type="text" value={formData.ctaLink} onChange={e => setFormData({...formData, ctaLink: e.target.value})} className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://..." />
                             </div>

                             <div>
                                <label className="block text-sm text-gray-400 mb-1">זמן השהיה (בשניות)</label>
                                <input type="number" value={formData.delaySeconds} onChange={e => setFormData({...formData, delaySeconds: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                             </div>

                             <div>
                                <label className="block text-sm text-gray-400 mb-1">סדר הופעה (1 ראשון)</label>
                                <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-gray-600 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                             </div>

                             <div className="col-span-1 md:col-span-2 py-4">
                                <ToggleItem 
                                    label="פופ-אפ פעיל" 
                                    description="האם להציג את הפופ-אפ הזה לגולשים?" 
                                    active={formData.isActive || false} 
                                    onClick={() => setFormData({...formData, isActive: !formData.isActive})} 
                                />
                             </div>
                         </div>

                         <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
                             <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20">שמור פופ-אפ</button>
                             <button onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-2xl transition-all">ביטול</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DataMigration = ({ token }: { token: string | null }) => {
    const [status, setStatus] = useState<{ loading: boolean, result?: string, count?: number, errors?: string[] }>({ loading: false });
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

    const handleMigrate = async () => {
        if (!token) return;
        if (!confirm('האם אתה בטוח שברצונך לסנכרן את כל הנתונים מ-Google Sheets ל-Firebase? נתונים קיימים ב-Firebase עלולים להידרס.')) return;
        
        setStatus({ loading: true });
        setProgress({ current: 0, total: 100 }); // initial fake total
        
        try {
            const result = await migrateAllData(token, (current, total) => {
                setProgress({ current, total });
            });
            
            setStatus({ 
                loading: false, 
                result: result.success ? 'Success' : 'Partial Success', 
                count: result.count,
                errors: result.errors
            });
            
            setProgress(null);
            
            if (result.success) {
                // Success message handled in UI
            }
        } catch (e: any) {
            setStatus({ loading: false, result: 'Error', errors: [e.message] });
            setProgress(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">ניהול בסיס נתונים 🗄️</h2>
            
            <div className="bg-slate-800 p-8 rounded-3xl border border-gray-700 shadow-xl">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 w-full">
                        <h3 className="text-2xl font-black text-white mb-2">Google Sheets ➔ Firebase Migration</h3>
                        <p className="text-gray-400 mb-6 italic leading-relaxed text-sm">
                            תהליך זה מעביר את כל ההזמנות, הלקוחות, הפניות וההגדרות מהגליונות של גוגל ישירות ל-Firestore. 
                            מומלץ לבצע זאת פעם אחת לפני המעבר הסופי ל-Firebase כמאגר ראשי.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mb-6">
                            <button 
                                onClick={handleMigrate}
                                disabled={status.loading}
                                className={`px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center gap-3 ${status.loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 shadow-indigo-500/25'}`}
                            >
                                {status.loading ? (
                                    <>
                                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        מעביר נתונים...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        סנכרן הכל ל-Firebase
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Progress Bar Display */}
                        {status.loading && progress && (
                            <div className="mt-6 w-full bg-slate-900 rounded-full h-4 relative overflow-hidden border border-gray-700">
                                <div 
                                    className="bg-gradient-to-r from-cyan-400 to-purple-600 h-full rounded-full transition-all duration-300" 
                                    style={{ width: `${Math.max(5, Math.min(100, (progress.current / Math.max(1, progress.total)) * 100))}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                                    {progress.current} / {progress.total}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Result Display */}
                {status.result && !status.loading && (
                    <div className={`mt-8 p-6 rounded-2xl border ${status.result === 'Success' ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            {status.result === 'Success' ? (
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ) : (
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                            <h4 className={`font-black text-2xl ${status.result === 'Success' ? 'text-green-400' : 'text-red-400'}`}>
                                {status.result === 'Success' ? 'סנכרון הושלם בהצלחה!' : 'שגיאה בסנכרון'}
                            </h4>
                        </div>
                        
                        <div className="space-y-2 text-gray-300">
                            <p className="font-medium">רשומות שעובדו: <span className="text-white font-bold">{status.count}</span></p>
                            
                            {status.errors && status.errors.length > 0 && (
                                <div className="mt-6">
                                    <p className="font-bold text-red-400 mb-2">שגיאות שנמצאו ({status.errors.length}):</p>
                                    <ul className="text-xs list-disc list-inside h-40 overflow-y-auto custom-scrollbar bg-black/40 p-4 rounded-xl border border-red-900/30 text-red-200">
                                        {status.errors.map((err, i) => <li key={i} className="mb-1">{err}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700 h-full flex flex-col">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        יתרונות Firebase
                    </h4>
                    <ul className="text-gray-400 text-sm space-y-3 flex-1">
                        <li className="flex gap-2"><span>✅</span> מהירות תגובה של מילי-שניות (ללא המתנה ל-Google Scripts)</li>
                        <li className="flex gap-2"><span>✅</span> תמיכה בזמן אמת (Real-time) לצ'אטים ועדכונים</li>
                        <li className="flex gap-2"><span>✅</span> אבטחת מידע מתקדמת (Security Rules) ברמת השדה</li>
                        <li className="flex gap-2"><span>✅</span> יכולת גדילה (Scalability) לכמות משתמשים בלתי מוגבלת</li>
                    </ul>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-gray-700 h-full flex flex-col">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        גיבוי Google Sheets
                    </h4>
                    <p className="text-gray-400 text-sm flex-1 leading-relaxed">
                        הגליונות של גוגל ימשיכו להתעדכן במקביל (Dual Write) לצרכי גיבוי וצפייה ידנית נוחה. 
                        אם המערכת הראשית נחשפת לתקלה, ניתן לחזור לשימוש מלא בגוגל שיטס בלחיצת כפתור אחת דרך "הגדרות אתר".
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
