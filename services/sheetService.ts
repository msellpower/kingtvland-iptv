
import { OrderData, Subscription, ReportTicket, AdminDataResponse, PremiumApiResponse, ReferralData, ChatMessage, ContentRequest } from '../types';
import { SystemSettings } from '../utils/timeLogic';

export const submitOrderToSheet = async (data: OrderData): Promise<boolean> => {
  try {
    const response = await fetch('/api/sheet/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit_order', ...data }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error submitting to sheet:", error);
    return false;
  }
};

// Consolidated Lead & Subscription Request
export const submitSubscription = async (name: string, phone: string, email: string): Promise<{ success: boolean, credentials?: { username: string, password: string } }> => {
    try {
      const response = await fetch('/api/public/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      if (result.result === 'success') {
          return { success: true, credentials: result.credentials };
      } else {
          return { success: false };
      }
    } catch (error) {
      console.error("Error submitting subscription:", error);
      return { success: false };
    }
  };

export const secureLogin = async (email: string, username: string, password: string): Promise<{ success: boolean; token?: string, error?: string, twoFactorRequired?: boolean }> => {
  const deviceId = localStorage.getItem('deviceId');
  try {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, deviceId }),
    });
    
    if (response.status === 429) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'ננעלת ל-30 דקות עקב יותר מדי נסיונות כושלים.' };
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (result.result === 'success') return { success: true, token: result.token };
    else return { success: false, error: result.error || 'שגיאת שרת' };
  } catch (error: any) {
    return { success: false, error: error.message || 'תקלה בהתחברות לשרת.' };
  }
};

export const getUserSubscriptions = async (token: string): Promise<{ success: boolean; subscriptions?: Subscription[], error?: string }> => {
  try {
    const response = await fetch('/api/sheet/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_user_subscriptions', token }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    
    if (result.result === 'success') return { success: true, subscriptions: result.subscriptions };
    else return { success: false, error: result.error || 'שגיאת שרת' };
  } catch (error) {
    return { success: false, error: 'תקלה בהתחברות לשרת.' };
  }
};

let settingsCache: { data: any, timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const getPublicSettings = async (): Promise<SystemSettings | null> => {
  // Check memory cache first
  if (settingsCache && (Date.now() - settingsCache.timestamp < CACHE_TTL)) {
    return settingsCache.data;
  }

  // Check localStorage fallback
  const localCache = localStorage.getItem('public_settings_cache');
  if (localCache) {
    const parsed = JSON.parse(localCache);
    if (Date.now() - parsed.timestamp < CACHE_TTL) {
      settingsCache = parsed;
      return parsed.data;
    }
  }

  try {
    const response = await fetch('/api/public/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    if (result.result === 'success') {
      const cacheData = { data: result.settings, timestamp: Date.now() };
      settingsCache = cacheData;
      localStorage.setItem('public_settings_cache', JSON.stringify(cacheData));
      return result.settings;
    }
    return null;
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return null;
  }
};

export const updateSiteSettings = async (settings: any): Promise<boolean> => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/sheet/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_site_settings', settings, token }),
        });
        const result = await response.json();
        if (result.result === 'success') {
            // Update local cache immediately
            const cached = localStorage.getItem('public_settings_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                parsed.data = { ...parsed.data, ...settings };
                parsed.timestamp = Date.now();
                localStorage.setItem('public_settings_cache', JSON.stringify(parsed));
                settingsCache = parsed;
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error("Update Settings Error:", error);
        return false;
    }
};

export const adminLogin = async (password: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
        const response = await fetch('/api/auth/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        
        if (response.status === 429) {
            return { success: false, error: 'Too many attempts, please try again later.' };
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error("Admin Login: Received non-JSON response:", text.substring(0, 200));
            return { success: false, error: 'Invalid server response.' };
        }

        const result = await response.json();
        if (result.result === 'success') {
            return { success: true, token: result.token };
        }
        return { success: false, error: result.error || 'Server error during admin login.' };
    } catch (error: any) {
        console.error("Admin Login Error:", error);
        return { success: false, error: error.message || 'Communication error during admin login.' };
    }
};

export const getM3UProxy = async (planId: string = 'king', timeoutMs: number = 30000): Promise<string | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch('/api/public/m3u', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const text = await response.text();
        
        if (text.trim().startsWith('{') && text.includes('"result":"error"')) {
            try {
                const json = JSON.parse(text);
                console.error("Proxy Error:", json.error);
                return null;
            } catch (e) {
                // Not JSON, continue
            }
        }
        
        if (text.includes('#EXTM3U') || text.length > 50) {
             return text;
        }

        return null;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
             console.warn(`M3U Proxy Timed out after ${timeoutMs}ms - Switching to fallback...`);
        } else {
             console.warn("M3U Proxy Fetch Error:", error);
        }
        return null;
    }
};

export const requestTrial = async (name: string, email: string, phone: string, dob: string, planId: string): Promise<{ success: boolean; message?: string; isOpen?: boolean; error?: string; credentials?: any }> => {
    try {
      const response = await fetch('/api/public/trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, dob, planId }),
      });
      const result = await response.json();
      if (result.result === 'success') return { 
          success: true, 
          message: result.message, 
          isOpen: result.isOpen,
          credentials: result.credentials
      };
      else return { success: false, error: result.error || 'לא ניתן ליצור מנוי ניסיון כרגע' };
    } catch (error) {
      return { success: false, error: 'תקלה בתקשורת עם השרת' };
    }
  };

export const submitReport = async (ticket: ReportTicket): Promise<boolean> => {
    try {
        const response = await fetch('/api/sheet/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'report_issue', ...ticket }),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const submitRequest = async (request: ContentRequest): Promise<boolean> => {
    try {
        const response = await fetch('/api/sheet/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'request_content', ...request }),
        });
        return response.ok;
    } catch (error) {
        console.error("Error submitting request:", error);
        return false;
    }
};

export const getAdminData = async (token: string): Promise<AdminDataResponse | null> => {
    try {
        const response = await fetch('/api/admin/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({}),
        });
        
        if (!response.ok) {
            console.error(`Admin Fetch Error: HTTP ${response.status}`);
            return null;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error("Admin Fetch: Received non-JSON response:", text.substring(0, 200));
            return null;
        }

        const result = await response.json();
        if (result.result === 'success') return result;
        return null;
    } catch (error) {
        console.error("Admin Fetch Error:", error);
        return null;
    }
};

export const submitResellerRegistration = async (data: any): Promise<boolean> => {
    try {
        const response = await fetch('/api/reseller/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        return result.result === 'success';
    } catch (error) {
        console.error("Reseller Registration Error:", error);
        return false;
    }
};

export const getResellerCrmData = async (): Promise<any | null> => {
    try {
        const response = await fetch('/api/reseller/crm-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (result.result === 'success') return result;
        return null;
    } catch (error) {
        console.error("Reseller CRM Fetch Error:", error);
        return null;
    }
};

export const addResellerTransaction = async (payload: any): Promise<boolean> => {
    try {
        const response = await fetch('/api/reseller/add-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        return result.result === 'success';
    } catch (error) {
        console.error("Add Reseller Transaction Error:", error);
        return false;
    }
};

export const updateStatus = async (sheetName: string, rowIndex: number, newStatus: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/admin/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sheetName, rowIndex, newStatus }),
        });
        const result = await response.json();
        return result.result === 'success';
    } catch (error) {
        return false;
    }
};

export const syncChannelsToSheet = async (planId: string): Promise<void> => {
    try {
        const token = localStorage.getItem('authToken');
        fetch('/api/sheet/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync_channels', planId, token }),
        });
    } catch (error) {
        console.error("Sync Trigger Error:", error);
    }
};

export const getReferralStatus = async (email: string): Promise<ReferralData | null> => {
    try {
        const response = await fetch('/api/sheet/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_referral', email }),
        });
        const result = await response.json();
        if (result.result === 'success') return result.data;
        return null;
    } catch (error) {
        console.error("Referral Fetch Error:", error);
        return null;
    }
};

// --- Premium API Function ---
export const managePremiumApi = async (payload: any): Promise<PremiumApiResponse> => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/sheet/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'premium_api', token, ...payload }),
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        return { result: 'error', error: error instanceof Error ? error.message : 'Unknown Error' };
    }
};

export const syncPremiumUserToSheet = async (apiData: any): Promise<boolean> => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/sheet/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync_premium_user', token, apiData }),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

// --- Chat Functions ---
export const sendChatMessage = async (sessionId: string, message: string, sender: 'user' | 'admin'): Promise<boolean> => {
    try {
        const response = await fetch('/api/public/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, message, sender }),
        });
        const result = await response.json();
        return result.result === 'success';
    } catch (e) { return false; }
};

export const getChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
    try {
         const response = await fetch('/api/public/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });
        const result = await response.json();
        if (result.result === 'success') return result.messages;
        return [];
    } catch (e) { return []; }
};

export const markMessagesAsRead = async (sessionId: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/public/chat/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });
        const result = await response.json();
        return result.result === 'success';
    } catch (e) { return false; }
};

export const sendEmailCode = async (email: string): Promise<{ success: boolean, error?: string }> => {
  try {
    const response = await fetch('/api/public/sms/send', { // Using SMS proxy as per code.txt logic
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: email }), // Assuming phone is passed here if it was SMS
    });
    const result = await response.json();
    if (result.result === 'success') return { success: true };
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: 'תקלה בשליחת קוד אימות.' };
  }
};

export const registerUser = async (name: string, email: string, phone: string, username: string, password?: string, emailCode?: string, birthday?: string): Promise<{ success: boolean, error?: string }> => {
  try {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: { name, email, phone, username, password, emailCode, birthday } }),
    });

    if (response.status === 429) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'ננעלת ל-30 דקות עקב יותר מדי נסיונות כושלים.' };
    }

    const result = await response.json();
    if (result.result === 'success') return { success: true };
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: 'תקלה ברישום.' };
  }
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean, error?: string }> => {
  try {
    const response = await fetch('/api/auth/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    
    if (response.status === 429) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'ננעלת ל-30 דקות עקב יותר מדי נסיונות כושלים.' };
    }

    const result = await response.json();
    if (result.result === 'success') return { success: true };
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: 'תקלה בבקשת איפוס.' };
  }
};

export const generate2FASecret = async (token: string): Promise<{ secret?: string, qrCodeUrl?: string, error?: string }> => {
  try {
    const response = await fetch('/api/sheet/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_2fa_secret', token }),
    });
    const result = await response.json();
    if (result.result === 'success') return { secret: result.secret, qrCodeUrl: result.qrCodeUrl };
    return { error: result.error };
  } catch (error) {
    return { error: 'תקלה ביצירת סוד 2FA.' };
  }
};

export const verify2FACode = async (token: string, code: string, rememberDevice: boolean): Promise<{ verified?: boolean, error?: string, deviceId?: string }> => {
  try {
    const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code, rememberDevice }),
    });

    if (response.status === 429) {
      const errorData = await response.json();
      return { error: errorData.error || 'ננעלת ל-30 דקות עקב יותר מדי נסיונות כושלים.' };
    }

    const result = await response.json();
    if (result.result === 'success') return { verified: result.verified };
    return { error: result.error };
  } catch (error) {
    return { error: 'תקלה באימות קוד 2FA.' };
  }
};

export const disable2FA = async (token: string): Promise<{ disabled?: boolean, error?: string }> => {
  try {
    const response = await fetch('/api/sheet/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable_2fa', token }),
    });
    const result = await response.json();
    if (result.result === 'success') return { disabled: result.disabled };
    return { error: result.error };
  } catch (error) {
    return { error: 'תקלה בהשבתת 2FA.' };
  }
};

export const performPasswordReset = async (token: string, newPassword: string): Promise<{ success: boolean, error?: string }> => {
  try {
    const response = await fetch('/api/auth/password-reset-perform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
    });
    const result = await response.json();
    if (result.result === 'success') return { success: true };
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: 'תקלה באיפוס הסיסמה.' };
  }
};

// --- Blog Functions ---
export const getBlogComments = async (postId: string): Promise<any[]> => {
    try {
        const response = await fetch('/api/public/blog/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId }),
        });
        const result = await response.json();
        if (result.result === 'success') return result.comments;
        return [];
    } catch (e) { return []; }
};

export const addBlogComment = async (postId: string, userName: string, text: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/public/blog/add-comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, userName, text }),
        });
        const result = await response.json();
        return result.result === 'success';
    } catch (e) { return false; }
};
