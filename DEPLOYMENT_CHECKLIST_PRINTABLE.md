# ✓ Netlify Deployment Quick Checklist

**Project**: KingTVLand  
**Date**: June 1, 2026  
**Print this page!**

---

## Before You Start

- [ ] Google Apps Script URL ready (copy-paste ready)
- [ ] Strong admin password prepared
- [ ] Random admin token generated
- [ ] Firebase project credentials copied

---

## Part 1: Local Testing (15 min)

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Build size looks reasonable
- [ ] `npm run dev` starts server
- [ ] http://localhost:3000 loads

---

## Part 2: Netlify Setup (30 min)

- [ ] Login to Netlify
- [ ] New site from Git
- [ ] Select kingtvland repo
- [ ] Build command: `npm run build`
- [ ] Publish: `dist`
- [ ] Functions: `netlify/functions`
- [ ] Click Deploy

---

## Part 3: Environment Variables (15 min)

Add to Netlify Site Settings > Environment:

### Required
- [ ] GOOGLE_SCRIPT_URL = `https://script...`
- [ ] ADMIN_PASS = `YourStrongPassword...`
- [ ] ADMIN_DEV_TOKEN = `random_token_here`
- [ ] NETLIFY = `true`
- [ ] NODE_ENV = `production`

### Firebase (copy from Firebase Console)
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID

### Site Config
- [ ] DOMAIN_NAME = `your-site.netlify.app`
- [ ] ALLOWED_ORIGIN = `https://your-site.netlify.app`
- [ ] SITE_URL = `https://your-site.netlify.app`

---

## Part 4: Firebase Setup (30 min)

- [ ] Firebase Console open
- [ ] Firestore enabled
- [ ] Authentication enabled
- [ ] Create admins collection
- [ ] Add your user as admin
- [ ] Firestore rules deployed

---

## Part 5: Google Apps Script (30 min)

- [ ] Apps Script exists
- [ ] Functions implemented:
  - [ ] get_public_settings
  - [ ] get_admin_data
  - [ ] register_user
- [ ] Web App deployed
- [ ] URL copied
- [ ] "Anyone can access" enabled

---

## Part 6: Trigger Netlify Deploy (5 min)

Option A: Manual
- [ ] Netlify Dashboard > Deploys
- [ ] Trigger deploy button
- [ ] Wait for build (3-5 min)

Option B: Git Push
- [ ] `git push origin main`
- [ ] GitHub Actions runs
- [ ] Netlify builds automatically

---

## Part 7: Post-Deployment Testing (15 min)

### Browser Tests
- [ ] Site loads in browser
- [ ] No JavaScript errors (DevTools)
- [ ] Responsive on mobile
- [ ] Admin page accessible

### API Tests (curl)
```
curl https://your-site.netlify.app/api/test
```
- [ ] Returns 200

```
curl -X POST https://your-site.netlify.app/api/public/settings \
  -H "Content-Type: application/json" \
  -d '{}'
```
- [ ] Returns settings

### Admin Test
- [ ] Navigate to /admin
- [ ] Enter ADMIN_PASS
- [ ] Dashboard loads
- [ ] Data appears

---

## Troubleshooting (if needed)

### If build fails:
- [ ] Check Netlify build logs
- [ ] Verify all env vars are set
- [ ] Run `npm run build` locally
- [ ] Check: Node version >= 18

### If API returns 500:
- [ ] Check GOOGLE_SCRIPT_URL
- [ ] Verify Apps Script is published
- [ ] Test Google Apps Script directly
- [ ] Check Netlify function logs

### If admin login fails:
- [ ] Verify ADMIN_PASS in Netlify
- [ ] Check Firebase admin user exists
- [ ] Verify admins collection in Firestore

---

## Success Indicators ✓

- [x] Site accessible at https://your-site.netlify.app
- [x] No JavaScript errors
- [x] API endpoints respond
- [x] Admin panel works
- [x] Settings load from Google Sheets
- [x] User can register

---

## Important Reminders

🔐 **SECURITY**
- Change ADMIN_PASS immediately
- Don't share credentials
- Use HTTPS only
- Enable Firestore security rules

⚡ **PERFORMANCE**
- Check build size
- Monitor function execution time
- Enable caching headers
- Consider image optimization

📊 **MONITORING**
- Check Netlify analytics
- Review error logs weekly
- Monitor uptime
- Track performance metrics

---

## Support

Having issues?
1. Check: DEPLOYMENT_GUIDE_HE.md Chapter 9
2. Check: QUICK_REFERENCE.md
3. Check: Netlify build logs
4. Google: `netlify [error message]`

---

## Contact Info

Project Owner: [Your Name]  
GitHub Repo: [Your Repo URL]  
Netlify Site: https://your-site.netlify.app  
Status: 🟢 **LIVE**

---

## Sign Off

- [ ] Tested all endpoints
- [ ] Admin access works
- [ ] Google Sheets connected
- [ ] Ready to announce launch

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________  

---

✅ **ALL DONE! Welcome to production!**
