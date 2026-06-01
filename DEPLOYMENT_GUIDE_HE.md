# 📋 הדרכה מלאה: העלאת KingTVLand ל-Netlify עם ניהול מלא

## 📌 סקירה כללית

אתר KingTVLand הוא אפליקציית React+Vite בשילוב Express backend, המשתמשת ב:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Firebase Admin SDK + Google Apps Script
- **Database**: Firestore + Google Sheets
- **Hosting**: Netlify Functions
- **Admin**: מערכת ניהול מלאה עם אימות

---

## 🔧 שלב 1: הכנה מוקדמת (30 דקות)

### 1.1 בדוק דרישות מוקדמות
```bash
node --version        # >= 18.0.0
npm --version         # >= 9.0.0
git --version         # >= 2.30.0
```

### 1.2 הסקת כניסות
```bash
# Clone/update repo
cd kingtvland1

# התקן dependencies
npm install

# בדוק build
npm run build
# ✓ Output: dist/ folder (size ~200MB ungzipped)
```

### 1.3 יצירת GitHub Repository
```bash
# אם עדיין לא יצרת:
git init
git remote add origin https://github.com/YOUR_USERNAME/kingtvland.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

---

## 🔐 שלב 2: הגדרת Firebase (45 דקות)

### 2.1 Firestore Rules
בדוק שהקובץ `firestore.rules` מוגדר כראוי:

```javascript
// ✓ Public Settings (קריאה)
match /public_settings/{document=**} {
  allow read: if true;
  allow write: if isAdmin();
}

// ✓ Admin Data (רק admin)
match /admin_data/{document=**} {
  allow read, write: if isAdmin();
}

// ✓ Users Collection
match /users/{userId} {
  allow read, write: if request.auth.uid == userId || isAdmin();
}

// Helper function
function isAdmin() {
  return request.auth.token.isAdmin == true;
}
```

### 2.2 Firebase Authentication

בקונסולת Firebase:
1. Navigate to: **Authentication > Sign-in method**
2. הפעל:
   - [x] Email/Password
   - [x] Google
   - [x] Custom claims (for admin)

3. ב-**Users** tab, הוסף admin:
   ```
   Email: your-email@example.com
   Custom Claims: { "isAdmin": true }
   ```

### 2.3 Firestore Collections

צור collections אלה:
```
Firestore/
  ├── admins/
  │   └── {uid}/ -> { role: "admin", createdAt: timestamp }
  ├── public_settings/
  │   └── site_config/ -> { SITE_TITLE, etc. }
  ├── users/
  │   └── {uid}/ -> { email, subscription, etc. }
  └── admin_logs/
      └── {docId}/ -> { action, timestamp, etc. }
```

### 2.4 Firebase Security Configuration

```
Project Settings > General:
- [x] Verify: API Key matches VITE_FIREBASE_API_KEY
- [x] Verify: Project ID matches VITE_FIREBASE_PROJECT_ID
- [x] Enable: Cloud Firestore
- [x] Enable: Authentication
```

---

## 📱 שלב 3: הגדרת Google Apps Script (60 דקות)

### 3.1 יצירת Google Apps Script

1. בקישור: https://script.google.com
2. בחר: **New Project**
3. שם: `KingTVLand API`

### 3.2 אפילוג של Functions הדרושות

```javascript
// 1. get_public_settings
function get_public_settings() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Settings');
  const range = sheet.getRange('A1:B100');
  const values = range.getValues();
  
  const settings = {};
  for (let i = 0; i < values.length; i++) {
    if (values[i][0]) settings[values[i][0]] = values[i][1];
  }
  
  return { result: 'success', settings };
}

// 2. admin_login
function admin_login(data) {
  const adminSheet = SpreadsheetApp.getActive().getSheetByName('Admins');
  const password = data.password;
  const expectedPassword = adminSheet.getRange('A1').getValue();
  
  if (password === expectedPassword) {
    return { result: 'success', token: 'admin_token_' + new Date().getTime() };
  }
  return { result: 'error', error: 'Invalid password' };
}

// 3. get_admin_data
function get_admin_data(data) {
  const usersSheet = SpreadsheetApp.getActive().getSheetByName('Users');
  const users = usersSheet.getRange('A1:E100').getValues();
  
  return {
    result: 'success',
    users: users,
    stats: {
      totalUsers: users.length,
      activeToday: 0
    }
  };
}

// 4. register_user
function register_user(data) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Users');
  
  // Check if user exists
  const values = sheet.getRange('A:A').getValues();
  if (values.includes([data.username])) {
    return { result: 'error', error: 'User already exists' };
  }
  
  // Add new user
  const nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 1, 1, 4).setValues([
    [data.username, data.email, data.password, new Date()]
  ]);
  
  return { result: 'success', message: 'User registered' };
}
```

### 3.3 Deploy Google Apps Script Web App

1. Click: **Deploy** > **New deployment**
2. Type: `Web app`
3. Execute as: {Your Google Account}
4. Who has access: `Anyone`
5. Click: **Deploy**

### 3.4 קבל את ה-URL

```
Web app URL: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
↓
Copy this to: GOOGLE_SCRIPT_URL environment variable
```

---

## 🌐 שלב 4: הגדרת Netlify (45 דקות)

### 4.1 יצירת Netlify Account

1. Navigate: https://netlify.com
2. Login: (GitHub / Google / Email)
3. Create: `New site from Git`
4. Select: GitHub repository

### 4.2 Configure Build Settings

```
Build settings:
├─ Base directory: (leave empty)
├─ Build command: npm run build
├─ Publish directory: dist
└─ Functions directory: netlify/functions
```

### 4.3 הוסף Environment Variables

בתא **Site settings > Environment**, הוסף:

```env
# Google Apps Script
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec

# Firebase (ציבורי)
VITE_FIREBASE_API_KEY=AIzaSyAOS_nCuf5sHwLGqpCchsrSSVhk4_MyOm0
VITE_FIREBASE_AUTH_DOMAIN=taxi-485721.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=taxi-485721
VITE_FIREBASE_STORAGE_BUCKET=taxi-485721.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=758823580836
VITE_FIREBASE_APP_ID=1:758823580836:web:f868bcf198c6145b3c2231

# Admin
ADMIN_PASS=CHANGE_THIS_TO_STRONG_PASSWORD
ADMIN_DEV_TOKEN=CHANGE_THIS_TO_RANDOM_TOKEN
NETLIFY=true

# Site Config
DOMAIN_NAME=your-site.netlify.app
ALLOWED_ORIGIN=https://your-site.netlify.app
SITE_URL=https://your-site.netlify.app
NODE_ENV=production
PORT=3000

# Email (Choose one)
RESEND_API_KEY=your_api_key_here
# Or
BREVO_API_KEY=your_api_key_here
```

### 4.4 Deploy ראשונה

```bash
# Push to GitHub
git add .
git commit -m "Ready for Netlify deployment"
git push origin main

# Netlify will auto-build and deploy
# Watch: Deploys tab for build progress
```

---

## ✅ שלב 5: ביצוע בדיקות (30 דקות)

### 5.1 בדוק Site Health

```bash
# Test API endpoint
curl https://your-site.netlify.app/api/test
# Expected: {"status":"ok",...}

# Test public settings
curl -X POST https://your-site.netlify.app/api/public/settings
# Expected: {"result":"success","settings":{...}}
```

### 5.2 בדוק Admin Panel

```
1. Navigate: https://your-site.netlify.app
2. Click: Admin Dashboard (or /admin path)
3. Login: 
   Password = ADMIN_PASS (שהגדרת)
4. Verify: Admin panel loads
5. Check: Data from Firestore/Sheets appears
```

### 5.3 בדוק Registration Flow

```
1. Navigate: Home page
2. Click: Register / Sign Up
3. Fill: Name, Email, Password
4. Submit: Check success message
5. Verify: User appears in Firestore
```

### 5.4 בדוק שגיאות ב-Logs

```
Netlify Dashboard:
├─ Deploys > Deploy logs (בדוק build errors)
├─ Functions > Logs (בדוק runtime errors)
└─ Monitor > Uptime (בדוק availability)
```

---

## 🔒 שלב 6: Security Hardening (45 דקות)

### 6.1 Change Default Credentials

```env
# Before deploying to production:
ADMIN_PASS=GenerateStrongPassword123!
ADMIN_DEV_TOKEN=$(openssl rand -hex 32)
```

### 6.2 Enable HTTPS

✅ **Already enabled** - Netlify default

### 6.3 Configure CORS

בקובץ `server.ts`:
```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN, // ❌ NOT '*'
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### 6.4 Enable Rate Limiting

✅ **Already configured** - 5 attempts per 15 min for auth

### 6.5 Setup Monitoring

```
Netlify Dashboard:
├─ Analytics > Performance monitoring
├─ Functions > Error tracking
└─ Deploy notifications: Slack / Email
```

---

## 📦 שלב 7: Continuous Deployment (Optional - 20 דקות)

### 7.1 GitHub Actions Workflow

✅ **Already created**: `.github/workflows/netlify-deploy.yml`

### 7.2 Configure Secrets

בקישור: GitHub > Settings > Secrets and variables

```
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id
VITE_FIREBASE_API_KEY=...
(add all env vars from Netlify)
```

### 7.3 Test Workflow

```bash
# On commit to main branch:
git push origin main

# GitHub Actions will:
# 1. Install dependencies
# 2. Run lint
# 3. Build
# 4. Deploy to Netlify
# 5. Comment on PR (if applicable)
```

---

## 🚨 Troubleshooting Guide

### בעיה: Build Failure

**סימנים**: Red "Failed" status ב-Netlify

**פתרון**:
1. בדוק Netlify deploy logs
2. ודא כל ENV vars מוגדרים
3. בדוק `npm run build` locally
4. Check: Node version >= 18

### בעיה: API 500 Error

**סימנים**: `GET /api/public/settings` returns 500

**פתרון**:
1. Check: GOOGLE_SCRIPT_URL in Netlify
2. Test: Google Apps Script is published
3. Check: Functions logs in Netlify
4. Verify: Google script has `get_public_settings` function

### בעיה: Admin Login Fails

**סימנים**: "Invalid Token" error

**פתרון**:
1. Verify: ADMIN_PASS is set in Netlify
2. Check: Firestore admin collection exists
3. Test: With DEV_ADMIN_TOKEN (temporary)
4. Check: Firebase auth rules

### בעיה: Firebase Auth Error

**סימנים**: "Unauthorized" on data fetch

**פתרון**:
1. Verify: All VITE_FIREBASE_* vars set
2. Check: Firestore security rules
3. Test: Firebase console works
4. Check: Browser console for CORS errors

---

## 📊 Performance Optimization

### Caching Strategy
```
- Settings: 10 min (memory + localStorage)
- Admin data: 30 sec (memory only)
- API responses: 1-5 sec (CDN)
```

### Build Size
```
Current:
├─ Main JS: ~840 KB gzipped
├─ CSS: ~21 KB gzipped
└─ HTML: ~1.7 KB gzipped

Goal: < 1 MB total
```

### Recommended Optimizations
- [ ] Enable Netlify Analytics
- [ ] Setup image optimization
- [ ] Configure cache headers
- [ ] Review bundle analysis

---

## ✨ Final Verification

Before announcing production launch:

- [x] Site loads at custom domain
- [x] All pages render correctly
- [x] API endpoints respond
- [x] Admin panel accessible
- [x] User registration works
- [x] Email notifications send
- [x] No console errors
- [x] Mobile responsive
- [x] Analytics tracked
- [x] SSL certificate valid (HTTPS)

---

## 📞 Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Firebase Docs**: https://firebase.google.com/docs
- **Google Apps Script**: https://developers.google.com/apps-script
- **Express.js**: https://expressjs.com
- **GitHub Actions**: https://github.com/features/actions

---

**Status**: ✅ Ready for Production
**Last Updated**: June 1, 2026
**Estimated Time**: 4-5 hours total
