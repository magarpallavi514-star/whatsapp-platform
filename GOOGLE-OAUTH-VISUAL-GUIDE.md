# 🎯 Google OAuth - Step-by-Step Visual Guide

## Phase 1: Google Cloud Setup (5 minutes)

### Step 1: Create Google Cloud Project
```
https://console.cloud.google.com/

┌─────────────────────────────────┐
│  Google Cloud Console            │
│  ┌───────────────────────────┐   │
│  │ [Select a Project ▼]      │   │
│  │                           │   │
│  │ [NEW PROJECT]             │   │
│  │                           │   │
│  │ Project name:             │   │
│  │ Pixels WhatsApp Platform  │   │
│  │                           │   │
│  │ [CREATE]                  │   │
│  └───────────────────────────┘   │
└─────────────────────────────────┘
```

### Step 2: Enable Google+ API
```
APIs & Services → Library

┌─────────────────────────────────┐
│  Search: "Google+ API"          │
│                                 │
│  [Google+ API - Deprecated]     │
│  OR                             │
│  [Google+ Domains API]          │
│  OR search "Identity"           │
│                                 │
│  [ENABLE]                       │
└─────────────────────────────────┘
```

### Step 3: Create OAuth Credentials
```
Credentials → [CREATE CREDENTIALS]

┌─────────────────────────────────┐
│  OAuth 2.0 Client ID            │
│                                 │
│  Application Type:              │
│  ○ Web application ✓            │
│  ○ Desktop                      │
│  ○ Mobile                       │
│                                 │
│  Name: Pixels WhatsApp Web      │
│                                 │
│  [CREATE]                       │
└─────────────────────────────────┘
```

### Step 4: Add Authorized URIs
```
Authorized JavaScript Origins:
┌─────────────────────┐
│ http://localhost    │
└─────────────────────┘

Authorized Redirect URIs:
┌────────────────────────────────────────────────┐
│ http://localhost:3000                          │
│ http://localhost:3000/login                    │
│ http://localhost:5050/api/auth/google/callback │
│ https://yourdomain.com                         │
│ https://yourdomain.com/login                   │
└────────────────────────────────────────────────┘

[SAVE]
```

### Step 5: Copy Your Credentials
```
┌──────────────────────────────────────────┐
│  Your OAuth 2.0 Credentials              │
│                                          │
│  Client ID:                              │
│  ╔══════════════════════════════════╗   │
│  ║ 123456789-abcdef.apps.google... ║   │
│  ╚══════════════════════════════════╝   │
│  [COPY]                                  │
│                                          │
│  Client Secret:                          │
│  ╔══════════════════════════════════╗   │
│  ║ GOCSPX-AbCdEfGhIjKlMnOpQrStU... ║   │
│  ╚══════════════════════════════════╝   │
│  [COPY]                                  │
└──────────────────────────────────────────┘

✅ SAVE THESE! You'll need them in the next phase.
```

---

## Phase 2: Environment Configuration (3 minutes)

### Step 6: Update Backend .env

**File: `backend/.env`**

```env
# Previous config...

# ==========================================
# Google OAuth Configuration
# ==========================================
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Replace YOUR_CLIENT_ID_HERE with: 123456789-abcdef.apps.google...
# Replace YOUR_CLIENT_SECRET_HERE with: GOCSPX-AbCdEfGhIjKlMnOpQrStU...
```

**Before:**
```env
MONGODB_URI=...
META_APP_SECRET=...
```

**After:**
```env
MONGODB_URI=...
META_APP_SECRET=...

GOOGLE_CLIENT_ID=123456789-abcdef.apps.google.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStU...
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback
JWT_SECRET=your-secret-key
```

### Step 7: Update Frontend .env.local

**File: `frontend/.env.local`**

```env
# Previous config...
NEXT_PUBLIC_API_URL=http://localhost:5050/api

# ==========================================
# Google OAuth
# ==========================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE

# Replace with: 123456789-abcdef.apps.google...
```

**Before:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

**After:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5050/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdef.apps.google.com
```

### Step 8: Verify Package.json Updates

**Backend has:**
```json
{
  "dependencies": {
    "google-auth-library": "^9.0.0"
  }
}
```

**Frontend has:**
```json
{
  "dependencies": {
    "@react-oauth/google": "^0.12.1"
  }
}
```

✅ Both should already be updated from our setup

---

## Phase 3: Installation (2 minutes)

### Step 9: Install Backend Dependencies
```bash
$ cd backend

backend$ npm install

# Output:
# added 1 package, audited 45 packages in 2.3s
# found 0 vulnerabilities ✓

backend$ npm run dev

# Output:
# > nodemon server.js
# 🚀 Server is listening on port 5050
# ✅ Database connected successfully
```

### Step 10: Install Frontend Dependencies
```bash
$ cd frontend

frontend$ npm install

# Output:
# added 1 package in 3.2s

frontend$ npm run dev

# Output:
# ▲ Next.js 16.1.1
# - Local:        http://localhost:3000
# ✓ Ready in 2.5s
```

---

## Phase 4: Testing (2 minutes)

### Step 11: Open Login Page
```
Browser:
┌──────────────────────────────────────────┐
│ http://localhost:3000/login              │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │  Welcome Back                        │ │
│ │  Sign in to your account             │ │
│ │                                      │ │
│ │  Email: [ _____________ ]            │ │
│ │  Password: [ _____________ ]         │ │
│ │                                      │ │
│ │  [Sign In →]                         │ │
│ │                                      │ │
│ │  ─── Or continue with ───            │ │
│ │                                      │ │
│ │  ┌──────────────────────────────┐   │ │
│ │  │ 🔵 Sign in with Google       │   │ │
│ │  └──────────────────────────────┘   │ │
│ │                                      │ │
│ │  Don't have account? Sign up         │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

✅ See the "Sign in with Google" button?

### Step 12: Click Google Button
```
┌────────────────────────────────────┐
│  Google Sign-In Dialog             │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Choose an account            │  │
│  │                               │  │
│  │  ┌─────────────────────────┐ │  │
│  │  │ 👤 yourname@gmail.com   │ │  │
│  │  │                         │ │  │
│  │  │ yourname@...           │ │  │
│  │  └─────────────────────────┘ │  │
│  │                               │  │
│  │  ┌─────────────────────────┐ │  │
│  │  │ 👤 + Use another account│ │  │
│  │  └─────────────────────────┘ │  │
│  │                               │  │
│  │  [Click your account]         │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### Step 13: Google Asks for Permission
```
┌────────────────────────────────────┐
│  Pixels WhatsApp Platform          │
│  wants to access your Google       │
│  Account                           │
│                                    │
│  ☑ Email address                   │
│  ☑ Profile picture                 │
│  ☑ Name                            │
│                                    │
│  [Cancel]           [Allow]        │
└────────────────────────────────────┘
```

**Click [Allow]**

### Step 14: Success! Redirected
```
Browser:
http://localhost:3000/dashboard

┌──────────────────────────────────────────┐
│  Dashboard                               │
│                                          │
│  👤 yourname@gmail.com                   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ Contacts | Templates | Broadcasts│   │
│  │ Chat | Analytics | Settings      │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Welcome! You're logged in! ✅            │
└──────────────────────────────────────────┘
```

✅ **YOU'RE LOGGED IN!**

---

## Phase 5: Verification (1 minute)

### Step 15: Check Browser Storage
```
Browser DevTools: Application → Storage

LocalStorage (http://localhost:3000):
┌─────────────────────────────────────────┐
│ auth_token:                             │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. │
│ eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6. │
│ SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_a.. │
│                                         │
│ user:                                   │
│ {                                       │
│   "id": "507f1f77bcf86cd799439011",   │
│   "email": "user@gmail.com",           │
│   "name": "User Name",                 │
│   "picture": "https://...",            │
│   "role": "admin",                      │
│   "accountId": "507f1f77bcf86cd799439012" │
│ }                                       │
│                                         │
│ isAuthenticated:                        │
│ true                                    │
└─────────────────────────────────────────┘
```

### Step 16: Check Backend Logs
```
Terminal 1 (Backend):

🚀 Server is listening on port 5050
✅ Database connected successfully
...
✅ Google user authenticated: user@gmail.com
✅ New Account created: 507f1f77bcf86cd799439012
✅ New User created: 507f1f77bcf86cd799439011
✅ JWT token generated: eyJhbGciOiJIUzI1NiI...
```

### Step 17: Check MongoDB
```
MongoDB → pixelswhatsapp database

Collections:
┌─────────────────────────┐
│ accounts                │
│ ├─ _id: 507f...        │
│ ├─ name: "User Name"    │
│ ├─ email: "user@..."    │
│ ├─ plan: "starter"      │
│ └─ createdAt: now       │
│                         │
│ users                   │
│ ├─ _id: 507f...        │
│ ├─ email: "user@..."    │
│ ├─ googleId: "12345.."  │
│ ├─ accountId: ref       │
│ ├─ role: "admin"        │
│ └─ emailVerified: true  │
└─────────────────────────┘
```

✅ **Everything working!**

---

## Summary: What Happens in Your System

```
┌─────────────────────────────────────────────────────────┐
│                    Your System Now Has:                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Google Sign-In Button on Login Page                 │
│  ✅ OAuth 2.0 Integration with Google Servers           │
│  ✅ Automatic User & Account Creation                   │
│  ✅ JWT Token Generation & Storage                      │
│  ✅ Protected Dashboard Routes                          │
│  ✅ Secure API Communication                            │
│                                                         │
│  🎯 Ready for Client Onboarding!                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting Quick Links

| Issue | Quick Fix |
|-------|-----------|
| Button not showing | Check NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local |
| Invalid token | Verify GOOGLE_CLIENT_ID & SECRET match in .env |
| CORS error | Restart backend after updating .env |
| User not created | Check MongoDB connection |
| Redirect fails | Check localhost:3000 in Google OAuth URIs |

---

## You're Done! 🎉

**Total Time: ~15-20 minutes**

```
Google Credentials Setup:     ✅ 5 min
Environment Config:           ✅ 3 min
Install Dependencies:         ✅ 2 min
Testing:                      ✅ 2 min
Verification:                 ✅ 1 min
────────────────────────────────────
Total:                        ✅ 13 min
```

Your WhatsApp platform now has **full Google OAuth integration**.

**Next:** Share the login page with your clients and watch them sign up! 🚀
