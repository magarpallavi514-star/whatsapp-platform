# 🧪 Session Security Testing Guide

## **Quick Test Steps**

### **Step 1: Test Login Route Protection** ✅

```
1. Open your app in browser
2. Login with your credentials
3. Copy URL and change to: /login
4. Press Enter

Expected Result:
┌─────────────────────────────┐
│ See: "Checking session..."  │
│ Wait: 1-2 seconds          │
│ Then: Auto-redirect to     │
│       /dashboard           │
│ ✅ SUCCESS                 │
└─────────────────────────────┘
```

---

### **Step 2: Test Register Route Protection** ✅

```
1. Already logged in
2. Navigate to: /auth/register
3. Press Enter

Expected Result:
┌─────────────────────────────┐
│ See: "Checking session..."  │
│ Then: Auto-redirect to     │
│       /dashboard           │
│ ✅ SUCCESS                 │
└─────────────────────────────┘
```

---

### **Step 3: Test Logout & Dashboard Access** ✅

```
1. Click Logout button (top right)
2. You'll be logged out
3. Try to access: /dashboard
4. Press Enter

Expected Result:
┌─────────────────────────────┐
│ See: Loading spinner        │
│ Then: Redirect to /login    │
│ ✅ SUCCESS                 │
└─────────────────────────────┘
```

---

### **Step 4: Test Manual localStorage Clear** ✅

```
1. Login to dashboard
2. Open DevTools (Press F12)
3. Go to: Application tab
4. Click: localhost (under Storage)
5. Click: localStorage
6. Select all items
7. Delete them
8. Go to address bar
9. Type: /dashboard
10. Press Enter

Expected Result:
┌─────────────────────────────┐
│ Redirects to: /login        │
│ ✅ SUCCESS                 │
└─────────────────────────────┘
```

---

### **Step 5: Test Token Expiry** ⏳

```
1. Login successfully
2. Open DevTools (F12)
3. Go to: Application → localStorage
4. Find "token"
5. Modify it to garbage: xxxxx000000
6. Close DevTools
7. Refresh page (Ctrl+R)

Expected Result:
┌─────────────────────────────┐
│ System detects invalid      │
│ token                       │
│ Redirects to: /login        │
│ ✅ SUCCESS                 │
└─────────────────────────────┘
```

---

## **What You Should See**

### **Loading Screen** (During Auth Check)
```
┌──────────────────────────────┐
│                              │
│       🟢 (spinner)           │
│                              │
│  Checking your session...    │
│                              │
└──────────────────────────────┘
```

This appears for 1-2 seconds while the system:
- Checks if you're logged in
- Validates your session
- Decides where to send you

---

## **Browser Console Logs** (For Debugging)

Open DevTools (F12) and check Console tab:

**When logged in & accessing /login:**
```
✅ Session found - Redirecting to dashboard
```

**When logged out & accessing /dashboard:**
```
❌ Not authenticated - redirecting to login
```

**When accessing unauthorized route:**
```
❌ Access denied to /dashboard/admin for role user
```

---

## **localStorage Data to Verify**

### **When Logged In:**
Open DevTools → Application → localStorage → Find:

```
Key: isAuthenticated
Value: "true"

Key: token
Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

Key: user
Value: {"id":"...", "email":"user@example.com", ...}
```

### **When Logged Out:**
```
All three keys should be DELETED
(localStorage should be empty for auth)
```

---

## **Common Issues & Solutions**

### **Issue 1: Still See Login Page When Logged In** ❌
```
Solution:
1. Open DevTools (F12)
2. Go to Application
3. Check localStorage
4. If empty → You're not actually logged in
5. Login again with correct credentials
```

### **Issue 2: Stuck on "Checking session..." ⏳
```
Solution:
1. Refresh page (Ctrl+R)
2. If still stuck → Clear localStorage
3. Logout and login again
4. Check browser console for errors
```

### **Issue 3: Token Shows as Expired** 🔓
```
Solution:
1. Logout (clears token)
2. Login again (gets new token)
3. New token should work
```

---

## **Security Checklist** ✅

- [ ] Logged-in users cannot access `/login`
- [ ] Logged-in users cannot access `/auth/register`
- [ ] Logged-out users cannot access `/dashboard`
- [ ] localStorage clears on logout
- [ ] Invalid tokens redirect to login
- [ ] Page shows loading while checking auth
- [ ] Unauthorized roles see access denied message

---

## **What's Protected Now**

```
Public Routes (anyone can access):
├── / (home page)
├── /pricing
├── /login ❌ (if logged in → redirect)
├── /auth/register ❌ (if logged in → redirect)
└── /solutions/*

Protected Routes (must be logged in):
├── /dashboard ✅ (checks token)
├── /dashboard/invoices ✅
├── /dashboard/billing ✅
├── /dashboard/organizations ✅ (superadmin only)
└── All other /dashboard/* routes
```

---

**Your app is now secure with proper session management! 🔐**
