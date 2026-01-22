# 🚀 REPLYSYS PRODUCTION DEPLOYMENT GUIDE

## ⚡ QUICK START - High Priority Changes Made ✅

### What's Done:
✅ Frontend branding changed to "Replysys"  
✅ Backend URLs updated to production domains  
✅ Email already configured (support@replysys.com)  
✅ WhatsApp credentials in place  
✅ Cashfree payment gateway setup  

### What You Need To Do:

---

## 1️⃣ SET YOUR DOMAIN NAMES

**IMPORTANT:** Choose your domains and update everywhere:

```
Example:
- Frontend: app.replysys.com
- Backend/API: api.replysys.com
- Webhook: api.replysys.com/api/whatsapp/webhook
```

**Update in:**
1. `backend/.env` - Already done! ✅
2. `frontend/.env.local` (create new file)
3. WhatsApp Meta Dashboard
4. DNS records

---

## 2️⃣ CREATE FRONTEND ENV FILE

Create: `frontend/.env.local`

```bash
NEXT_PUBLIC_BASE_URL=https://app.replysys.com
```

---

## 3️⃣ DEPLOYMENT OPTIONS

### Option A: Railway (Recommended - All in One)

**Deploy Backend:**
```bash
cd backend
railway up
# Note: Copy the assigned Railway URL (e.g., replysys-api.railway.app)
```

**Deploy Frontend:**
```bash
cd frontend
railway up
# Note: Copy the assigned Railway URL (e.g., replysys-app.railway.app)
```

**Then setup custom domains:**
- Go to Railway Dashboard
- Project → Settings → Custom Domain
- Add: `app.replysys.com` (frontend)
- Add: `api.replysys.com` (backend)

### Option B: Vercel (Frontend) + Railway (Backend)

**Frontend:**
```bash
cd frontend
vercel deploy
```

**Backend:**
```bash
cd backend
railway up
```

---

## 4️⃣ CONFIGURE DNS

After getting your URLs from Railway/Vercel:

```
Add to your DNS (GoDaddy, Cloudflare, etc):

CNAME  app.replysys.com  →  your-railway-frontend-url.railway.app
CNAME  api.replysys.com  →  your-railway-backend-url.railway.app
```

---

## 5️⃣ CONFIGURE WHATSAPP WEBHOOK

Once backend is deployed:

1. Go to: https://developers.facebook.com/
2. Select your app → WhatsApp → Configuration
3. Set **Webhook URL**:
   ```
   https://api.replysys.com/api/whatsapp/webhook
   ```
4. Set **Verify Token**:
   ```
   pixels_webhook_secret_2025
   ```
5. Click **Subscribe to this field** for:
   - ✅ messages
   - ✅ message_template_status_update
   - ✅ message_status

6. Test by sending a message to +918087131777

---

## 6️⃣ ENVIRONMENT VARIABLES CHECKLIST

### Backend (.env) - UPDATE THESE:

```env
# Domain Settings (UPDATE THESE)
FRONTEND_URL=https://app.replysys.com
BACKEND_URL=https://api.replysys.com
GOOGLE_CALLBACK_URL=https://api.replysys.com/api/auth/google/callback
CASHFREE_WEBHOOK_URL=https://api.replysys.com/api/payments/webhook/cashfree

# Already Production-Ready (DON'T CHANGE):
MONGODB_URI=mongodb+srv://...  ✅
ZEPTOMAIL_API_TOKEN=...        ✅
WHATSAPP_ACCESS_TOKEN=...      ✅
AWS_ACCESS_KEY_ID=...          ✅
AWS_SECRET_ACCESS_KEY=...      ✅
CASHFREE_CLIENT_ID=...         ✅
CASHFREE_CLIENT_SECRET=...     ✅
```

### Frontend (.env.local) - CREATE THIS:

```env
NEXT_PUBLIC_BASE_URL=https://app.replysys.com
```

---

## 7️⃣ TEST CHECKLIST

After deployment, test everything:

- [ ] Go to https://app.replysys.com
- [ ] Login works
- [ ] Create new client (test)
- [ ] Send welcome email
- [ ] Check client can login
- [ ] Generate payment link
- [ ] View dashboard
- [ ] Test all sidebar links
- [ ] Send test WhatsApp message → appears in live chat
- [ ] Invoices work
- [ ] Settings accessible
- [ ] Logout works

---

## 8️⃣ SECURITY HARDENING (After Launch)

```bash
# 1. Change these sensitive values:
JWT_SECRET=<generate-random-32-char-string>
NEXTAUTH_SECRET=<generate-random-32-char-string>

# 2. Rotate passwords:
- Change admin password (currently: Pm@22442232)
- Change database password if possible

# 3. Enable security features:
- MongoDB IP whitelist (only your server)
- HTTPS everywhere (auto with Railway/Vercel)
- CORS whitelist (only your domain)
- Rate limiting on APIs
```

---

## 9️⃣ MONITORING & LOGGING

Setup error tracking:

```bash
# Option 1: Sentry (Recommended)
npm install @sentry/nextjs

# Option 2: LogRocket
npm install logrocket

# Option 3: CloudFlare Analytics
# Free with Cloudflare
```

---

## 🔟 PRODUCTION CHECKLIST - Final

- [ ] Custom domains setup (app.replysys.com, api.replysys.com)
- [ ] DNS records updated
- [ ] Backend deployed & running
- [ ] Frontend deployed & running
- [ ] WhatsApp webhook configured
- [ ] All environment variables updated
- [ ] Email notifications working
- [ ] Payment gateway live
- [ ] Database backups enabled
- [ ] SSL/HTTPS everywhere (auto)
- [ ] Error tracking setup (Sentry)
- [ ] All tests passed
- [ ] Admin tested login
- [ ] Client tested login
- [ ] Live chat webhook works
- [ ] Logo/branding updated

---

## 📊 DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────┐
│         https://app.replysys.com             │
│            (Frontend - Vercel/Railway)        │
│          Next.js - React Dashboard           │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│         https://api.replysys.com             │
│            (Backend - Railway/Render)        │
│            Express.js - API Server           │
│                                              │
│  ├─ /api/auth          (Authentication)     │
│  ├─ /api/users         (User Management)    │
│  ├─ /api/messages      (WhatsApp Msgs)      │
│  ├─ /api/whatsapp      (Webhook Receiver)   │
│  ├─ /api/payments      (Cashfree)           │
│  └─ /api/admin         (Admin Operations)   │
└────────────────┬────────────────────────────┘
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
    ┌───────┐ ┌──────┐ ┌──────────┐
    │MongoDB│ │WhatsApp│ │Cashfree │
    │ Cloud │ │  API   │ │ Payment  │
    └───────┘ └────────┘ └──────────┘
```

---

## ⚠️ COMMON ISSUES & FIXES

### WhatsApp Messages Not Coming In
```
→ Check webhook URL is configured correctly
→ Check verify token matches (pixels_webhook_secret_2025)
→ Check "messages" is subscribed
→ Test via curl:
  curl -X POST https://api.replysys.com/api/whatsapp/webhook \
    -d '{"message":"test"}' \
    -H "Content-Type: application/json"
```

### Email Not Sending
```
→ Check ZEPTOMAIL_API_TOKEN in .env
→ Verify EMAIL_FROM is verified in Zepto
→ Check logs: console shows email attempt
→ Test: Create new client, check inbox
```

### Login Not Working
```
→ Check JWT_SECRET is set
→ Verify MONGODB_URI is correct
→ Check user exists in database
→ Verify password is correct
```

### Payment Webhook Not Firing
```
→ Check CASHFREE_WEBHOOK_URL points to correct domain
→ Verify webhook is subscribed in Cashfree dashboard
→ Test with: https://api.replysys.com/health
```

---

## 🎯 NEXT STEPS

1. Choose your domain names
2. Update DNS records
3. Deploy backend to Railway
4. Deploy frontend to Railway/Vercel
5. Add custom domains
6. Configure WhatsApp webhook
7. Test everything
8. Monitor logs
9. Celebrate! 🎉

---

**Need Help?**
- Check logs: Railway Dashboard → Logs
- Test API: `https://api.replysys.com/health`
- Test Frontend: `https://app.replysys.com`

---

**Version:** 1.0  
**Last Updated:** 22 Jan 2026  
**Status:** Ready for Production 🚀
