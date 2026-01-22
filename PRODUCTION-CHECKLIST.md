# 🚀 REPLYSYS PRODUCTION READINESS CHECKLIST

## 1️⃣ ENVIRONMENT VARIABLES (.env files)

### Backend (.env)
```bash
# Change these for production:
FRONTEND_URL=https://app.replysys.com          # ← Change to your domain
BACKEND_URL=https://api.replysys.com           # ← Change to your domain
PORT=5050                                       # Keep same

# OAuth Callback
GOOGLE_CALLBACK_URL=https://api.replysys.com/api/auth/google/callback

# WhatsApp Webhook
# Already configured - no change needed

# Payment Webhook
CASHFREE_WEBHOOK_URL=https://api.replysys.com/api/payments/webhook/cashfree

# Keep these (already production)
MONGODB_URI=mongodb+srv://...                  # ✅ Already cloud
ZEPTOMAIL_API_TOKEN=...                        # ✅ Already configured
WHATSAPP_ACCESS_TOKEN=...                      # ✅ Already configured
AWS credentials                                 # ✅ Already configured
```

### Frontend (.env.local / .env.production)
```bash
# Create this file: frontend/.env.local
NEXT_PUBLIC_BASE_URL=https://app.replysys.com
```

---

## 2️⃣ BRANDING UPDATES

### Files to Update (Change "Pixels" → "Replysys"):

1. **frontend/app/dashboard/layout.tsx** (Line ~166)
   - Change: "PixelsWhatsApp" → "Replysys"

2. **frontend/app/layout.tsx** (main layout)
   - Change title & branding

3. **frontend/public/** (favicon, logos)
   - Update with Replysys logo

4. **frontend/app/page.tsx** (homepage)
   - Update all branding text

5. **backend/src/services/emailService.js**
   - ✅ Already done (Replysys)

6. **backend/.env**
   - ✅ Already done (support@replysys.com)

---

## 3️⃣ DATABASE & SECURITY

✅ **Already Done:**
- MongoDB cloud (pixelsagency.664wxw1.mongodb.net)
- JWT Secret configured
- Admin user setup
- WhatsApp credentials

⚠️ **TODO:**
- [ ] Change default admin password (currently: Pm@22442232)
- [ ] Enable MongoDB IP whitelist (only your server IPs)
- [ ] Setup database backups
- [ ] Enable encryption at rest

---

## 4️⃣ DEPLOYMENT PLATFORMS

### Option A: Railway (Recommended - Already tested)
```bash
# Deploy Backend:
railway up

# Deploy Frontend:
railway up

# Set environment variables in Railway dashboard
```

### Option B: Vercel (Frontend) + Railway/Render (Backend)
```bash
# Frontend
vercel deploy

# Backend
railway/render deploy
```

---

## 5️⃣ DOMAIN & DNS SETUP

```
app.replysys.com → Frontend (Vercel/Railway)
api.replysys.com → Backend (Railway/Render)

# Update DNS records:
CNAME app.replysys.com → your-frontend.vercel.app
CNAME api.replysys.com → your-backend.railway.app
```

---

## 6️⃣ WHATSAPP WEBHOOK (Production)

After deploying:
```
Go to: https://developers.facebook.com/
1. WhatsApp → Configuration
2. Webhook URL: https://api.replysys.com/api/whatsapp/webhook
3. Verify Token: pixels_webhook_secret_2025
4. Subscribe to: messages, message_template_status_update, message_status
```

---

## 7️⃣ SSL/HTTPS

✅ Automatic with:
- Vercel (auto SSL)
- Railway (auto SSL)
- Render (auto SSL)

---

## 8️⃣ EMAIL CONFIGURATION

✅ **Already Production-Ready:**
- Zepto Mail (Zoho)
- Sender: support@replysys.com
- All templates updated to Replysys

---

## 9️⃣ PAYMENT GATEWAY

✅ **Cashfree (Already Configured):**
- Mode: production
- Webhook: https://api.replysys.com/api/payments/webhook/cashfree

---

## 🔟 SECURITY CHECKLIST

- [ ] Change JWT_SECRET to a strong random string
- [ ] Change NEXTAUTH_SECRET to random string
- [ ] Disable debug logs in production
- [ ] Enable CORS only for your domain
- [ ] Setup rate limiting on API
- [ ] Enable HTTPS/TLS everywhere
- [ ] Setup monitoring/alerting
- [ ] Enable database backups
- [ ] Setup log aggregation (LogRocket, Sentry, etc.)

---

## FILES TO CHANGE

### 🔴 HIGH PRIORITY (Do First):

1. **frontend/app/dashboard/layout.tsx** - Line 166
   ```tsx
   // Change from:
   <span className="font-bold text-white">PixelsWhatsApp</span>
   
   // To:
   <span className="font-bold text-white">Replysys</span>
   ```

2. **backend/.env** - Multiple locations
   ```env
   FRONTEND_URL=https://app.replysys.com
   BACKEND_URL=https://api.replysys.com
   GOOGLE_CALLBACK_URL=https://api.replysys.com/api/auth/google/callback
   CASHFREE_WEBHOOK_URL=https://api.replysys.com/api/payments/webhook/cashfree
   ```

3. **frontend/.env.local** (Create new)
   ```env
   NEXT_PUBLIC_BASE_URL=https://app.replysys.com
   ```

### 🟡 MEDIUM PRIORITY (Do Next):

4. **frontend/app/layout.tsx** - Update title & meta tags
5. **frontend/app/page.tsx** - Homepage branding
6. **frontend/components/** - Any "Pixels" references
7. **backend/src/controllers/authController.js** - Admin email settings

### 🟢 LOW PRIORITY (Final Polish):

8. Update logos in public/
9. Update favicon
10. Setup custom domain email

---

## DEPLOYMENT STEPS

```bash
# 1. Update all .env variables
# 2. Test locally: npm run dev
# 3. Deploy backend: railway up
# 4. Deploy frontend: railway/vercel up
# 5. Test production URLs
# 6. Update WhatsApp webhook in Meta dashboard
# 7. Test live message flow
# 8. Monitor logs for errors
```

---

## TESTING CHECKLIST

- [ ] Login works with production URLs
- [ ] Create client (Enromatics test)
- [ ] Send welcome email
- [ ] Generate payment link
- [ ] Send test WhatsApp message (receives in live chat)
- [ ] Invoice generation & PDF download
- [ ] All sidebar links work
- [ ] Settings page accessible
- [ ] Logout works
- [ ] Error pages render

---

## POST-LAUNCH MONITORING

- [ ] Setup error tracking (Sentry)
- [ ] Setup uptime monitoring
- [ ] Setup performance monitoring
- [ ] Review logs daily
- [ ] Monitor database performance
- [ ] Check email delivery rates
- [ ] Verify WhatsApp webhooks

---

**Status:** 🟢 Ready for 80% production deployment
**Remaining:** 20% - Branding updates & domain setup

Let's do this! 🚀
