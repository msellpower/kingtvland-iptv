# Email System Setup Guide

## 1. Daily Trigger (Firebase Functions)
To ensure the quotas are reset and monitoring is active, set up a scheduled function:

```javascript
// functions/index.js
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getTodayQuotas } = require("./src/quotaManager");

exports.dailyQuotaReset = onSchedule("0 0 * * *", async (event) => {
  await getTodayQuotas(); // This will initialize today's document
  console.log("Daily quota document initialized");
});
```

## 2. Cloudflare DNS Records
For the domain **YOUR_DOMAIN.COM**, add the following records:

### SPF Record (TXT)
Add or update your SPF record to include all providers:
`v=spf1 include:spf.brevo.com include:_spf.resend.com include:_spf.elasticemail.com ~all`

### DKIM Records (CNAME/TXT)
*   **Brevo:** Add the TXT record provided in your Brevo dashboard (usually `mail._domainkey`).
*   **Resend:** Add the 3 CNAME records provided in your Resend dashboard.
*   **Elastic Email:** Add the TXT record `api._domainkey`.

### DMARC Record (TXT)
Host: `_dmarc`
Value: `v=DMARC1; p=quarantine; rua=mailto:admin@YOUR_DOMAIN.COM`

## 3. Google Sheets Integration
Ensure your App Script is deployed as a Web App with "Anyone" access.
1. Copy the Script URL.
2. Add it to the `GOOGLE_SCRIPT_URL` environment variable in your server environment.
3. The system now uses a secure backend proxy (`/api/sheet/proxy`) to communicate with Google Sheets, hiding your Script URL from the client.

The script should expect a JSON POST with an `action` field and corresponding payload.

## 4. Netlify Deployment Guide
To deploy this full-stack app to Netlify:

### 1. Environment Variables
In Netlify Dashboard (Site settings > Environment variables), add:
*   `GOOGLE_SCRIPT_URL`: Your Google Apps Script Web App URL.
*   `GEMINI_API_KEY`: Your Google Gemini API Key.
*   `DUKHIFAT_API_KEY`: Your Dukhifat API Key.
*   `NETLIFYY`: Set to `true`.
*   `NODE_ENV`: Set to `production`.
*   `FIREBASE_SERVICE_ACCOUNT`: (Optional) Your Firebase Service Account JSON string for backend admin features.

### 2. Build Settings
*   **Build command:** `npm run build`
*   **Publish directory:** `dist`
*   **Functions directory:** `netlify/functions`

### 3. Serverless Backend
The backend is automatically handled by the `netlify/functions/api.ts` file and configured via `netlify.toml`. All requests to `/api/*` are proxied to the serverless Express app.
