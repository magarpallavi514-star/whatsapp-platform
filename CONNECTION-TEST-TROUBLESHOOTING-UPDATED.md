# 🔧 Connection Test Failing - Troubleshooting Guide

## Problem
When clicking "Test Connection" in Settings → WhatsApp, getting error:
```
Failed to test connection to WhatsApp API
```

## Root Causes & Solutions

### 1. ❌ Token Decryption Failed (Most Common)

**Error Message You'll See:**
```
Access token could not be decrypted. Server configuration issue (JWT_SECRET mismatch).
```

**Why This Happens:**
- JWT_SECRET environment variable was changed
- Phone was added with old JWT_SECRET, now trying to decrypt with new one
- Server restarted with different JWT_SECRET

**Solution:**
```bash
# 1. Check current JWT_SECRET in .env
cat backend/.env | grep JWT_SECRET

# 2. If it was recently changed, either:
#    Option A: Revert JWT_SECRET to the original value
#    Option B: Re-add the phone number with new JWT_SECRET (will re-encrypt token)

# 3. Restart the backend server
npm run dev
```

### 2. ❌ Access Token is Invalid or Expired

**Error Message You'll See:**
```
Access token is invalid or expired
```

**Why This Happens:**
- Meta access token expired (tokens expire after some time)
- Token was revoked or permissions were removed

**Solution:**
```bash
# Go to Settings → WhatsApp Connection
# Delete the phone number
# Click "Connect WhatsApp" again
# This will generate a new fresh access token
```

### 3. ❌ Phone Number Not Found on Meta

**Error Message You'll See:**
```
Phone number not found in WhatsApp system
```

**Why This Happens:**
- Phone number doesn't exist in your Meta Business Account
- Phone number was removed from Meta
- Wrong phone number ID

**Solution:**
1. Log into your Meta Business Manager
2. Go to WhatsApp → Accounts → Your WABA
3. Verify the phone number exists and is registered
4. Copy the correct Phone Number ID (numeric)
5. Try testing again or re-add the phone

### 4. ❌ Network/Connection Error

**Error Message You'll See:**
```
Connection timeout - backend cannot reach Meta API
Cannot reach Meta API - network error
```

**Why This Happens:**
- Backend server cannot reach Meta API servers
- Firewall blocking outgoing HTTPS requests
- No internet connection
- Meta servers temporarily down

**Solution:**
```bash
# 1. Test if backend can reach Meta API:
curl -i "https://graph.facebook.com/v21.0" \
  -H "Authorization: Bearer dummy_token"

# Should get a 400 error (invalid token is OK - means API is reachable)
# If you get connection timeout or refused, firewall is blocking

# 2. Check if server is behind proxy
# Some servers require proxy settings for outbound HTTPS

# 3. Check if Meta is down (unlikely but possible)
# https://status.developers.facebook.com/
```

### 5. ❌ Phone Not Active Yet

**Error Message (Not Shown in Current Version):**
```
Phone number is not active. Cannot test connection.
```

**Why This Happens:**
- Only happens if phone is marked inactive in database

**Solution:**
This should be fixed now - the test should work even if phone is not yet marked active.

---

## Step-by-Step Debugging

### Step 1: Check Backend Logs

When you click "Test Connection", watch the backend console for:

```javascript
🧪 Testing phone number: { id: "...", accountId: "..." }
✅ Found phone number: { phoneNumberId: "...", hasToken: true }
🔐 Token Validation: { ... }
🚀 Calling Meta API: { endpoint: "...", tokenLength: 234, ... }
```

**If you see logs stop after finding phone, token validation is failing.**

### Step 2: Run Diagnostic Script

I've created a diagnostic script to help debug:

```bash
cd backend

# Test a specific phone number
node test-phone-connection-debug.js 1234567890123456

# This will show:
# ✅ Phone found in database
# ✅ Token present
# ✅ Token length
# ⚠️  Token validation issues
# ✅ Meta API response (or error details)
```

### Step 3: Check Environment Variables

```bash
# Backend .env file must have:
JWT_SECRET=your_secret_key_here
MONGODB_URI=mongodb+srv://...
```

### Step 4: Check Database State

```bash
# MongoDB Compass or mongosh
use whatsapp_platform
db.phonenumbers.findOne({ phoneNumberId: "1234567890123456" })

# Look for:
# - accessToken field (should exist, will be encrypted)
# - phoneNumberId field
# - wabaId field
```

---

## Quick Fixes to Try (In Order)

### Fix #1: Restart Backend
```bash
cd backend
npm run dev
```

### Fix #2: Re-Add Phone Number
1. Go to Settings → WhatsApp Connection
2. Delete the phone number
3. Click "Connect WhatsApp" again
4. This gets a fresh token

### Fix #3: Check JWT_SECRET
```bash
# Compare what's in .env with what was there before
# If it's different, either:
# - Change it back to original, OR
# - Re-add the phone number
```

### Fix #4: Test Network Connectivity
```bash
# Test if backend can reach Meta API
curl "https://graph.facebook.com/v21.0/me" \
  -H "Authorization: Bearer test" 2>&1 | head -20
  
# Should get a response (even if it says token invalid)
# If you get connection refused or timeout, check firewall
```

---

## Understanding the Fix Applied

**Before:**
- Phone test would fail if phone wasn't already marked `isActive: true`
- Token validation was too strict
- Error messages were generic

**After:**
- Phone test works even if phone is not yet active (first-time setup)
- Token validation checks for decryption failures
- Detailed error messages help identify the real issue
- Better logging for debugging

---

## If Still Not Working

Please provide:

1. **Backend logs from test attempt:**
   ```
   Copy everything printed to console when you click test
   ```

2. **Phone document from MongoDB:**
   ```javascript
   db.phonenumbers.findOne({ phoneNumberId: "..." }, { accessToken: 0 })
   // (excluding token for safety)
   ```

3. **Your environment:**
   ```
   NODE_ENV: production or development?
   Backend running: locally or on server?
   Frontend: localhost or deployed?
   ```

4. **The exact error message** from the UI

5. **Run the diagnostic script:**
   ```bash
   node test-phone-connection-debug.js <your_phone_id>
   # Copy the output
   ```

---

## Error Code Reference

| Error Code | Meaning | Solution |
|-----------|---------|----------|
| `TOKEN_DECRYPTION_FAILED` | JWT_SECRET mismatch | Check .env JWT_SECRET or re-add phone |
| `INVALID_TOKEN_FORMAT` | Token is corrupted/empty | Re-add phone number to get fresh token |
| `403 Unauthorized` | Token expired or invalid | Re-add phone number |
| `404 Not Found` | Phone doesn't exist on Meta | Verify phone number exists in Meta Business |
| `ECONNABORTED` / `ETIMEDOUT` | Network error | Check firewall and internet connection |
| `ENOTFOUND` | Cannot reach Meta API DNS | Check internet, firewall, proxy |

---

## Verification Checklist

- [ ] Backend is running (`npm run dev`)
- [ ] .env file has JWT_SECRET
- [ ] .env file has MONGODB_URI
- [ ] MongoDB is accessible
- [ ] Internet connection is working
- [ ] Firewall allows outbound HTTPS to graph.facebook.com
- [ ] Phone number exists in Meta Business Account
- [ ] Phone number is added to the system in Settings

---

## Next Steps

1. Check backend logs when clicking test
2. Run diagnostic script: `node test-phone-connection-debug.js <phone_id>`
3. Look at error message - it will tell you exactly what's wrong
4. Apply the solution from the table above
5. Test again

The fix I applied removed the "must be active" check and improved error detection. This should let you test the connection and diagnose what's actually wrong.
