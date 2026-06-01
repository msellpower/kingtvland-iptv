# ADMIN_AUTH_GUIDE

## מבוא

מדריך זה מסביר את מנגנון האימות של מערכת KINGTVLAND, עם דגש על כניסה למנהלים ותצורת `admin` בסביבת הפיתוח ובפרודקשן.

## מצבי אימות

### 1. Local development
במחשב מקומי אפשר להשתמש ב-`ADMIN_DEV_TOKEN` ו-`ADMIN_PASS`.

```env
ADMIN_PASS=2202
ADMIN_DEV_TOKEN=kingtvland-local-admin-token
NETLIFY=false
```

### 2. Production
בפרודקשן יש להפעיל אימות Firebase ולקבוע משתמשים בעלי `custom claim` של `isAdmin`.

## קונפיגורציה בשרת

השרת בודק את `Authorization` header ונדרש טוקן תקין.
אם `NETLIFY=false` ובקשת dev, השרת יכול לקבל את `ADMIN_DEV_TOKEN`.

## התחברות מנהל

### כניסה ל-admin panel
1. גש ל-`/admin`
2. הזן סיסמה או השתמש ב-Token לפי המצב.
3. לאחר אימות תקבל גישה ל-Admin Dashboard.

### קריאת API
לגישה לנתונים מנהלים יש לשלוח בקשת POST ל-`/api/admin/data` עם כותרת:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## יצירת משתמשים מנהלים ב-Firebase

### דרך Firebase Console
1. עבור ל-`Authentication > Users`
2. צור משתמש חדש עם אימייל וסיסמה
3. קבל את ה-UID שלו
4. צור מסמך ב-Firestore תחת `admins/{uid}` עם שדות:
   - `role: "admin"`
   - `createdAt: serverTimestamp()`

### מתן Custom Claim
ניתן להגדיר custom claim עם Firebase CLI:

```bash
firebase auth:custom-claims:set <UID> '{"isAdmin": true}'
```

## ניהול סשן בצד לקוח

לאחר כניסה, שמור את הטוקן ב-`localStorage` או ב-Cookie מאובטח.
שים לב לא לשמור נתונים רגישים זמניים במקרה של פרודקשן.

## משתני סביבה רלוונטיים

```env
ADMIN_PASS=<Strong admin password>
ADMIN_DEV_TOKEN=<Local dev token>
NETLIFY=true
NODE_ENV=production
```

## טיפים לאבטחה
- שנה את `ADMIN_PASS` לערך חזק בפרודקשן
- אל תשמור את `ADMIN_DEV_TOKEN` ב-Git
- ודא ש-Firebase Authentication מאופשר רק ב-production

INSECURE_ADMIN_MODE=true
```

### For Netlify Production

In Netlify Dashboard > Site settings > Environment:

```env
# IMPORTANT: Change these!
ADMIN_PASS=YourStrongPassword123!@#
ADMIN_DEV_TOKEN=GeneratedRandomToken_xyzabc123...

# Keep original
NETLIFY=true
NODE_ENV=production

# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... all other VITE vars

# Google Apps Script
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec

# Site Config
DOMAIN_NAME=your-domain.netlify.app
ALLOWED_ORIGIN=https://your-domain.netlify.app
```

---

## ⚡ Quick Start - Set Admin User

### Step 1: Get Your UID
```bash
# Firebase CLI
firebase auth:export users.csv --format=csv
# Find your UID in the exported file
```

### Step 2: Set Admin Role
```bash
# Option A: Via Firebase CLI
firebase auth:set:custom-claims YOUR_UID --admin true

# Option B: Via Firestore directly
# Create: /admins/YOUR_UID
# Content: { role: "admin", createdAt: timestamp() }
```

### Step 3: Test Admin Access
```bash
# Navigate to: https://your-site.netlify.app/admin
# Enter: ADMIN_PASS
# Expected: Admin dashboard loads
```

---

## 🧪 Testing Admin Features

### Test Checklist

```
❏ Admin Login with correct password
❏ Admin Login with wrong password (should fail)
❏ Access admin data endpoint
❏ Update public settings
❏ View user list
❏ View usage statistics
❏ Access logs and history
❏ Session timeout after 1 hour
❏ Logout clears session
```

### curl Testing

```bash
# Test admin login
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"password":"2202"}'

# Expected response:
# {"result":"success","token":"xxxxx"}

# Use token to access admin data
curl -X POST http://localhost:3000/api/admin/data \
  -H "Authorization: Bearer xxxxx" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected response:
# {"result":"success","data":{...}}
```

---

## 🔍 Troubleshooting

### Issue: "Invalid Token" on Admin Login

**Causes**:
- [ ] Wrong ADMIN_PASS in environment
- [ ] DEV_ADMIN_TOKEN doesn't match
- [ ] Not in dev mode (NETLIFY != true)

**Fix**:
```bash
# Check environment
echo $ADMIN_PASS
echo $ADMIN_DEV_TOKEN
echo $NETLIFY

# Restart server
npm run dev
```

### Issue: "Not an Admin" Error

**Causes**:
- [ ] User UID not in admins collection
- [ ] Custom claim not set
- [ ] Firestore rules blocking read

**Fix**:
```
1. Firebase Console > Firestore
2. Create: /admins/{your_uid}
3. Add field: role = "admin"
4. Verify rules allow admin read
```

### Issue: Session Expires Too Fast

**Causes**:
- [ ] Token TTL is short (default: 1 hour)
- [ ] Browser cleared localStorage
- [ ] Tab closed and reopened

**Fix**:
```typescript
// In AdminDashboard.tsx
useEffect(() => {
  const checkSession = () => {
    if (!isSessionValid()) {
      logout(); // Redirect to login
    }
  };
  
  const interval = setInterval(checkSession, 60000); // Check every minute
  return () => clearInterval(interval);
}, []);
```

---

## 📊 Admin Permissions Model

### Current Implementation

```
Admin Levels:
├─ Level 1: Full Access (superadmin)
└─ Level 2: Limited Access (operator)
```

### Future Enhancement

```typescript
interface AdminPermissions {
  readUsers: boolean;
  writeUsers: boolean;
  readSettings: boolean;
  writeSettings: boolean;
  viewLogs: boolean;
  manageAdmins: boolean;
  managePlan: boolean;
}
```

---

## 🔒 Security Best Practices

### ✅ Do's

```
✓ Always use HTTPS in production
✓ Rotate admin passwords regularly
✓ Use strong passwords (min 12 chars)
✓ Enable 2FA if Firebase supports it
✓ Monitor admin access logs
✓ Use rate limiting on auth endpoints
✓ Clear old sessions regularly
```

### ❌ Don'ts

```
✗ Don't hardcode credentials in code
✗ Don't expose tokens in client logs
✗ Don't allow unlimited login attempts
✗ Don't store plaintext passwords
✗ Don't disable HTTPS
✗ Don't share admin credentials via email
```

---

## 📞 Support

For issues with admin authentication:
1. Check `.env` variables
2. Review `server.ts` auth middleware
3. Check Firestore admin collection
4. Review Firebase Console logs
5. Check Netlify Functions logs

---

**Last Updated**: June 1, 2026
**Version**: 1.0
**Status**: Production Ready
