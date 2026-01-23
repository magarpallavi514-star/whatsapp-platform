# Connection Test Failed - Troubleshooting Guide

## 🔴 Problem
When testing phone number connection in Settings, getting:
```
Connection test failed: Failed to test connection to WhatsApp API
```

This appears **intermittently** or **repeatedly** and is caused by several possible issues.

---

## ✅ Fixes Applied

### 1. **Enhanced Error Diagnostics** (settingsController.js)
Now returns **specific error messages** instead of generic "Failed to test":

```javascript
// BEFORE: Generic error
res.json({ message: 'Failed to test connection to WhatsApp API' });

// AFTER: Specific errors
{
  "success": false,
  "message": "Access token is invalid or expired",  // Specific
  "error": "CONNECTION_TEST_FAILED",
  "details": {
    "errorMessage": "Invalid OAuth token",           // What Meta said
    "suggestion": "Reconnect your WhatsApp...",     // How to fix
    "action": "Please verify your configuration..."
  }
}
```

### 2. **Token Validation** (settingsController.js)
Added checks for:
- ✅ Token exists (not NULL)
- ✅ Token is decrypted (not still encrypted hex)
- ✅ Token format is valid (looks like a real access token)

### 3. **Better Logging** (settingsController.js + whatsappService.js)
Now logs:
- ✅ Phone number found/not found
- ✅ Token exists and length
- ✅ Meta API call details
- ✅ Error code and message
- ✅ Suggested action

### 4. **Network Error Handling** (settingsController.js)
Detects and handles:
- ✅ Connection timeout (backend can't reach Meta)
- ✅ Invalid token (expired or wrong)
- ✅ Network errors (firewall/DNS issues)
- ✅ Token encryption/decryption failures

---

## 🧪 How to Test

### Step 1: Check Backend Logs
When you click "Test Connection" in Settings, watch the backend console:

```bash
cd backend && npm run dev
# Then click "Test Connection" in frontend
```

**Expected logs:**
```
🧪 Testing phone number: { id: '...', accountId: '...' }
✅ Found phone number: { phoneNumberId: '889344...', isActive: true, hasToken: true }
🚀 Calling Meta API: https://graph.facebook.com/v21.0/889344...
✅ Meta API response: { display_phone_number: '+1234567890', quality_rating: 'GREEN' }
✅ Phone number test successful, config updated
```

**If seeing errors:**
```
❌ Phone number not found in DB
❌ Phone number is not active
❌ Access token is missing
❌ Token appears corrupted or still encrypted
❌ Test phone number error: { message: '...', code: '...', metaError: '...' }
```

---

### Step 2: Check Frontend Console
Open browser DevTools → Console

**Should see request:**
```
POST /api/settings/phone-numbers/{id}/test
Status: 200 (success) or 400/500 (error)
```

**Response should include:**
```json
{
  "success": true/false,
  "message": "...",
  "details": {
    "errorMessage": "...",
    "suggestion": "..."
  }
}
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Access token is invalid or expired"

**Cause:**
- Token expired on Meta side
- Wrong token pasted
- Token from different WABA

**Fix:**
1. Go to **Settings > Phone Numbers**
2. Find the phone number
3. Click **Remove**
4. Click **Add Phone Number**
5. Get fresh token from Meta Business Suite
6. Paste token and save
7. Click **Test Connection**

---

### Issue 2: "Cannot reach Meta API - network error"

**Cause:**
- Backend cannot connect to `graph.facebook.com`
- Firewall blocking outbound connections
- DNS resolution failing

**Fix (Development):**
```bash
# Test if backend can reach Meta
curl https://graph.facebook.com/v21.0/me

# Should respond with: {"error":{"message":"An access token is required..."}}
# (This is expected - proves backend can reach Meta)
```

**Fix (Production):**
- Check Railway/Heroku network settings
- Ensure outbound HTTPS is allowed
- Check if ISP blocks Meta API

---

### Issue 3: "Connection timeout - backend cannot reach Meta API"

**Cause:**
- Meta API is slow or overloaded
- Network latency is high

**Fix:**
- **Wait a few seconds** and try again
- **Check Meta status page:** https://status.meta.com
- If Meta is down, wait for recovery

---

### Issue 4: "Token encryption/decryption error"

**Cause:**
- JWT_SECRET in .env changed
- Token stored with old secret but new secret in use
- Database corruption

**Fix:**
```bash
# Check JWT_SECRET in .env
echo $JWT_SECRET

# If it changed, you need to:
# 1. Disconnect all phone numbers
# 2. Clear phone numbers table
# 3. Reconnect fresh
```

**Or contact support** - this requires DB cleanup.

---

### Issue 5: "Phone number not found" (but you just added it)

**Cause:**
- Phone number not fully saved to DB
- Account mismatch
- Cache issue

**Fix:**
1. Refresh the page
2. Wait 2-3 seconds
3. Try again
4. If still broken, remove and re-add phone number

---

## 📊 Debug Endpoint

You can manually test the Meta API without going through frontend:

```bash
# 1. Get your phone number ID from database
# 2. Get your access token from Meta

curl -X GET https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID} \
  -H "Authorization: Bearer {YOUR_ACCESS_TOKEN}"

# Expected response:
{
  "verified_name": "Your Business",
  "display_phone_number": "+1234567890",
  "quality_rating": "GREEN",
  "id": "{PHONE_NUMBER_ID}"
}
```

**If this works:**
- Token is valid ✅
- Meta knows about your phone ✅
- Network connection is good ✅
- Problem is in our code/DB

**If this fails:**
- Token is invalid ❌
- Or phone doesn't exist on Meta ❌

---

## 📋 What to Check

| Issue | Check |
|-------|-------|
| "Access token invalid" | Token is not expired in Meta Business Suite? |
| "Phone not found" | Phone is connected to the same WABA in Meta? |
| "Network error" | Can you reach `graph.facebook.com` from terminal? |
| "Connection timeout" | Is backend running? Can it connect to internet? |
| "Token corrupted" | Have you changed JWT_SECRET in .env? |

---

## 🔧 If Still Broken

### Enable Debug Logging

**In settingsController.js**, add more logs:

```javascript
console.log('📱 Request:', { 
  accountId, 
  phoneId: id,
  tokenExists: !!phoneNumber.accessToken 
});
```

**In .env**, set:
```
NODE_ENV=development  # Shows full error messages
```

### Share These Logs
When asking for help, provide:

1. **Backend console output** from "Test Connection" click
2. **Frontend console errors** (DevTools → Console)
3. **Your phone number ID** (last 6 digits OK)
4. **Is token fresh or old?**
5. **Can backend reach Meta?** (curl test above)

---

## ✅ Success Indicators

When connection test works:

```json
{
  "success": true,
  "message": "Connection test successful",
  "error": null,
  "details": {
    "phoneNumberId": "889344924259692",
    "displayPhoneNumber": "+1234567890",
    "verifiedName": "Your Business Name",
    "qualityRating": "GREEN",  // or "YELLOW" if provisioning
    "status": "ACTIVE",
    "lastTestedAt": "2026-01-23T..."
  }
}
```

---

## 🚀 Next Steps

Once connection test passes:
1. ✅ Phone is verified
2. ✅ Token is valid
3. ✅ Network is working
4. Now you can: **Send Messages**, **Create Templates**, **Receive Webhooks**

If any of those fail, the issue is not the phone connection - it's in message handling or template logic.
