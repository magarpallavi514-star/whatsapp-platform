# 🔐 META & WHATSAPP CONFIGURATION STATUS

**Date**: Jan 27, 2026  
**Status**: ✅ PARTIALLY CONFIGURED (needs phone numbers in dashboard)

---

## ✅ WHAT'S CONFIGURED IN .env

### Meta/Facebook Credentials
```
✅ FACEBOOK_APP_ID = 1193384345994095
✅ FACEBOOK_APP_SECRET = e80034de1f0bc9013b3b7c2fbe5f3ec7
✅ META_VERIFY_TOKEN = pixels_webhook_secret_2025
✅ META_APP_SECRET = b74799186bb64571487423a924d1a3ca
✅ META_API_VERSION = v21.0
```

### WhatsApp Credentials
```
✅ WHATSAPP_ACCESS_TOKEN = EAAdxIJSvcn0BQirZCS66aelZBHBRgkCNi8EkBg...
   (Long-lived access token - 60 days valid)
```

### Webhook Configuration
```
✅ Backend URL = https://whatsapp-platform-production-e48b.up.railway.app
✅ Webhook Verify Token = pixels_webhook_secret_2025
✅ Webhook endpoint = /api/webhooks/whatsapp
```

---

## ⚠️ WHAT NEEDS TO BE DONE (Phone Numbers)

### Current Setup Architecture
```
Enromatics Account (Test Account)
  └── Phone Numbers = STORED IN DATABASE (not .env)
      ├── Phone Number ID: ?
      ├── WABA ID: ?
      ├── Access Token: ? (encrypted)
      └── Status: ?
```

### How to Connect Phone Numbers

**Option 1: Dashboard Setup** ✅ RECOMMENDED
1. Go to: `http://localhost:3000/dashboard/settings`
2. Look for "WhatsApp" section
3. Click "Add Phone Number"
4. Fill in:
   - **Phone Number ID** (from Meta Business Account)
   - **WABA ID** (WhatsApp Business Account ID)
   - **Access Token** (long-lived token)
5. Click "Add" to save

**Option 2: MongoDB Direct** (for testing)
```javascript
// Add to PhoneNumber collection
{
  accountId: "eno_2600003",           // Enromatics account ID
  phoneNumberId: "889344924259692",   // From Meta
  wabaId: "1536545574042607",         // From Meta
  accessToken: "EAAdxIJSvcn0BQir...", // Encrypted
  isActive: true,
  createdAt: new Date()
}
```

---

## 🔍 HOW TO VERIFY SETUP

### Step 1: Check Phone Numbers Connected
```bash
# In browser console, at http://localhost:3000/dashboard/settings
# Check if you see any phone numbers listed
```

### Step 2: Test Webhook Verification
```bash
curl -X GET "https://whatsapp-platform-production-e48b.up.railway.app/api/webhooks/whatsapp" \
  -G \
  -d "hub.mode=subscribe" \
  -d "hub.verify_token=pixels_webhook_secret_2025" \
  -d "hub.challenge=test_challenge_string"

# Should return: test_challenge_string
# If success → Webhook is reachable ✅
```

### Step 3: Send Test Message
1. Open WhatsApp with your phone number
2. Send a message to the business number you configured
3. Check backend logs for:
   ```
   🔔🔔🔔 WEBHOOK HIT!
   📥 WEBHOOK RECEIVED
   📨 INCOMING MESSAGES
   ✅ Message saved to database
   ```

---

## 📋 CONFIGURATION CHECKLIST

### Credentials
- [x] FACEBOOK_APP_ID set
- [x] FACEBOOK_APP_SECRET set
- [x] WHATSAPP_ACCESS_TOKEN set
- [x] META_VERIFY_TOKEN set
- [ ] **Phone number(s) connected in dashboard** ← YOU ARE HERE

### Phone Number Setup
- [ ] Phone Number ID from Meta
- [ ] WABA ID from Meta
- [ ] Access Token for the phone number
- [ ] Phone number set as ACTIVE
- [ ] Webhook URL pointing to correct endpoint

### Webhook Verification
- [ ] Webhook endpoint reachable (test curl command)
- [ ] Verify token matches (pixels_webhook_secret_2025)
- [ ] Incoming messages hitting backend
- [ ] Messages saved to database

### Testing
- [ ] Send test message from WhatsApp
- [ ] Message appears in backend logs
- [ ] Message saved to MongoDB
- [ ] Message appears in Live Chat UI in real-time

---

## 🚨 IMPORTANT NOTES

### Token Storage
```javascript
// ⚠️ CRITICAL: Token is encrypted before storing
// Do NOT store raw access tokens in .env for phone numbers
// Always use dashboard to add phone numbers (auto-encrypted)
```

### Multi-Tenant Support
```javascript
// System supports multiple phone numbers per account
// Each phone number has its own:
// - Access Token (encrypted)
// - Webhook handling
// - Message routing
```

### Access Token Expiration
```
Current token: 60-day token (should last until ~March 2026)
When expires: Get new token from Meta Business Account
Update location: Dashboard → Settings → Phone Numbers → Manage
```

---

## 🔗 QUICK LINKS

| Item | Link |
|------|------|
| Meta App Dashboard | https://developers.facebook.com/apps/1193384345994095 |
| WhatsApp Setup | http://localhost:3000/dashboard/settings |
| Backend Logs | Check terminal running `npm run dev` |
| MongoDB | mongodb+srv://pixelsagency... |

---

## ❓ HOW TO GET PHONE NUMBER DETAILS FROM META

### To Get Phone Number ID & WABA ID:

1. **Go to Meta Business Account**
   - https://business.facebook.com/

2. **Find WhatsApp Business Account**
   - Settings → WhatsApp Business Accounts
   - Select your account

3. **Find Phone Numbers**
   - Click on your phone number
   - Copy:
     - **Phone Number ID** (starts with digits like 889344924259692)
     - **WABA ID** (starts with digits like 1536545574042607)

4. **Get Access Token**
   - Go to: https://developers.facebook.com/apps
   - Select app: 1193384345994095
   - Go to: Tools → Access Token Debugger
   - OR: Settings → Tokens → Create Token with `whatsapp_business_messaging` scope

5. **Add to Dashboard**
   - Go to: http://localhost:3000/dashboard/settings
   - Section: "WhatsApp"
   - Click: "Add Phone Number"
   - Paste Phone Number ID, WABA ID, and Token
   - Click: "Add"

---

## 🎯 NEXT STEPS

1. **[URGENT]** Connect at least 1 phone number via dashboard
2. Test webhook by sending a message from WhatsApp
3. Verify message appears in Live Chat
4. Test real-time message delivery
5. Check all metrics are working

---

## 📞 IF SOMETHING IS WRONG

### Webhook not receiving messages?
- ✅ Verify token is correct: `pixels_webhook_secret_2025`
- ✅ Verify backend URL is accessible
- ✅ Verify phone number status is ACTIVE
- ✅ Check backend logs for errors

### Phone number not appearing in dashboard?
- ✅ Refresh page (Ctrl+Shift+R)
- ✅ Check phone number is added to database
- ✅ Check account ID matches

### Access Token expired?
- ✅ Generate new token from Meta
- ✅ Update in dashboard settings
- ✅ Test webhook again

---

**Status**: Ready to connect phone numbers! 🚀  
**Last Updated**: Jan 27, 2026
