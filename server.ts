import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Initialize Firebase Admin
try {
  initializeApp();
} catch (error) {
  console.log('Firebase Admin already initialized or failed to initialize:', error);
}

const db = getFirestore();
const auth = getAuth();
const fv = FieldValue;

// Admin Data Cache
let adminDataCache: { data: any, timestamp: number } | null = null;
const ADMIN_CACHE_TTL = 30 * 1000; // 30 seconds cache

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
let ai: GoogleGenAI | null = null;
export function getAi(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    ai = new GoogleGenAI({ apiKey: key || 'dummy' });
  }
  return ai;
}


const app = express();
app.set('trust proxy', 1); // Trust first proxy (e.g. Cloud Run/Nginx)
const PORT = 3000;
const DUKHIFAT_API_URL = 'https://dukhifat-api.workers.dev';
const DUKHIFAT_API_KEY = process.env.DUKHIFAT_API_KEY || '';

// --- Security Middleware ---

// 1. Helmet for secure headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Vite dev server compatibility
}));

// 2. Default API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Strict Auth Limiter: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  message: { error: 'ננעלת עקב יותר מדי נסיונות התחברות כושלים. נסה שוב מאוחר יותר.' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// 3. CORS - Restrict in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

// Normalize function-hosted routes that may be stripped of the /api prefix.
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/') && /^\/(public|auth|admin|reseller|sheet|wallet|store)(\/|$)/.test(req.path)) {
    req.url = `/api${req.url}`;
  }
  next();
});

// --- Auth Middleware ---

interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (isDevAdminMode && idToken === DEV_ADMIN_TOKEN) {
    req.user = { uid: 'admin', email: 'admin@kingtvland.com' } as any;
    return next();
  }
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    // Check if user is in admins collection
    const adminDoc = await db.collection('admins').doc(uid).get();
    if (!adminDoc.exists) {
      console.warn(`Non-admin attempted access: ${decodedToken.email} (${uid})`);
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    // If it was supposed to be a JWT but failed decoding
    console.error('Admin Auth JWT Error:', error instanceof Error ? error.message : error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token', details: error instanceof Error ? error.message : 'Decoding failed' });
  }
};

// --- API Routes (Auth) ---

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';
const DEV_ADMIN_PASSWORD = process.env.ADMIN_PASS || '2202';
const DEV_ADMIN_TOKEN = process.env.ADMIN_DEV_TOKEN || 'kingtvland-local-admin-token';
const isNetlifyDeployment = process.env.NETLIFY === 'true';
const isDevAdminMode = !isNetlifyDeployment || process.env.INSECURE_ADMIN_MODE === 'true';

console.log('🔍 DEBUG: GOOGLE_SCRIPT_URL value:', GOOGLE_SCRIPT_URL);
console.log('🔍 DEBUG: GOOGLE_SCRIPT_URL type:', typeof GOOGLE_SCRIPT_URL);
console.log('🔍 DEBUG: GOOGLE_SCRIPT_URL length:', GOOGLE_SCRIPT_URL.length);
console.log('🔍 DEBUG: NETLIFY deployment:', process.env.NETLIFY);
console.log('🔍 DEBUG: DEV_ADMIN_PASSWORD set:', Boolean(DEV_ADMIN_PASSWORD));
console.log('🔍 DEBUG: DEV_ADMIN_TOKEN set:', DEV_ADMIN_TOKEN ? DEV_ADMIN_TOKEN.substring(0, 10) + '...' : 'none');
console.log('🔍 DEBUG: DEV_ADMIN_MODE:', isDevAdminMode);

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

if (!GOOGLE_SCRIPT_URL) {
  console.warn('⚠️ WARNING: GOOGLE_SCRIPT_URL is not defined in environment variables. Auth proxy will fail.');
} else if (!isValidUrl(GOOGLE_SCRIPT_URL)) {
  console.error(`❌ ERROR: GOOGLE_SCRIPT_URL is invalid: "${GOOGLE_SCRIPT_URL}". It must be a valid URL starting with http:// or https://`);
} else {
  console.log(`✅ GOOGLE_SCRIPT_URL is set: ${GOOGLE_SCRIPT_URL.substring(0, 20)}...`);
}

const fetchFromGoogleScript = async (action: string, payload: any, timeoutMs = 30000, expectJson = true) => {
  console.log(`📡 fetchFromGoogleScript called for action: ${action}`);
  console.log(`📡 GOOGLE_SCRIPT_URL at runtime: ${GOOGLE_SCRIPT_URL}`);
  console.log(`📡 isValidUrl result: ${isValidUrl(GOOGLE_SCRIPT_URL)}`);
  
  if (!GOOGLE_SCRIPT_URL || !isValidUrl(GOOGLE_SCRIPT_URL)) {
    throw new Error('GOOGLE_SCRIPT_URL is missing or invalid.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ action, ...payload }),
      signal: controller.signal
    });

    const responseText = await response.text();
    const trimmedText = responseText.trim();

    if (!response.ok) {
      console.error(`Google Script returned status ${response.status} for action ${action}:`, trimmedText.substring(0, 1000));
      throw new Error(`Google Script call failed for ${action}: ${response.status}`);
    }

    if (expectJson) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error(`Non-JSON response for action ${action}:`, trimmedText.substring(0, 1000));
        throw new Error(`Google Script returned an invalid JSON response for ${action}.`);
      }

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Failed to parse JSON response for action ${action}:`, parseError, trimmedText.substring(0, 1000));
        throw new Error(`Google Script returned malformed JSON for ${action}.`);
      }
    }

    return responseText;
  } finally {
    clearTimeout(timeout);
  }
};

const handleLogin = async (req: Request, res: Response) => {
  console.log("DEBUG: Login request received", req.body);
  try {
    const result = await fetchFromGoogleScript('secure_login', req.body);
    if (result.result !== 'success') {
      console.log("DEBUG: Login failed in script", result);
      return res.status(401).json(result);
    }
    res.json(result);
  } catch (error: any) {
    console.error('Auth Login Error:', error.message);
    res.status(500).json({ error: 'Auth Server Error', details: error.message });
  }
};

app.post('/api/auth/login', handleLogin);
app.post('/auth/login', handleLogin);

// --- API Routes (Admin) ---

// These routes have been moved to consolidated sections

// --- Generic Sheet Proxy (אליצפן Mode: Moved to secure implementation) ---

app.post('/api/reseller/register', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('reseller_registration', { payload: req.body });
    res.json(result);
  } catch (error: any) {
    console.error('Reseller Registration Error:', error.message);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});

app.post('/api/reseller/crm-data', authenticateAdmin, async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('get_reseller_crm_data', req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'CRM Data Error' });
  }
});

app.post('/api/reseller/add-transaction', authenticateAdmin, async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('add_reseller_transaction', { payload: req.body });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Add Transaction Error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  console.log("DEBUG: Register request received", req.body);
  try {
    const result = await fetchFromGoogleScript('register_user', req.body);
    if (result.result !== 'success') {
      console.log("DEBUG: Register failed in script", result);
      return res.status(400).json(result);
    }
    
    // Telegram Alert
    sendTelegramNotification('alert', `👤 <b>משתמש חדש נרשם!</b>\n\nשם: ${req.body.name}\nאימייל: ${req.body.email}\nשם משתמש: ${req.body.username}\n⏰ זמן: ${new Date().toLocaleString()}`);
    
    res.json(result);
  } catch (error: any) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ error: 'Registration Server Error', details: error.message });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', googleScriptUrl: GOOGLE_SCRIPT_URL.substring(0, 30) + '...' });
});

const handleAdminLogin = async (req: Request, res: Response) => {
  try {
    console.log('🔐 admin-login endpoint called with body:', req.body);
    const password = String(req.body?.password ?? '').trim();
    const expectedPassword = String(DEV_ADMIN_PASSWORD ?? '2202').trim();

    if ((!isNetlifyDeployment || isDevAdminMode) && password === expectedPassword) {
      console.log('🔐 Local dev admin login accepted.');
      return res.json({ result: 'success', token: DEV_ADMIN_TOKEN });
    }

    const result = await fetchFromGoogleScript('admin_login', req.body);
    console.log('🔐 admin-login result:', result);
    if (result.result !== 'success') {
      return res.status(401).json(result);
    }
    res.json(result);
  } catch (error: any) {
    console.error('Admin Auth Error:', error.message);
    res.status(500).json({ error: 'Admin Auth Error', details: error.message });
  }
};

app.post('/api/auth/admin-login', handleAdminLogin);
app.post('/auth/admin-login', handleAdminLogin);

const handlePublicSettings = async (req: Request, res: Response) => {
  console.log("DEBUG: Reached public settings handler", req.path);
  try {
    if (!GOOGLE_SCRIPT_URL || !isValidUrl(GOOGLE_SCRIPT_URL)) {
      console.warn("⚠️ handlePublicSettings: GOOGLE_SCRIPT_URL missing, returning default settings.");
      return res.json({ result: 'success', settings: {} });
    }
    const result = await fetchFromGoogleScript('get_public_settings', {});
    res.json(result);
  } catch (error: any) {
    console.error("DEBUG: Failed public settings handler", error);
    // החזר ברירת מחדל במקום 500 כדי שהאפליקציה תמשיך לעבוד
    res.json({ result: 'success', settings: {} });
  }
};

app.post('/api/public/settings', handlePublicSettings);
app.get('/api/public/settings', handlePublicSettings);
app.post('/public/settings', handlePublicSettings);
app.get('/public/settings', handlePublicSettings);

app.post('/api/auth/password-reset-request', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('request_password_reset', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Password Reset Error' });
  }
});

app.post('/api/auth/verify-2fa', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('verify_2fa_code', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '2FA Verification Error' });
  }
});

// --- Public Proxy Routes ---

app.post('/api/public/subscribe', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('subscribe', { payload: req.body });
    if (result.result === 'success') {
      sendTelegramNotification('alert', `📧 <b>הרשמה חדשה לניוזלטר!</b>\n\nאימייל: ${req.body.email}\n⏰ זמן: ${new Date().toLocaleString()}`);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Subscription Error' });
  }
});

app.post('/api/public/trial', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('create_trial', { payload: req.body });
    
    if (result.result === 'success') {
      sendTelegramNotification('alert', `🧪 <b>בקשת ניסיון חדשה!</b>\n\n👤 שם: ${req.body.name}\n📱 טלפון: ${req.body.phone}\n📧 אימייל: ${req.body.email || 'לא נמסר'}\n⏰ זמן: ${new Date().toLocaleString()}`);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Trial Error' });
  }
});

app.post('/api/public/m3u', async (req, res) => {
  try {
    const text = await fetchFromGoogleScript('proxy_m3u', req.body, 30000, false);
    res.send(text);
  } catch (error) {
    res.status(500).send('M3U Error');
  }
});

app.post('/api/public/chat/send', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('send_message', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Chat Error' });
  }
});

import { SYSTEM_INSTRUCTION } from './constants';
let aiChatSession: any = null;

app.post('/api/public/chat/ai', apiLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    
    const aiInstance = getAi();
    if (!aiChatSession) {
      aiChatSession = aiInstance.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
    }
    
    const response = await aiChatSession.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ error: 'AI Chat Error' });
  }
});

app.post('/api/public/chat/messages', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('get_messages', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Chat Fetch Error' });
  }
});

app.post('/api/public/chat/mark-read', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('mark_read', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Chat Mark Read Error' });
  }
});

app.post('/api/public/article-details', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('get_article_details', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Article Error' });
  }
});

app.post('/api/public/report', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('report_issue', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Report Error' });
  }
});

app.post('/api/public/request', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('request_content', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Request Error' });
  }
});

app.post('/api/public/blog/comments', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('get_blog_comments', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Blog Comments Error' });
  }
});

app.post('/api/public/blog/add-comment', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('add_blog_comment', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Blog Add Comment Error' });
  }
});

app.post('/api/public/sms/send', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('send_sms_code', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'SMS Error' });
  }
});

app.post('/api/auth/password-reset-perform', async (req, res) => {
  try {
    const result = await fetchFromGoogleScript('perform_password_reset', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Password Reset Error' });
  }
});

const TMDB_API_KEY = "b4568ed0b9719e2bfaed5c85340e7866";

app.get('/api/public/tmdb', async (req, res) => {
  try {
    const category = req.query.category || 'popular';
    const response = await fetch(`https://api.themoviedb.org/3/movie/${category}?api_key=${TMDB_API_KEY}&language=he-IL&page=1`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'TMDB Error' });
  }
});

// Consolidated Auth, Admin and Public Routes
app.post('/api/admin/data', authenticateAdmin, async (req, res) => {
    try {
      if (adminDataCache && (Date.now() - adminDataCache.timestamp < ADMIN_CACHE_TTL)) {
        return res.json(adminDataCache.data);
      }
      
      try {
        const result = await fetchFromGoogleScript('get_admin_data', req.body, 90000);
        if (result.result === 'success') {
          adminDataCache = { data: result, timestamp: Date.now() };
          return res.json(result);
        }
      } catch (gsError: any) {
        console.warn('Google Apps Script admin data failed, returning fallback:', gsError?.message || gsError);
      }
      
      // Fallback response when Google Apps Script is unavailable
      const fallbackData = {
        result: 'success',
        stats: { totalRevenue: 0, activeSubscribers: 0, openTickets: 0 },
        orders: [],
        customers: [],
        subscribers: [],
        reports: [],
        blogComments: [],
        requests: [],
        chatSessions: [],
        resellerCrm: [],
        resellerRegistrations: [],
        settings: {}
      };
      
      adminDataCache = { data: fallbackData, timestamp: Date.now() };
      res.json(fallbackData);
      
    } catch (error: any) {
      console.error('Admin Data Error:', error.message);
      res.status(500).json({ error: 'Server Error', details: error.message });
    }
});

app.post('/api/admin/init', authenticateAdmin, async (req, res) => {
    try {
      const result = await fetchFromGoogleScript('init_database', req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Init Error' });
    }
});

app.post('/api/admin/update-status', authenticateAdmin, async (req, res) => {
    try {
      const result = await fetchFromGoogleScript('update_status', req.body);
      adminDataCache = null;
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Update Status Error' });
    }
});

// --- Validation Schemas ---

const ConnectWalletSchema = z.object({
  idToken: z.string().min(1)
});

const PurchaseSchema = z.object({
  productId: z.string().min(1),
  paymentType: z.enum(['points', 'coins'])
});

const AdminDataSchema = z.object({
  token: z.string().min(1) // Token is actually passed in body for some actions, but we prefer header
});

// --- Telegram Notification Service ---
const sendTelegramNotification = async (type: 'alert' | 'announcement', message: string) => {
  try {
    const settingsDoc = await db.collection('settings').doc('telegram').get();
    const settings = settingsDoc.data();

    if (!settings) return;

    const token = type === 'alert' ? settings.alertBotToken : settings.announcementBotToken;
    const chatId = type === 'alert' ? settings.alertChatId : settings.announcementChatId;

    if (!token || !chatId) {
      console.log(`Telegram ${type} skipped: Missing token or chat ID`);
      return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (error) {
    console.error('Telegram Notification Error:', error);
  }
};

// --- API Routes ---

// Telegram Bot Settings
app.post('/api/admin/telegram/settings', authenticateAdmin, async (req, res) => {
  try {
    const { alertBotToken, alertChatId, announcementBotToken, announcementChatId } = req.body;
    
    // Ensure db is available
    if (!db) {
       return res.status(503).json({ error: 'Database service unavailable' });
    }

    await db.collection('settings').doc('telegram').set({
      alertBotToken: alertBotToken || '',
      alertChatId: alertChatId || '',
      announcementBotToken: announcementBotToken || '',
      announcementChatId: announcementChatId || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save Telegram settings:', error);
    res.status(500).json({ error: 'Failed to save Telegram settings', details: error.message });
  }
});

app.get('/api/admin/telegram/settings', authenticateAdmin, async (req, res) => {
  try {
    const settingsDoc = await db.collection('settings').doc('telegram').get();
    res.json(settingsDoc.data() || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Telegram settings' });
  }
});

// Post Generator / Announcement
app.post('/api/admin/telegram/publish', authenticateAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    await sendTelegramNotification('announcement', message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish message' });
  }
});

app.post('/api/admin/telegram/stats', authenticateAdmin, async (req, res) => {
  try {
    const adminData = await fetchFromGoogleScript('get_admin_data', { token: 'admin_active' });
    
    if (!adminData || !adminData.stats) {
      return res.status(404).json({ error: 'Stats not available' });
    }

    const { stats } = adminData;
    const reportDate = new Date().toLocaleString('he-IL');
    
    const message = `📊 <b>דו"ח סטטיסטיקה - ${reportDate}</b>\n\n` +
      `💰 <b>הכנסות משוערות:</b> ₪${stats.totalRevenue}\n` +
      `👥 <b>מנויים פעילים:</b> ${stats.activeSubscribers}\n` +
      `⏰ <b>מסתיים החודש:</b> ${stats.expiringThisMonth || 0}\n` +
      `⚠️ <b>תקלות פתוחות:</b> ${stats.openTickets}\n\n` +
      `🚀 <i>הדו"ח נשלח לבקשת מנהל מהמערכת</i>`;

    await sendTelegramNotification('alert', message);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Send Stats Error:', error.message);
    res.status(500).json({ error: 'Failed to send stats', details: error.message });
  }
});

app.post('/api/admin/telegram/generate', authenticateAdmin, async (req, res) => {
  try {
    const { topic, context } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const prompt = `אתה מנהל שיווק של שירות King TV Land (שירות IPTV וסטרימינג פרמיום). 
    צור פוסט שיווקי קצר, קליט ומזמין לטלגרם בנושא: ${topic}. 
    הקשר נוסף: ${context || ''}
    השתמש בשפה עברית עכשווית, הוסף אימוג'ים מתאימים בסגנון טלגרם.
    חשוב להזכיר את שם המותג King TV Land וליצור תחושת דחיפות או יוקרה.
    אל תכתוב הקדמות, פשוט תן את הטקסט של הפוסט.`;

    const aiInstance = getAi();
    const result = await aiInstance.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    const text = result.text || '';
    
    res.json({ text });
  } catch (error: any) {
    console.error('AI Generation Error:', error.message);
    res.status(500).json({ error: 'AI Generation failed' });
  }
});

// --- Notifications ---

app.post('/api/admin/notifications', authenticateAdmin, async (req, res) => {
    try {
        const { title, message, targetType, targetPlans, targetUsers } = req.body;
        
        if (!title || !message || !targetType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await db.collection('notifications').add({
            title,
            message,
            targetType,
            targetPlans: targetPlans || [],
            targetUsers: targetUsers || [],
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        res.json({ success: true });
    } catch (error: any) {
        console.error('Add notification error:', error.message);
        res.status(500).json({ error: 'Failed to add notification' });
    }
});

app.post('/api/user/notifications', async (req, res) => {
    try {
        const { email, plans, username } = req.body;
        
        const notificationsSnapshot = await db.collection('notifications')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
            
        const notifications = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as any),
            timestamp: doc.data().timestamp?.toDate().toISOString()
        }));
        
        const filtered = notifications.filter((notif: any) => {
            if (notif.targetType === 'all') return true;
            if (notif.targetType === 'plan') {
                if (!plans || plans.length === 0) return false;
                return plans.some((p: string) => (notif.targetPlans || []).includes(p));
            }
            if (notif.targetType === 'users') {
                return (notif.targetUsers || []).includes(email) || (notif.targetUsers || []).includes(username);
            }
            return false;
        });
        
        res.json({ notifications: filtered });
    } catch (error: any) {
        console.error('Get user notifications error:', error.message);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

// 1. Connect User
app.post('/api/wallet/connect', authenticate, async (req: AuthRequest, res) => {
  const validation = ConnectWalletSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request data', details: validation.error.format() });
  }

  const { idToken } = validation.data;

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || email?.split('@')[0] || 'User';

    const userDoc = await db.collection('users').doc(uid).get();
    let coinUserId = userDoc.data()?.coinUserId;

    if (!coinUserId) {
      const response = await fetch(`${DUKHIFAT_API_URL}/createUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DUKHIFAT_API_KEY}`
        },
        body: JSON.stringify({ email, displayName: name })
      });

      if (!response.ok) throw new Error('Failed to create user in external API');

      const data = await response.json();
      coinUserId = data.userId;

      await db.collection('users').doc(uid).set({ coinUserId }, { merge: true });
    }

    res.json({ success: true, coinUserId });
  } catch (error) {
    console.error('Wallet Connect Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// These routes are now handled above in the Admin section

// Sheet Proxy Security
app.post('/api/sheet/proxy', async (req: AuthRequest, res) => {
  try {
    const { action, token, ...payload } = req.body;
    
    const adminRequiredActions = [
      'update_site_settings',
      'get_reseller_crm_data',
      'add_reseller_transaction',
      'get_premium_data',
      'update_premium_item',
      'delete_premium_item',
      'get_chat_sessions',
      'get_chat_messages',
      'send_admin_message',
      'update_chat_status',
      'get_comments',
      'update_comment_status',
      'delete_comment',
      'get_trials',
      'update_trial_status',
      'get_reseller_leads',
      'update_reseller_lead_status',
      'sync_channels',
      'generate_2fa_secret',
      'disable_2fa',
      'premium_api',
      'sync_premium_user'
    ];

    const authRequiredActions = [
      'get_user_subscriptions',
      'get_referral'
    ];

    if (adminRequiredActions.includes(action)) {
      if (!token) return res.status(401).json({ error: 'Admin token required' });
      const decoded = await auth.verifyIdToken(token);
      const adminDoc = await db.collection('admins').doc(decoded.uid).get();
      if (!adminDoc.exists) return res.status(403).json({ error: 'Admin access required' });
    } else if (authRequiredActions.includes(action)) {
      if (!token) return res.status(401).json({ error: 'Token required' });
      await auth.verifyIdToken(token);
    }
    
    const allowedActions = [
      'submit_order',
      ...authRequiredActions,
      ...adminRequiredActions,
      'get_public_settings',
      'submit_report',
      'submit_request',
      'report_issue',
      'request_content',
      'premium_api',
      'sync_premium_user',
      'get_article_details'
    ];

    if (!action || !allowedActions.includes(action)) {
      return res.status(403).json({ error: 'Action not allowed or missing' });
    }
    
    const result = await fetchFromGoogleScript(action, { token, ...payload });
    
    // Telegram Alerts for specific proxy actions
    if (result.result === 'success') {
      if (action === 'submit_order') {
        sendTelegramNotification('alert', `🛒 <b>הזמנה חדשה באתר!</b>\n\n👤 לקוח: ${payload.name}\n📞 טלפון: ${payload.phone}\n📦 תוכנית: ${payload.planId}\n⏰ זמן: ${new Date().toLocaleString()}`);
      } else if (action === 'report_issue' || action === 'submit_report') {
        sendTelegramNotification('alert', `⚠️ <b>דיווח על תקלה!</b>\n\n👤 מאת: ${payload.name || 'אנונימי'}\n📝 תיאור: ${payload.description || payload.message}\n⏰ זמן: ${new Date().toLocaleString()}`);
      } else if (action === 'request_content' || action === 'submit_request') {
        sendTelegramNotification('alert', `🎬 <b>בקשת תוכן חדשה!</b>\n\n👤 מאת: ${payload.name}\n🎥 תוכן: ${payload.title}\n⏰ זמן: ${new Date().toLocaleString()}`);
      }
    }

    res.json(result);
  } catch (error: any) {
    console.error('Sheet Proxy Error:', error.message);
    res.status(500).json({ error: 'Sheet Proxy Error', details: error.message });
  }
});

// 2. Get Wallet Balance (Protected)
app.get('/api/wallet/balance', authenticate, async (req: AuthRequest, res) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Derive coinUserId from Firestore based on authenticated UID (Security: Don't trust client-provided ID)
    const userDoc = await db.collection('users').doc(uid).get();
    const coinUserId = userDoc.data()?.coinUserId;

    if (!coinUserId) {
      return res.status(404).json({ error: 'Wallet not connected' });
    }

    const response = await fetch(`${DUKHIFAT_API_URL}/wallet?userId=${coinUserId}`, {
      headers: {
        'Authorization': `Bearer ${DUKHIFAT_API_KEY}`
      }
    });

    if (!response.ok) throw new Error('External API error');

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Balance Fetch Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Purchase Product (Protected)
app.post('/api/store/purchase', authenticate, async (req: AuthRequest, res) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  const validation = PurchaseSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  const { productId, paymentType } = validation.data;

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    const coinUserId = userDoc.data()?.coinUserId;

    if (!coinUserId) return res.status(400).json({ error: 'Wallet not connected' });

    const productDoc = await db.collection('products').doc(productId).get();
    const product = productDoc.data();

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const cost = paymentType === 'points' ? product.pricePoints : product.priceCoins;
    const endpoint = paymentType === 'points' ? '/spendPoints' : '/spendCoins';
    const bodyKey = paymentType === 'points' ? 'points' : 'coins';

    const response = await fetch(`${DUKHIFAT_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DUKHIFAT_API_KEY}`
      },
      body: JSON.stringify({ userId: coinUserId, [bodyKey]: cost })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment failed');
    }

    await db.collection('orders').add({
      storeUserId: uid,
      coinUserId,
      productId,
      productName: product.name,
      cost,
      currency: paymentType,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      downloadUrl: product.downloadUrl
    });

    // Telegram Alert
    sendTelegramNotification('alert', `💰 <b>רכישה חדשה בחנות!</b>\n\n👤 משתמש: ${req.user?.email}\n📦 מוצר: ${product.name}\n💳 עלות: ${cost} ${paymentType}\n⏰ זמן: ${new Date().toLocaleString()}`);

    res.json({ success: true, downloadUrl: product.downloadUrl });
  } catch (error: any) {
    console.error('Purchase Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

async function startServer() {
  // --- Vite / Static Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Only in production: resolve distPath based on script execution directory
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.NETLIFY) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

const currentModulePath = (() => {
  if (typeof __filename !== 'undefined') return __filename;
  try {
    return fileURLToPath(import.meta.url);
  } catch {
    return '';
  }
})();

if (process.argv[1] === currentModulePath) {
  startServer();
}

export default app;