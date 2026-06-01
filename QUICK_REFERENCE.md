# 📂 Quick Reference: Important Files & Locations

## 🚀 Deployment & Configuration

| File | Purpose | Edit Before Deploy |
|------|---------|-------------------|
| `.env` | Local development config | ✓ (dev only) |
| `.env.example` | Environment template | Ref only |
| `netlify.toml` | Netlify build config | Reference |
| `.github/workflows/netlify-deploy.yml` | Auto-deploy workflow | Set secrets |
| `NETLIFY_DEPLOYMENT_CHECKLIST.md` | Pre-deploy checklist | Use before launch |
| `DEPLOYMENT_GUIDE_HE.md` | Full setup guide | Follow step-by-step |
| `ADMIN_AUTH_GUIDE.md` | Admin system setup | Reference |

---

## 🔧 Backend Configuration

| File | Purpose | Key Variables |
|------|---------|----------------|
| `server.ts` | Express.js server (1200 lines) | GOOGLE_SCRIPT_URL, ADMIN_PASS |
| `netlify/functions/api.ts` | Netlify Functions handler | Simple wrapper |
| `services/firebase.ts` | Firebase Admin SDK init | Auto-loaded |
| `services/dataService.ts` | Data layer (sheets/firebase) | DB mode toggle |
| `services/sheetService.ts` | Google Sheets integration | API endpoints |

### Critical Endpoints
```
POST /api/public/settings        → Get site settings
POST /api/auth/admin-login       → Admin authentication  
POST /api/admin/data             → Admin dashboard data
POST /api/auth/register          → User registration
POST /api/auth/login             → User login
POST /api/public/subscribe       → Newsletter signup
```

---

## 🎨 Frontend Configuration

| File | Purpose | Edit for Customization |
|------|---------|----------------------|
| `App.tsx` | Main app router | Add routes |
| `components/AdminDashboard.tsx` | Admin interface | Modify layout |
| `index.html` | HTML template | Meta tags, title |
| `vite.config.ts` | Vite build config | Rarely needed |
| `tsconfig.json` | TypeScript config | Module settings |

---

## 🔐 Security & Environment

| File/Setting | What It Does | Who Needs Access |
|---|---|---|
| GOOGLE_SCRIPT_URL | Backend API | Everyone (public) |
| ADMIN_PASS | Admin login password | **Only admins** |
| ADMIN_DEV_TOKEN | Dev-only auth token | **Never in production** |
| VITE_FIREBASE_API_KEY | Firebase public key | Everyone (embedded) |
| Firestore Rules | Database permissions | Admin only |

---

## 📦 Project Structure

```
kingtvland1/
├── 📄 Server & Config
│   ├── server.ts                    (Express backend)
│   ├── vite.config.ts              (Build config)
│   ├── tsconfig.json               (TS config)
│   ├── netlify.toml                ✅ Configured
│   ├── .env                        ✅ Set for local
│   ├── .env.example                (Template)
│   └── package.json                (Dependencies)
│
├── 📁 App Source
│   ├── App.tsx                     (Main router)
│   ├── index.tsx                   (Entry point)
│   ├── index.css                   (Global styles)
│   └── components/
│       ├── AdminDashboard.tsx      🔒 Admin only
│       ├── LoginModal.tsx          (User login)
│       ├── RegisterModal.tsx       (Sign up)
│       └── ...50+ more components
│
├── 📁 Services
│   ├── firebase.ts                 (Firebase SDK init)
│   ├── dataService.ts              (Data layer)
│   ├── sheetService.ts             (Google Sheets API)
│   ├── newsService.ts              (News API)
│   └── m3uService.ts               (M3U playlist)
│
├── 📁 Backend Functions
│   ├── netlify/functions/api.ts    (Netlify entry)
│   ├── functions/src/
│   │   ├── emailRouter.js          (Email handler)
│   │   ├── quotaManager.js         (Usage limits)
│   │   └── providers/
│   │       ├── brevo.js            (Email provider)
│   │       ├── resend.js           (Email provider)
│   │       └── elastic.js          (Email provider)
│
├── 📁 Configuration & Docs
│   ├── firebase-applet-config.json (Firebase config)
│   ├── firebase-blueprint.json     (Firestore schema)
│   ├── firestore.rules             🔒 Security rules
│   ├── NETLIFY_DEPLOYMENT_CHECKLIST.md
│   ├── DEPLOYMENT_GUIDE_HE.md
│   ├── ADMIN_AUTH_GUIDE.md
│   ├── GUIDE.md                    (Full documentation)
│   ├── README.md                   (Project overview)
│   └── SETUP.md                    (Initial setup)
│
├── 📁 Public Assets
│   ├── public/
│   │   ├── index.html              (HTML template)
│   │   ├── manifest.json           (PWA manifest)
│   │   ├── robots.txt              (SEO)
│   │   ├── sitemap.xml             (SEO)
│   │   └── sw.js                   (Service worker)
│
└── 📁 Build Output (after npm run build)
    └── dist/
        ├── index.html
        ├── assets/
        │   ├── index-*.js
        │   └── index-*.css
        ├── _redirects               (Netlify routing)
        └── server.cjs               (Express bundle)
```

---

## 🔑 Required Environment Variables (Summary)

### Local Development (.env)
```env
# ✓ Required
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
ADMIN_PASS=2202
ADMIN_DEV_TOKEN=kingtvland-local-admin-token
NODE_ENV=development
NETLIFY=false

# Firebase (from console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Production (Netlify Environment)
```env
# ✓ Required - CHANGE THESE!
ADMIN_PASS=<strong-password>
ADMIN_DEV_TOKEN=<random-token>
GOOGLE_SCRIPT_URL=<your-script-url>
NETLIFY=true
NODE_ENV=production

# Firebase (same as local)
VITE_FIREBASE_*=...

# Site Config
DOMAIN_NAME=your-domain.netlify.app
ALLOWED_ORIGIN=https://your-domain.netlify.app
SITE_URL=https://your-domain.netlify.app

# Email (choose one)
RESEND_API_KEY=<api-key>
# or
BREVO_API_KEY=<api-key>
# or
ELASTIC_EMAIL_API_KEY=<api-key>
```

---

## 🧪 Testing Commands

```bash
# Development
npm run dev                    # Start dev server

# Build & Test
npm run build                  # Production build
npm run lint                   # Type check
npm run preview               # Preview production build

# Manual API Testing
curl http://localhost:3000/api/test
curl -X POST http://localhost:3000/api/public/settings \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 🚀 Deployment Checklist

Before pushing to Netlify:

```
□ npm run lint passes
□ npm run build succeeds  
□ .env.example updated with new vars
□ ADMIN_PASS changed to strong password
□ ADMIN_DEV_TOKEN randomized
□ GOOGLE_SCRIPT_URL verified
□ All VITE_FIREBASE_* vars correct
□ Firestore rules updated
□ Firebase admin user created
□ GitHub Actions secrets set
□ Netlify environment vars set
□ Custom domain configured (optional)
□ SSL certificate enabled (auto on Netlify)
```

---

## 📞 Who Needs What Access?

### Frontend Developers
- [ ] Read: App.tsx, components/, services/
- [ ] Write: components/, Add new pages
- [ ] Avoid: server.ts, firebase-admin code

### Backend Developers  
- [ ] Read: All
- [ ] Write: server.ts, services/firebase.ts
- [ ] Handle: API routes, authentication

### DevOps / Deployment
- [ ] Read: netlify.toml, DEPLOYMENT_GUIDE_HE.md
- [ ] Write: Netlify environment variables
- [ ] Configure: GitHub Actions secrets

### Admin Users
- [ ] No file access needed
- [ ] Use: Admin Dashboard at /admin
- [ ] Authenticate: With ADMIN_PASS

---

## 🔄 Common Workflows

### Add a New API Endpoint
1. Edit `server.ts` - add route
2. Edit `services/dataService.ts` - add function
3. Call from React component
4. Test with curl
5. Deploy

### Update Admin Dashboard
1. Edit `components/AdminDashboard.tsx`
2. Test locally: `npm run dev`
3. Check: Data loads from `/api/admin/data`
4. Commit & push
5. Auto-deploys via GitHub Actions

### Change Admin Credentials
1. Netlify Dashboard > Environment
2. Update: ADMIN_PASS & ADMIN_DEV_TOKEN
3. Trigger: Manual deploy
4. Verify: Admin login works

### Fix Google Sheets Integration
1. Edit Google Apps Script
2. Deploy Web App (new version)
3. Copy new URL
4. Update: GOOGLE_SCRIPT_URL in Netlify
5. Trigger deploy
6. Test endpoint

---

## 📊 Monitoring & Logs

### Where to Check Errors

| Issue Type | Location | How to View |
|---|---|---|
| Build errors | Netlify Deploys | Dashboard > Deploys |
| Runtime errors | Netlify Functions | Functions tab > Logs |
| API errors | Server console | Netlify Functions logs |
| Client errors | Browser console | DevTools > Console tab |
| Database errors | Firebase | Console > Firestore |

### Key Logs to Monitor
```
✓ Netlify build logs (npm run build output)
✓ Netlify function logs (Express error output)
✓ Browser console (client-side errors)
✓ Firebase Console (auth, Firestore)
✓ Google Apps Script logs (Apps Script dashboard)
```

---

## 🎯 Next Steps

1. **Immediate**: Follow DEPLOYMENT_GUIDE_HE.md
2. **Short-term**: Set up GitHub Actions
3. **Medium-term**: Setup monitoring & alerts
4. **Long-term**: Optimize performance, add features

---

**Generated**: June 1, 2026
**Version**: 1.0
**Status**: ✅ Ready for Production
