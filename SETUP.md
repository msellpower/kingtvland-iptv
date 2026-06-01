# SETUP

## דרישות מוקדמות
- Node.js 18 או יותר
- npm 9 או יותר
- Git

## התקנה ראשונית
פתח את שורש הפרויקט והפעל:
```bash
npm install
```

## משתני סביבה
העתק את `.env.example` ל-`.env` ועדכן את הערכים:
```env
GOOGLE_SCRIPT_URL=<Google Apps Script Web App URL>
ADMIN_PASS=<Strong admin password>
ADMIN_DEV_TOKEN=<Local development token>
NETLIFY=false
NODE_ENV=development

# Firebase (אופציונלי, אם משתמשים ב-Firebase)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## הפעלה מקומית
```bash
npm run dev
```

לאחר ההפעלה, היישום יהיה זמין ב-`http://localhost:3000`.

## בנייה והצגה מקומית
```bash
npm run build
npm run preview
```

## בדיקה
```bash
npm run lint
```

## חיבור Google Sheets
המערכת משתמשת ב-Google Sheets כמאגר נתונים.
1. פרוס את קוד ה-App Script כ-Web App עם גישה ל-Anyone.
2. עדכן את `GOOGLE_SCRIPT_URL` בקובץ `.env`.
3. ודא שהפונקציות מתפקדות דרך ה-API.

## Netlify
בעת פריסה ל-Netlify, שנה את `NETLIFY=true` ו-`NODE_ENV=production`.

## הערות כלליות
- הקובץ `firebase-applet-config.json` מכיל את קונפיגורציית Firebase.
- אם אינך משתמש ב-Firebase, המערכת עדיין יכולה לפעול עם Google Sheets בלבד.
