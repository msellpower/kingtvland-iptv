# 🔗 Google Sheets Auto-Connection Setup Guide

## סקירה כללית

זה המדריך המלא להגדרה קבועה של חיבור אוטומטי בין KingTVLand ל-Google Sheets לנתונים דינמיים.

---

## 🎯 מטרה המערכת

```
Google Sheets (Data Source)
        ↓
Google Apps Script (Processor)
        ↓
Netlify Functions (Express Backend)
        ↓
React Frontend (Display)
```

---

## 📊 שלב 1: יצירת Google Sheets Document

### 1.1 צור גיליון חדש

1. Navigate: https://sheets.google.com
2. Click: `+ New Spreadsheet`
3. Name: `KingTVLand Data`
4. Share: Right-click > Share > "Anyone with link can edit"

### 1.2 צור Sheets (Tabs)

כל sheet צריך שם ספציפי (בעברית/אנגלית):

```
Sheet 1: Settings (הגדרות)
├─ Column A: Setting Name (e.g., SITE_TITLE)
└─ Column B: Setting Value (e.g., KINGTVLAND)

Sheet 2: Users (משתמשים)
├─ A: Username
├─ B: Email
├─ C: Password (hashed)
├─ D: Plan
├─ E: Created Date

Sheet 3: Plans (תוכניות)
├─ A: Plan ID
├─ B: Plan Name
├─ C: Price
├─ D: Features
└─ E: Duration

Sheet 4: Admins (מנהלים)
├─ A: Admin Name
├─ B: Email
├─ C: Permissions
└─ D: Created Date

Sheet 5: Logs (רישומים)
├─ A: Action
├─ B: User
├─ C: Timestamp
└─ D: Status
```

### 1.3 דוגמת נתונים

**Settings Sheet:**
```
SITE_TITLE              | KINGTVLAND
SITE_DESCRIPTION       | Premium IPTV Service
SUPPORT_EMAIL          | support@kingtvland.com
MAINTENANCE_MODE       | false
MAX_ACTIVE_CONNECTIONS | 5
```

---

## 🔧 שלב 2: יצירת Google Apps Script

### 2.1 פתח Apps Script Editor

1. Navigate: https://script.google.com
2. Click: `+ New project`
3. Name: `KingTVLand API Server`

### 2.2 כתוב Functions

```javascript
// ==========================================
// 1. GET PUBLIC SETTINGS
// ==========================================
function get_public_settings() {
  try {
    const ss = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
    const sheet = ss.getSheetByName('Settings');
    
    if (!sheet) {
      return { result: 'error', error: 'Settings sheet not found' };
    }
    
    const range = sheet.getRange('A1:B100');
    const values = range.getValues();
    
    const settings = {};
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] && values[i][0].toString().trim()) {
        settings[values[i][0].toString().trim()] = values[i][1];
      }
    }
    
    return { result: 'success', settings: settings };
  } catch (error) {
    Logger.log('Error in get_public_settings: ' + error);
    return { result: 'error', error: error.toString() };
  }
}

// ==========================================
// 2. GET ADMIN DATA
// ==========================================
function get_admin_data(data) {
  try {
    const ss = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
    
    // Get Users
    const usersSheet = ss.getSheetByName('Users');
    const usersData = usersSheet.getDataRange().getValues();
    
    // Get Plans
    const plansSheet = ss.getSheetByName('Plans');
    const plansData = plansSheet.getDataRange().getValues();
    
    // Get Logs
    const logsSheet = ss.getSheetByName('Logs');
    const logsData = logsSheet.getDataRange().getValues();
    
    const stats = {
      totalUsers: usersData.length - 1, // Exclude header
      totalPlans: plansData.length - 1,
      recentLogs: logsData.slice(-10) // Last 10 logs
    };
    
    return {
      result: 'success',
      users: usersData,
      plans: plansData,
      logs: logsData,
      stats: stats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    Logger.log('Error in get_admin_data: ' + error);
    return { result: 'error', error: error.toString() };
  }
}

// ==========================================
// 3. REGISTER USER
// ==========================================
function register_user(data) {
  try {
    const ss = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
    const sheet = ss.getSheetByName('Users');
    
    // Check if user exists
    const existingValues = sheet.getRange('A2:A').getValues();
    for (let i = 0; i < existingValues.length; i++) {
      if (existingValues[i][0] === data.username) {
        return { result: 'error', error: 'User already exists' };
      }
    }
    
    // Add new row
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, 5).setValues([[
      data.username,
      data.email,
      data.password, // Note: Should be hashed!
      'free', // Default plan
      new Date().toISOString()
    ]]);
    
    return {
      result: 'success',
      message: 'User registered successfully',
      username: data.username
    };
  } catch (error) {
    return { result: 'error', error: error.toString() };
  }
}

// ==========================================
// 4. UPDATE SITE SETTINGS
// ==========================================
function update_site_settings(data) {
  try {
    const ss = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
    const sheet = ss.getSheetByName('Settings');
    
    const settings = data.settings || {};
    const range = sheet.getRange('A1:B100');
    const values = range.getValues();
    
    // Update existing or add new
    let updated = false;
    for (let i = 0; i < values.length; i++) {
      const settingName = values[i][0].toString().trim();
      
      if (settingName in settings) {
        values[i][1] = settings[settingName];
        updated = true;
        delete settings[settingName]; // Remove from pending
      }
    }
    
    // Add new settings
    for (const [key, value] of Object.entries(settings)) {
      const emptyRow = values.findIndex(row => !row[0] || !row[0].toString().trim());
      if (emptyRow !== -1) {
        values[emptyRow][0] = key;
        values[emptyRow][1] = value;
      }
    }
    
    range.setValues(values);
    
    return { result: 'success', message: 'Settings updated' };
  } catch (error) {
    return { result: 'error', error: error.toString() };
  }
}

// ==========================================
// 5. LOG ACTION
// ==========================================
function log_action(data) {
  try {
    const ss = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
    const sheet = ss.getSheetByName('Logs');
    
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, 4).setValues([[
      data.action,
      data.user || 'anonymous',
      new Date().toISOString(),
      data.status || 'success'
    ]]);
    
    return { result: 'success' };
  } catch (error) {
    return { result: 'error', error: error.toString() };
  }
}

// ==========================================
// MAIN HANDLER (for Web App)
// ==========================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    Logger.log('Action: ' + action);
    
    let result;
    
    switch(action) {
      case 'get_public_settings':
        result = get_public_settings();
        break;
      case 'get_admin_data':
        result = get_admin_data(data);
        break;
      case 'register_user':
        result = register_user(data);
        break;
      case 'update_site_settings':
        result = update_site_settings(data);
        break;
      case 'log_action':
        result = log_action(data);
        break;
      default:
        result = { result: 'error', error: 'Unknown action: ' + action };
    }
    
    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error);
    return ContentService.createTextOutput(
      JSON.stringify({ result: 'error', error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 2.3 Deploy Web App

1. Click: **Deploy** > **New deployment**
2. Type: `Web app`
3. Execute as: (Your Google Account)
4. Who has access: **Anyone**
5. Click: **Deploy**

### 2.4 Get Web App URL

```
Web app deployed at:
https://script.google.com/macros/s/{SCRIPT_ID}/exec
↓
Copy this URL to GOOGLE_SCRIPT_URL environment variable
```

---

## 🔐 שלב 3: הגדרת Permissions

### 3.1 Share Spreadsheet

```
1. Right-click sheet
2. Share > Anyone with link can edit
3. Get share link
4. Keep it safe!
```

### 3.2 Apps Script Permissions

1. Click: **Authorization**
2. Google account: Select your account
3. Permissions: Allow access to Google Sheets

---

## 💻 שלב 4: הגדרת Backend (server.ts)

### 4.1 Update GOOGLE_SCRIPT_URL

```typescript
// In server.ts
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL 
  // Example:
  // https://script.google.com/macros/s/AKfycbz.../exec
```

### 4.2 Verify Endpoints

```bash
# Test public settings
curl -X POST http://localhost:3000/api/public/settings \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected response:
# {"result":"success","settings":{"SITE_TITLE":"KINGTVLAND",...}}
```

---

## 📱 שלב 5: Frontend Integration (React)

### 5.1 getPublicSettings Hook

```typescript
// In services/sheetService.ts
export const getPublicSettings = async (): Promise<SystemSettings | null> => {
  // Check cache first
  if (settingsCache && (Date.now() - settingsCache.timestamp < CACHE_TTL)) {
    return settingsCache.data;
  }

  try {
    const response = await fetch('/api/public/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    
    if (result.result === 'success') {
      const cacheData = { data: result.settings, timestamp: Date.now() };
      settingsCache = cacheData;
      localStorage.setItem('public_settings_cache', JSON.stringify(cacheData));
      return result.settings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};
```

### 5.2 Use in Components

```typescript
// In App.tsx or any component
useEffect(() => {
  const loadSettings = async () => {
    const settings = await getPublicSettings();
    if (settings) {
      // Use settings
      document.title = settings.SITE_TITLE;
    }
  };
  loadSettings();
}, []);
```

---

## ⚙️ שלב 6: Automated Sync (Optional)

### 6.1 Set Up Time-Based Trigger

בתא Google Apps Script:
```
1. Click: Triggers (left sidebar)
2. Add Trigger:
   - Function: none (for logging)
   - Event: Time-driven
   - Type: Hours
   - Interval: Every hour
3. This keeps logs clean
```

### 6.2 Clear Old Logs

```javascript
function clearOldLogs() {
  const ss = SpreadsheetApp.openByUrl('YOUR_SHEET_URL');
  const sheet = ss.getSheetByName('Logs');
  
  const data = sheet.getDataRange().getValues();
  const maxRows = 1000; // Keep last 1000 logs
  
  if (data.length > maxRows) {
    const toDelete = data.length - maxRows;
    sheet.deleteRows(2, toDelete); // Delete from row 2 (skip header)
  }
}
```

---

## 🧪 שלב 7: Testing

### 7.1 Test with curl

```bash
# Get settings
curl -X POST http://localhost:3000/api/public/settings \
  -H "Content-Type: application/json" \
  -d '{}'

# Get admin data
curl -X POST http://localhost:3000/api/admin/data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"pass123"}'
```

### 7.2 Verify in Google Sheets

```
1. Open Google Sheets document
2. Check: Settings tab updated
3. Check: Users tab has new rows
4. Check: Logs tab has entries
```

---

## 🔄 Maintenance & Updates

### Weekly Tasks
- [ ] Check Logs sheet (clear old entries)
- [ ] Verify settings are current
- [ ] Monitor user registrations

### Monthly Tasks
- [ ] Archive old logs
- [ ] Review data integrity
- [ ] Update plans/features
- [ ] Check Apps Script logs

### Annual Tasks
- [ ] Backup entire spreadsheet
- [ ] Review Google Apps Script code
- [ ] Update security rules
- [ ] Archive historical data

---

## 🚨 Troubleshooting

### Issue: "Settings not loading"
```
Solution:
1. Check: GOOGLE_SCRIPT_URL in .env
2. Verify: Web App is published
3. Test: curl to Google Apps Script directly
4. Check: Firestore or Sheets contains data
```

### Issue: "User registration fails"
```
Solution:
1. Verify: Google Sheets is accessible
2. Check: Users sheet exists
3. Verify: Columns A-E are in place
4. Check: Google Apps Script has register_user function
```

### Issue: "Slow data loading"
```
Solution:
1. Implement caching (10 min for settings)
2. Use pagination for large datasets
3. Optimize Google Sheets queries
4. Consider moving to Firestore for frequently updated data
```

---

## 📊 Data Flow Diagram

```
User Action (Frontend)
        ↓
React Component
        ↓
fetch() to /api/endpoint
        ↓
Express Server (server.ts)
        ↓
fetchFromGoogleScript()
        ↓
Google Apps Script Web App
        ↓
Google Sheets API
        ↓
Data in Spreadsheet
        ↓
Back to Frontend (JSON)
        ↓
Display to User
```

---

## ✅ Verification Checklist

- [ ] Google Sheet created and shared
- [ ] Tabs created with correct names
- [ ] Sample data added
- [ ] Google Apps Script deployed
- [ ] Web App URL copied
- [ ] GOOGLE_SCRIPT_URL configured
- [ ] Backend endpoints working
- [ ] React components using settings
- [ ] Caching implemented
- [ ] Error handling in place
- [ ] Logs appear in Logs sheet

---

## 📞 Resources

- Google Sheets API: https://developers.google.com/sheets
- Apps Script Docs: https://developers.google.com/apps-script
- JSON.stringify: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify

---

**Status**: ✅ Complete Setup Instructions  
**Last Updated**: June 1, 2026  
**Version**: 1.0
