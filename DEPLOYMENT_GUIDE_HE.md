# DEPLOYMENT_GUIDE_HE

## מבוא

מדריך זה מתאר את תהליך הפריסה של מערכת KINGTVLAND ל-Netlify ו-Google Apps Script.
הוא מתייחס למערכת הנוכחית ומרכז את השלבים החשובים בלבד.

## מבנה מערכת לפריסה
- Frontend: React + Vite
- Backend: Express ב-Netlify Functions
- Data: Google Sheets + Firebase
- פריסה: Netlify

## משתני סביבה חיוניים
הגדר ב-Netlify או ב-.env:

`env
GOOGLE_SCRIPT_URL=<Google Apps Script Web App URL>
ADMIN_PASS=<Strong admin password>
ADMIN_DEV_TOKEN=<Local dev token>
NETLIFY=true
NODE_ENV=production

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

GEMINI_API_KEY=...
TELEGRAM_BOT_TOKEN=...
ADMIN_CHAT_ID=...
`

## שלב 1: חיבור ל-Google Apps Script
1. פתח Google Apps Script.
2. הדבק את הקוד מתוך code.txt או מהקוד הקיים.
3. החלף את SPREADSHEET_ID ב-ID של גיליון ה-Google שלך.
4. שמור את הפרויקט.
5. פרוס כ-Web App:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. העתק את ה-Web App URL.
7. עדכן את GOOGLE_SCRIPT_URL בסביבת הפרויקט.

## שלב 2: הכנה ל-Netlify
1. וודא שהקובץ 
etlify.toml כולל את ההגדרות הבאות:

`	oml
[build]
  command =  npm run build
  publish = dist

[functions]
  directory = netlify/functions
  node_bundler = esbuild

[[redirects]]
  from = /api/*
  to = /.netlify/functions/api/:splat
  status = 200

[[redirects]]
  from = /*
  to = /index.html
  status = 200
`

2. ודא ש-
etlify/functions/api.ts קיים.
3. הגדר את NETLIFY=true בסביבת Netlify.

## שלב 3: בנייה ופריסה
1. הפעל בנייה מקומית:
   `ash
   npm run build
   `
2. ודא שיצא תיקיית dist/.
3. העלה את הקוד ל-GitHub.
4. ב-Netlify בחר New site from Git ובחר את הריפו.
5. הגדר את משתני הסביבה.
6. הפרוס את האתר.

## שלב 4: אימות לאחר פריסה
בדוק את הדברים הבאים:
- האתר נטען ללא שגיאות JavaScript
- GET /api/test מחזיר 200
- POST /api/public/settings מחזיר success
- כניסה ל-admin פועלת עם ADMIN_PASS
- הגדרות ה-Google Sheets נטענות כראוי

## שלב 5: Firebase (אופציונלי)
אם אתה משתמש ב-Firebase, ודא כי:
- Authentication פעיל
- Firestore מאופשר
- irebase-applet-config.json תואם להגדרות
- irestore.rules מוגדרים לאבטחה

## טיפים חשובים
- שנה את ADMIN_PASS לפרודקשן
- אל תשמור טוקנים רגישים ב-Git
- ודא ש-ALLOWED_ORIGIN תואם לדומיין
