# Token Generation Troubleshooting Guide

## Quick Test

Open your browser's **Developer Console** (F12 or Cmd+Option+I) and try this:

### Step 1: Check if you're logged in

```javascript
// Paste in console:
localStorage.getItem('token')
```

**Should show:** A long string starting with `ey...` (JWT token)
**If blank:** You're not logged in - go to login page first

### Step 2: Check the API URL

```javascript
// In the console, when on settings page:
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"
console.log("API URL:", API_URL)
```

**Should show:** `http://localhost:5050` (or your deployed URL)

### Step 3: Click the Button and Check Console

1. Go to Settings → API Keys tab
2. Click "Generate Integration Token" button
3. Click OK on the confirmation popup
4. **Check the console** - you should see detailed logs starting with:
   ```
   🔑 Token Generation Debug:
   ✅ Has JWT Token: true
   📍 API URL: http://localhost:5050/api/account/integration-token
   ```

---

## What to Look For in Console Logs

### ✅ Success (Should See):
```
🔑 Token Generation Debug:
  ✅ Has JWT Token: true
  📍 API URL: http://localhost:5050/api/account/integration-token
  📤 Headers: { hasAuth: true, authLength: 123, contentType: 'application/json' }
  📡 Sending request...
  📥 Response Status: 200 OK
  📦 Response Body: { success: true, hasToken: true, message: '...' }
✅ Integration Token generated successfully
```

### ❌ Error: No Token
```
🔑 Token Generation Debug:
  ❌ Has JWT Token: false
```
**Fix:** Logout and login again

### ❌ Error: 401 Unauthorized
```
📥 Response Status: 401 Unauthorized
```
**Fix:** Your JWT token expired - logout and login again

### ❌ Error: 404 Not Found
```
📥 Response Status: 404 Not Found
📦 Response Body: { message: 'Account not found' }
```
**Fix:** Account doesn't exist in database - contact support

### ❌ Error: 500 Server Error
```
📥 Response Status: 500 Internal Server Error
```
**Fix:** Check backend logs - backend is broken

---

## Backend Test Script

If frontend doesn't work, test directly:

```bash
# From backend directory
cd backend
node test-token-generation.js superadmin@test.com 22442232
```

**Expected output:**
```
Step 1️⃣  Logging in...
Status: 200
✅ Login successful!
🔑 JWT Token: eyJhbGc...

Step 2️⃣  Generating integration token...
Status: 200
✅ Integration Token Generated!
🔑 Token: wpi_int_abc123...
```

---

## Complete Troubleshooting Checklist

- [ ] Backend is running: `npm run dev` in `/backend`
- [ ] Frontend is running: `npm run dev` in `/frontend`
- [ ] You're logged in (check `localStorage.getItem('token')`)
- [ ] JWT token is not empty/valid
- [ ] API URL is correct (http://localhost:5050)
- [ ] No CORS errors in console
- [ ] No network errors in Network tab (F12)

---

## Check Backend Logs

The backend should show detailed logs when you try to generate a token:

```
🔑 Generating integration token for account: superadmin@test.com
✅ Account found: SuperAdmin (Demo)
🔐 Token generated, prefix: wpi_int_abc
✅ Integration token generated successfully
```

If you don't see these logs, the backend never received the request.

---

## Common Fixes

### Issue: "Cannot read property 'getToken' of undefined"
**Cause:** authService not imported correctly
**Fix:** Make sure import is at top: `import { authService } from "@/lib/auth"`

### Issue: "Failed to fetch"
**Cause:** Backend not running or wrong URL
**Fix:** 
1. Check backend running: `npm run dev`
2. Check frontend .env has: `NEXT_PUBLIC_API_URL=http://localhost:5050`

### Issue: "SyntaxError: Unexpected token < in JSON"
**Cause:** Server returned HTML error page instead of JSON
**Fix:** Check backend logs for error

### Issue: Button not responding at all
**Cause:** JavaScript error preventing execution
**Fix:** Open console, should show red error message - check it

---

## Reset Everything

If nothing works:

### Reset Frontend Token
```javascript
// In console:
localStorage.removeItem('token')
localStorage.removeItem('isAuthenticated')
localStorage.removeItem('user')
window.location.href = '/login'
```

### Reset Backend (WARNING: clears all data)
```bash
# In backend directory
mongosh  # or mongo
use whatsapp_platform
db.accounts.deleteMany({})
```

Then login again and try.

---

## Get More Details

Enable debug mode in backend `.env`:
```env
DEBUG=pixels:*
LOG_LEVEL=debug
```

Then restart backend and watch logs.

---

**If still not working:** Share the console logs (F12) and backend logs with the team.
