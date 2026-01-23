# 🔍 TROUBLESHOOTING: Send Message Error `{}` 

## The Problem
When trying to send a message from live chat, you get error: **`Failed to send: {}`** with empty JSON object.

This means the backend returned an error, but the error details are empty or not being displayed properly.

---

## Step 1: Check Browser Console

Open browser Developer Tools (F12) and go to **Console** tab.

Look for error messages like:
```
❌ Send failed: {}
```

**What to do:**
1. Right-click on the error
2. Select "Store as global variable"  
3. In console, type: `temp1` (or the variable name)
4. Take a screenshot showing:
   - `temp1.message`
   - `temp1.error`
   - `temp1.details`

---

## Step 2: Check Browser Network Tab

Go to **Network** tab in Developer Tools.

**Find the failing request:**
1. Look for POST request to `/api/messages/send` (it should be red/failed)
2. Click on it
3. Look at the **Response** tab

**What the response should show:**
- If successful: `{ success: true, message: "Message sent successfully", data: {...} }`
- If failed: `{ success: false, message: "Error description", error: "...", errorType: "..." }`

**Common responses:**

### ✅ 200 OK - Message Sent
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "abc123",
    "status": "sent"
  },
  "phoneNumberUsed": "889344924259692",
  "mode": "auto"
}
```

### ❌ 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "message": "Missing required fields: recipientPhone, message"
}
```
**Fix:** Make sure message text is not empty

### ❌ 401 Unauthorized - Auth Failed
```json
{
  "success": false,
  "message": "Authentication required",
  "redirectTo": "/login"
}
```
**Fix:** Login again or refresh token

### ❌ 403 Forbidden - Invalid Phone
```json
{
  "success": false,
  "message": "Invalid or inactive phone number for this account",
  "providedPhoneNumberId": "889344924259692",
  "hint": "Use GET /api/settings/phone-numbers to see available phone numbers"
}
```
**Fix:** Check that phone is added and active in Settings

### ❌ 500 Internal Server Error - Backend Error
```json
{
  "success": false,
  "message": "Error message from server",
  "error": "Detailed error description",
  "errorType": "ErrorType"
}
```
**Fix:** Check backend logs (see Step 3)

---

## Step 3: Check Backend Logs

### If Running Locally
Run backend in terminal and watch logs:
```bash
cd backend
npm run dev
```

When you send a message, watch for output like:
```
📤 Sending text message [auto]:
  Account ID: 695a15a5c526dbe7c085ece2
  Phone Number ID: 889344924259692
  Original Phone: 918087131777
  Message: Test message...

✅ Message saved to DB with status: queued
🚀 Sending to Meta API...
✅ Meta API Response: {...}
```

**Look for errors:**
```
❌ Send text message error: Error: ...
Error stack: ...
Error details: { name: "...", message: "..." }
```

### If Running on Railway
1. Go to https://railway.app
2. Select project "whatsapp-platform"
3. Click "Backend" service
4. Go to **Logs** tab
5. Send a message from dashboard
6. Watch logs appear in real-time

**Copy the error and paste it here** for debugging.

---

## Step 4: Verify Phone Number Configuration

### Check Phone is Added
1. Go to Dashboard → **Settings**
2. Click **Phone Numbers**
3. Should see at least one phone number listed
4. Check it shows:
   - ✅ Phone ID: `889344924259692` (for Superadmin)
   - ✅ Status: Active (green indicator)
   - ✅ WABA ID present

### If No Phones Found
1. Go to **Settings** → **Add Phone Number**
2. Enter:
   - Phone Number ID: `889344924259692`
   - WABA ID: `1536545574042607`
   - Access Token: (from Meta Business Account)
3. Click **Add**

---

## Step 5: Verify Authentication

### Check JWT Token
Open Developer Tools Console and run:
```javascript
localStorage.getItem('token')
```

**You should see:**
- A long string starting with `eyJ` (JWT format)
- NOT empty or `null`

**If empty:**
1. Click **Logout**
2. Click **Login**
3. Enter credentials
4. Try sending message again

### Verify Token Contains Account Info
In console, run:
```javascript
const token = localStorage.getItem('token');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Decoded token:', decoded);
```

**Should show:**
```javascript
{
  accountId: "pixels_internal",
  email: "admin@test.com",
  name: "Superadmin",
  iat: 1234567890,
  exp: 1234571490
}
```

---

## Step 6: Test Phone Number Retrieval

In browser console, run:
```javascript
const token = localStorage.getItem('token');
const response = await fetch('https://whatsapp-platform-production-e48b.up.railway.app/api/settings/phone-numbers', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log('Phone numbers:', data);
```

**You should see:**
```javascript
{
  success: true,
  phoneNumbers: [
    {
      _id: "...",
      phoneNumberId: "889344924259692",
      wabaId: "1536545574042607",
      displayPhone: "+1 889 344 924 259692",
      isActive: true,
      createdAt: "2026-01-22T..."
    }
  ]
}
```

---

## Step 7: Test Message Sending Directly

In browser console, run:
```javascript
const token = localStorage.getItem('token');
const response = await fetch('https://whatsapp-platform-production-e48b.up.railway.app/api/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phoneNumberId: '889344924259692',
    recipientPhone: '918087131777',
    message: 'Test message from console'
  })
});
const data = await response.json();
console.log('Response:', data);
console.log('Status:', response.status);
```

**Expected success:**
```javascript
{
  success: true,
  message: "Message sent successfully",
  data: { messageId: "wamid_ABC123", status: "sent" }
}
```

**Expected errors:**
- `401`: Token invalid - login again
- `403`: Phone not found - add phone in settings
- `500`: Backend error - check server logs

---

## Common Issues & Fixes

### Issue 1: Empty Error `{}`
**Cause:** Error object is empty or error.message is undefined
**Fix:** Check backend logs for actual error

### Issue 2: "Invalid or inactive phone number"
**Cause:** Phone not found in database
**Fix:** 
1. Go to Settings → Phone Numbers
2. Add phone if missing
3. Make sure status is "Active"

### Issue 3: "Missing required fields"
**Cause:** recipientPhone or message is empty
**Fix:**
1. Make sure message box has text
2. Make sure you selected a conversation
3. Try refreshing page

### Issue 4: "Authentication required"
**Cause:** JWT token is missing or invalid
**Fix:**
1. Logout and login again
2. Clear localStorage: `localStorage.clear()`
3. Refresh page

### Issue 5: Meta API Error
**Cause:** WhatsApp API rejected the request
**Fix:** Check if:
1. Phone number is verified on Meta
2. Access token is valid and not expired
3. Recipient phone number is valid format
4. Account has subscription active

---

## Quick Diagnostic Checklist

Before troubleshooting, verify:

- [ ] Logged in successfully
- [ ] Phone number added in Settings
- [ ] Phone status is "Active"
- [ ] Conversation is selected
- [ ] Message text is not empty
- [ ] Browser shows "Connected" (blue dot)
- [ ] No network request is pending

---

## How to Report the Error

If still stuck, share:

1. **Browser Console Error:**
   ```
   Failed to send: {...}
   ```

2. **Network Tab Response:**
   Copy full response from failed `/messages/send` request

3. **Backend Logs:**
   Copy error message from server logs

4. **Steps to Reproduce:**
   Exactly what you did before the error

5. **Environment:**
   - Account: Superadmin or Enromatics?
   - Browser: Chrome, Firefox, Safari?
   - Device: Mac, Windows, Phone?

---

## File Locations for Reference

- Frontend code: `frontend/app/dashboard/chat/page.tsx` (line 271)
- Backend endpoint: `backend/src/controllers/messageController.js` (line 27)
- Middleware: `backend/src/middlewares/phoneNumberHelper.js` (line 14)
- WhatsApp service: `backend/src/services/whatsappService.js` (line 71)

