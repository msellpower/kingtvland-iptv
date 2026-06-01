import * as sheetService from './sheetService';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    serverTimestamp,
    orderBy,
    limit,
    getDocsFromServer
} from 'firebase/firestore';
import { 
    OrderData, 
    Subscription, 
    ReportTicket, 
    AdminDataResponse, 
    ChatMessage, 
    ContentRequest,
    BlogComment
} from '../types';
import { SystemSettings } from '../utils/timeLogic';

// Use a local state or a system setting to toggle
let dbMode: 'firebase' | 'sheets' = 'sheets'; // Default to sheets until switched

export const setDbMode = (mode: 'firebase' | 'sheets') => {
    dbMode = mode;
    localStorage.setItem('app_db_mode', mode);
};

export const getDbMode = (): 'firebase' | 'sheets' => {
    const stored = localStorage.getItem('app_db_mode');
    if (stored === 'firebase' || stored === 'sheets') return stored;
    return dbMode;
};

// --- Helper for switching logic ---

const isFirebase = () => getDbMode() === 'firebase';

// --- Configuration & Settings ---

export const getPublicSettings = async (): Promise<SystemSettings | null> => {
    if (isFirebase()) {
        try {
            const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
            if (settingsDoc.exists()) {
                const data = settingsDoc.data() as SystemSettings;
                return { ...data, DB_MODE: 'firebase' };
            }
        } catch (error) {
            console.error("Firebase getPublicSettings error:", error);
            // Fallback to sheets
        }
    }
    const settings = await sheetService.getPublicSettings();
    if (settings) {
        return { ...settings, DB_MODE: getDbMode() };
    }
    return null;
};

export const updateSiteSettings = async (settings: Partial<SystemSettings>): Promise<boolean> => {
    const sheetSuccess = await sheetService.updateSiteSettings(settings);
    
    // Always try to sync to Firebase if possible (Dual Write for settings)
    try {
        await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
    } catch (error) {
        console.error("Firebase updateSiteSettings error:", error);
    }
    
    return sheetSuccess;
};

// --- Orders ---

export const submitOrder = async (data: OrderData): Promise<boolean> => {
    // Dual write for safety as requested
    const sheetSuccess = await sheetService.submitOrderToSheet(data);
    
    try {
        await addDoc(collection(db, 'orders'), {
            ...data,
            createdAt: serverTimestamp(),
            source: 'web'
        });
    } catch (error) {
        console.error("Firebase submitOrder error:", error);
    }
    
    return sheetSuccess;
};

// --- Tickets & Reports ---

export const submitReport = async (ticket: ReportTicket): Promise<boolean> => {
    const sheetSuccess = await sheetService.submitReport(ticket);
    
    try {
        await addDoc(collection(db, 'tickets'), {
            ...ticket,
            timestamp: new Date().toISOString(),
            status: ticket.status || 'Open'
        });
    } catch (error) {
        console.error("Firebase submitReport error:", error);
    }
    
    return sheetSuccess;
};

// --- Trial Requests ---

export const requestTrial = async (name: string, email: string, phone: string, dob: string, planId: string) => {
    const result = await sheetService.requestTrial(name, email, phone, dob, planId);
    
    if (result.success) {
        try {
            await addDoc(collection(db, 'trials'), {
                name, email, phone, dob, planId,
                timestamp: new Date().toISOString(),
                status: 'Requested'
            });
        } catch (error) {
            console.error("Firebase requestTrial record error:", error);
        }
    }
    
    return result;
};

// --- Admin Data ---

export const getAdminData = async (token: string): Promise<AdminDataResponse | null> => {
    if (isFirebase()) {
        try {
            // Fetch everything from Firebase
            const [
                ordersSnap, 
                usersSnap, 
                ticketsSnap, 
                trialsSnap, 
                requestsSnap, 
                settingsDoc
            ] = await Promise.all([
                getDocs(collection(db, 'orders')),
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'tickets')),
                getDocs(collection(db, 'trials')),
                getDocs(collection(db, 'requests')),
                getDoc(doc(db, 'settings', 'global'))
            ]);

            const orders = ordersSnap.docs.map(d => ({ ...d.data(), id: d.id })) as any[];
            const customers = usersSnap.docs.map(d => ({ ...d.data(), id: d.id })) as any[];
            const reports = ticketsSnap.docs.map(d => ({ ...d.data(), id: d.id })) as any[];
            const requests = trialsSnap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    date: data.timestamp ? new Date(data.timestamp).toLocaleDateString('he-IL') : (data.date || ''),
                    name: data.name || '',
                    email: data.email || '',
                    plan: data.planId || data.plan || '',
                    type: data.type || 'Trial',
                    status: data.status === 'Requested' ? 'Pending' : (data.status || 'Pending'),
                    ...data
                };
            }) as any[];
            const settings = settingsDoc.exists() ? settingsDoc.data() as any : {};

            // Calculate stats
            const stats = {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, o) => sum + (parseFloat(o.finalPrice) || 0), 0),
                activeCustomers: customers.length,
                pendingReports: reports.filter(r => r.status === 'Open').length
            };

            return {
                stats,
                orders,
                customers,
                reports,
                requests,
                settings,
                // Fallback for fields not yet fully migrated to firebase-only flow
                resellerCrm: [],
                subscribers: [],
                chatSessions: [],
                blogComments: [],
                resellerRegistrations: []
            } as any;
        } catch (error) {
            console.error("Firebase getAdminData error, falling back to Sheets:", error);
        }
    }
    return sheetService.getAdminData(token);
};

export const submitRequest = async (request: ContentRequest): Promise<boolean> => {
    const sheetSuccess = await sheetService.submitRequest(request);
    
    try {
        await addDoc(collection(db, 'requests'), {
            ...request,
            timestamp: new Date().toISOString(),
            status: 'Pending'
        });
    } catch (error) {
        console.error("Firebase submitRequest error:", error);
    }
    
    return sheetSuccess;
};

export const adminLogin = async (password: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    return sheetService.adminLogin(password);
};

// --- Auth & Users ---

export const secureLogin = async (email: string, username: string, password?: string) => {
    const result = await sheetService.secureLogin(email, username, password || '');
    if (result.success) {
        // Record login in Firebase
        try {
            const userId = email.replace(/[@.]/g, '_');
            await setDoc(doc(db, 'users', userId), {
                email,
                username,
                lastLogin: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Firebase record login error:", error);
        }
    }
    return result;
};

export const updateUserVipStatus = async (email: string, isVip: boolean) => {
    try {
        const userId = email.replace(/[@.]/g, '_');
        await setDoc(doc(db, 'users', userId), {
            isVip,
            lastVipCheck: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Firebase record VIP error:", error);
    }
};

export const registerUser = async (name: string, email: string, phone: string, username: string, password?: string, emailCode?: string, birthday?: string) => {
    const result = await sheetService.registerUser(name, email, phone, username, password || '', emailCode, birthday);
    if (result.success) {
        try {
            await setDoc(doc(db, 'users', email.replace(/[@.]/g, '_')), {
                name, email, phone, username, birthday,
                createdAt: serverTimestamp(),
                status: 'Registered'
            });
        } catch (error) {
            console.error("Firebase register user record error:", error);
        }
    }
    return result;
};

export const getUserSubscriptions = async (token?: string): Promise<Subscription[]> => {
    if (!token) {
        console.warn('getUserSubscriptions called without auth token');
        return [];
    }

    if (isFirebase()) {
        try {
            const userEmail = localStorage.getItem('userEmail'); 
            if (userEmail) {
                const subDocs = await getDocs(query(collection(db, 'subscriptions'), where('userEmail', '==', userEmail)));
                if (!subDocs.empty) {
                    return subDocs.docs.map(d => d.data() as Subscription);
                }
            }
        } catch (error) {
            console.error("Firebase getUserSubscriptions error:", error);
        }
    }
    const result = await sheetService.getUserSubscriptions(token);
    return result.success && result.subscriptions ? result.subscriptions : [];
};

// --- Migration Tool ---

export const migrateAllData = async (token: string, onProgress?: (progress: number, total: number) => void): Promise<{ success: boolean, count: number, errors: string[] }> => {
    const data = await sheetService.getAdminData(token);
    if (!data) return { success: false, count: 0, errors: ['Could not fetch data from Sheets'] };

    let count = 0;
    const errors: string[] = [];

    const totalItems = (data.orders?.length || 0) + (data.customers?.length || 0) + (data.reports?.length || 0) + (data.requests?.length || 0) + (data.subscribers?.length || 0) + (data.settings ? 1 : 0);

    const migrateCollection = async (collectionName: string, items: any[]) => {
        for (const item of items) {
            try {
                // Use a stable ID if possible, or omit for auto-gen
                const id = item.id || (item.email ? item.email.replace(/[@.]/g, '_') : undefined);
                if (id) {
                    await setDoc(doc(db, collectionName, id), item);
                } else {
                    await addDoc(collection(db, collectionName), item);
                }
                count++;
                if (onProgress) onProgress(count, totalItems);
            } catch (e: any) {
                errors.push(`Error in ${collectionName}: ${e.message}`);
                count++; // Still increment so progress matches total
                if (onProgress) onProgress(count, totalItems);
            }
        }
    };

    if (data.orders) await migrateCollection('orders', data.orders);
    if (data.customers) await migrateCollection('users', data.customers);
    if (data.reports) await migrateCollection('tickets', data.reports);
    if (data.requests) await migrateCollection('trials', data.requests);
    if (data.subscribers) await migrateCollection('subscribers', data.subscribers);

    if (data.settings) {
        try {
            await setDoc(doc(db, 'settings', 'global'), data.settings);
            count++;
            if (onProgress) onProgress(count, totalItems);
        } catch (e: any) {
            errors.push(`Error in settings: ${e.message}`);
            count++;
            if (onProgress) onProgress(count, totalItems);
        }
    }

    return { success: errors.length === 0, count, errors };
};

export const updateStatus = async (sheetName: string, rowIndexOrId: number | string, newStatus: string): Promise<boolean> => {
    if (isFirebase() && typeof rowIndexOrId === 'string') {
        try {
            // Map sheetName to collection name
            const collectionMap: Record<string, string> = {
                'Requests': 'trials',
                'Reports': 'tickets',
                // Add others if needed
            };
            const collectionName = collectionMap[sheetName];
            if (collectionName) {
                let statusField = 'status';
                // Some collections might use different status values implicitly
                await updateDoc(doc(db, collectionName, rowIndexOrId), { status: newStatus });
                return true;
            }
        } catch (error) {
            console.error("Firebase updateStatus error, falling back to Sheets:", error);
        }
    }
    return sheetService.updateStatus(sheetName, rowIndexOrId as number, newStatus);
};

export const getTelegramSettings = async (token: string): Promise<any> => {
    try {
        const response = await fetch('/api/admin/telegram/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error('getTelegramSettings error:', error);
        return {};
    }
};

export const saveTelegramSettings = async (token: string, settings: any): Promise<boolean> => {
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
        return data.success === true;
    } catch (error) {
        console.error('saveTelegramSettings error:', error);
        return false;
    }
};

export const publishTelegramPost = async (token: string, message: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/admin/telegram/publish', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('publishTelegramPost error:', error);
        return false;
    }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    const result = await sheetService.requestPasswordReset(email);
    if (!result.success) throw new Error(result.error);
};

export const performPasswordReset = async (token: string, password: string): Promise<boolean> => {
    const result = await sheetService.performPasswordReset(token, password);
    return result.success;
};

export const sendNotification = async (token: string, notification: {
    title: string;
    message: string;
    targetType: 'all' | 'plan' | 'users';
    targetPlans?: string[];
    targetUsers?: string[];
}): Promise<boolean> => {
    try {
        const response = await fetch('/api/admin/notifications', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(notification)
        });
        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('sendNotification error:', error);
        return false;
    }
};

export const getUserNotifications = async (userEmail: string, userPlans: string[], username: string): Promise<any[]> => {
    try {
        const response = await fetch('/api/user/notifications', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ email: userEmail, plans: userPlans, username })
        });
        const data = await response.json();
        return data.notifications || [];
    } catch (error) {
        console.error('getUserNotifications error:', error);
        return [];
    }
};

export const { getResellerCrmData, addResellerTransaction } = sheetService;
