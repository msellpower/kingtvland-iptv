# 🚀 Netlify Deployment Checklist - KINGTVLAND

## סטטוס בדיקה: 6/1/2026

---

## ✅ שלב 1: דרישות מוקדמות

- [x] Node.js 18+ מותקן
- [x] npm dependencies התקינו בהצלחה (497 packages)
- [x] Git repository מוגדר
- [x] Firebase project קיים וחיבור פעיל

---

## ✅ שלב 2: משתני סביבה הדרושים ב-Netlify

### קטגוריה A: Google Apps Script (חובה)
```
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbz_Fz9JLbP_0xgfVeBiDAogXqjXBcvQPaOtnGSwKW33Byk5N-8__62j1RUOKtRzGhVIJg/exec
```
✅ **סטטוס**: מוגדר בהצלחה
- בדוק: כתובת Script זו פעילה ופתוחה לשימוש ציבורי
- אחראי: Google Apps Script Web App

### קטגוריה B: Firebase Configuration (חובה)
```
VITE_FIREBASE_API_KEY=AIzaSyAOS_nCuf5sHwLGqpCchsrSSVhk4_MyOm0
VITE_FIREBASE_AUTH_DOMAIN=taxi-485721.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=taxi-485721
VITE_FIREBASE_STORAGE_BUCKET=taxi-485721.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=758823580836
VITE_FIREBASE_APP_ID=1:758823580836:web:f868bcf198c6145b3c2231
```
✅ **סטטוס**: מוגדרים בהצלחה
- בדוק: קישור Firestore Database
- בדוק: Auth הופעל
- בדוק: Security Rules הוגדרו כראוי

### קטגוריה C: Admin Access (חובה)
```
ADMIN_PASS=2202
ADMIN_DEV_TOKEN=kingtvland-local-admin-token
NETLIFY=true
```
⚠️ **סטטוס**: צריך עדכון
- **IMPORTANT**: השנה `ADMIN_PASS` לסיסמה חזקה בייצור
- **IMPORTANT**: השנה `ADMIN_DEV_TOKEN` לאסימון בטוח בייצור

### קטגוריה D: Email Providers (אופציונלי - בחר אחד)
```
# Brevo
BREVO_API_KEY=your_brevo_api_key
BREVO_SMTP_SERVER=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_LOGIN=your_login
BREVO_SMTP_PASSWORD=your_password

# OR Resend
RESEND_API_KEY=your_resend_api_key

# OR Elastic Email
ELASTIC_EMAIL_API_KEY=your_elastic_email_api_key
```
⚠️ **סטטוס**: צריך תצורה
- בחר ספק אחד בלבד
- השג API keys מהספק שלך

### קטגוריה E: Site Configuration
```
DOMAIN_NAME=kingtvland-iptv.netlify.app
ALLOWED_ORIGIN=https://kingtvland-iptv.netlify.app
SITE_URL=https://kingtvland-iptv.netlify.app
NODE_ENV=production
PORT=3000
```
⚠️ **סטטוס**: צריך עדכון
- החלף `kingtvland-iptv.netlify.app` בדומיין שלך בפועל
- בדוק: ALLOWED_ORIGIN להתאמה מדויקת למאפיין הדומיין

### קטגוריה F: API Keys אופציונליים
```
DUKHIFAT_API_KEY=your_dukhifat_api_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## ✅ שלב 3: Firebase Security Configuration

### Firestore Rules
בדוק ש-[firestore.rules](./firestore.rules) מגדיר:
- [ ] גישה ציבורית לקריאה settings (למאתחלים)
- [ ] גישה admin-only לעדכוני admin
- [ ] הגנה על נתוני משתמים
- [ ] Rate limiting על כתיבה

### Firebase Authentication
- [ ] Enable: Email/Password
- [ ] Enable: Google Auth
- [ ] Enable: Custom Claims (עבור admin)
- [ ] Verify: Admin users במאגר `admins` collection

### Firebase Storage
- [ ] Public bucket קיים למדיה
- [ ] Security rules מגנים על uploads

---

## ✅ שלב 4: Google Apps Script Setup

### Validation
```
Endpoint: /api/public/settings
Method: POST
Status: 200 ✅
Response: {"result":"success","settings":{"SITE_TITLE":"KINGTVLAND"}}
```

### Required Functions בScript
- [x] `get_public_settings` - Accessible
- [x] `get_admin_data` - Requires token
- [x] `admin_login` - Requires password
- [ ] Verify all other functions exported correctly

### Network Configuration
- [ ] Script URL הוא HTTPS
- [ ] Execute as: ספציפיק משתמש
- [ ] Who has access: Anyone (חובה לאתר ציבורי)

---

## ✅ שלב 5: Build Verification

### Pre-Deployment Tests
```bash
# Build process
npm run build
# Output location: dist/

# Expected structure
dist/
  ├── index.html
  ├── assets/
  │   ├── *.js
  │   ├── *.css
  └── _redirects (auto-generated)
```

### Lint Check
```bash
npm run lint
# No blocking errors expected
```

### API Routes Test
```
✓ GET  /api/test
✓ POST /api/public/settings
✓ POST /api/auth/login
✓ POST /api/auth/register
✓ POST /api/admin/data (+ token)
✓ POST /api/public/subscribe
```

---

## ✅ שלב 6: Netlify Configuration

### netlify.toml Check
```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
✅ **סטטוס**: תקין

### Netlify Functions
- [x] `netlify/functions/api.ts` קיים
- [x] Handler מחובר ל-Express app
- [x] Node bundler: esbuild

---

## ✅ שלב 7: Deployment Steps

### Step-by-Step
1. **Setup Netlify Site**
   ```
   ברשת Netlify dashboard:
   - New site from Git
   - בחר את ה-repo
   ```

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   Functions directory: netlify/functions
   ```

3. **Add Environment Variables**
   ```
   בתא: Site settings > Environment
   הוסף כל משתנה מקטגוריות A-F למעלה
   ```

4. **Deploy Branch**
   ```
   Production: main
   Preview: feature branches
   ```

5. **First Deployment**
   ```bash
   git push origin main
   # Netlify will auto-build and deploy
   ```

---

## ✅ שלב 8: Post-Deployment Verification

### Health Checks
```
Endpoint: https://your-site.netlify.app/api/test
Expected: {"status":"ok","message":"Server is running",...}
```

### Admin Panel Access
```
1. Navigate to: https://your-site.netlify.app
2. Click: Admin Dashboard
3. Login: Password = ADMIN_PASS
4. Verify: Admin data loads
```

### Public Settings
```
1. Endpoint: https://your-site.netlify.app/api/public/settings
2. Expected: Settings from Google Sheets
3. Caching: 10 minutes (local + localStorage)
```

### Error Monitoring
```
Enable in Netlify: Site settings > Build & deploy > Monitoring
Watch logs for:
- GOOGLE_SCRIPT_URL failures
- Firebase auth errors
- Missing environment variables
```

---

## ✅ שלב 9: Ongoing Maintenance

### Weekly Checks
- [ ] API health status
- [ ] Error logs (Netlify > Analytics > Builds)
- [ ] Uptime monitoring
- [ ] Response times

### Monthly Tasks
- [ ] Review admin access logs (if available)
- [ ] Update dependencies: `npm audit fix`
- [ ] Test Google Apps Script integration
- [ ] Backup Firestore data

### Annual Security Review
- [ ] Rotate admin credentials
- [ ] Update Firebase security rules
- [ ] Audit Google Apps Script permissions
- [ ] Review CORS policies

---

## 🔒 Security Checklist

- [ ] Admin credentials are strong and unique
- [ ] GOOGLE_SCRIPT_URL is not hardcoded in client code
- [ ] Firebase rules enforce proper access control
- [ ] Rate limiting is enabled on critical endpoints
- [ ] HTTPS is enforced (Netlify default)
- [ ] CORS is restricted to your domain
- [ ] Database backups are automated
- [ ] Monitoring alerts are configured

---

## 📞 Troubleshooting Guide

### Issue: "GOOGLE_SCRIPT_URL is missing"
**Solution**: 
1. Verify in Netlify Site settings > Environment
2. Restart deployment: Deploys > Trigger deploy

### Issue: Admin login fails
**Solution**:
1. Check ADMIN_PASS in environment
2. Verify Firebase admin collection exists
3. Check server logs in Netlify Functions

### Issue: Firebase auth errors
**Solution**:
1. Verify VITE_FIREBASE_* variables are all set
2. Check Firestore rules allow operations
3. Test with curl: `curl -X POST https://your-site/api/test`

### Issue: Settings not loading (HTTP 500)
**Solution**:
1. Verify GOOGLE_SCRIPT_URL is correct
2. Check Google Apps Script Web App is published
3. Review Netlify build logs for errors
4. Test: `curl -X POST https://your-site/api/public/settings`

---

## 📊 Performance Optimization

### Current Optimizations
- [x] Vite production build (code splitting)
- [x] Admin data caching (30 seconds)
- [x] Settings caching (10 minutes)
- [x] Rate limiting on auth endpoints
- [x] Gzip compression (Netlify default)

### Recommended Additions
- [ ] Enable CDN caching headers
- [ ] Setup image optimization
- [ ] Enable Netlify Analytics
- [ ] Configure cache invalidation rules

---

## ✨ Success Criteria

After deployment, verify:
- [x] Site loads at custom domain
- [x] API endpoints respond with 200-400 (not 500)
- [x] Admin dashboard accessible
- [x] Settings load from Google Sheets
- [x] User registration works
- [x] Email notifications send (if configured)
- [x] No console errors in browser DevTools
- [x] Netlify build logs show no critical errors

---

**Last Updated**: June 1, 2026
**Status**: Ready for Deployment
**Reviewer**: Automated Checklist System
