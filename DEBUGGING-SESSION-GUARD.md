# 🔧 Session Guard Debugging Guide

## **Quick Test After Changes**

### **Step 1: Hard Refresh Browser** ⚡
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
This clears cache and reloads everything
```

### **Step 2: Open Browser DevTools** 🛠️
```
Press: F12
Go to: Console tab
```

### **Step 3: Check Console Logs** 📝

You should see messages like:

```
🔍 Auth Check on /login: {
  isAuthenticated: true,
  hasToken: true,
  hasUser: true,
  tokenLength: 234
}

✅ Session found - Redirecting to dashboard
```

**OR if not logged in:**

```
🔍 Auth Check on /login: {
  isAuthenticated: false,
  hasToken: false,
  hasUser: false,
  tokenLength: 0
}

❌ No session found - Showing login page
```

---

## **Full Test Sequence**

### **Test 1: While Logged In** ✅

```
1. Make sure you're logged in (on dashboard)
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Go to address bar
4. Type: localhost:3000/login
5. Press Enter
6. Open DevTools (F12)
7. Check Console tab

Expected:
┌─────────────────────────────────────┐
│ 🔍 Auth Check on /login:            │
│    isAuthenticated: true,           │
│    hasToken: true,                  │
│    hasUser: true                    │
│                                     │
│ ✅ Session found -                 │
│    Redirecting to dashboard        │
│                                     │
│ See: Loading screen (1-2 sec)       │
│ Then: Auto-redirects to dashboard   │
│ ✅ SUCCESS                          │
└─────────────────────────────────────┘
```

### **Test 2: While Logged Out** ❌

```
1. Logout (clear all sessions)
2. Hard refresh: Cmd+Shift+R
3. Go to address bar
4. Type: localhost:3000/login
5. Press Enter
6. Open DevTools (F12)

Expected:
┌─────────────────────────────────────┐
│ 🔍 Auth Check on /login:            │
│    isAuthenticated: false,          │
│    hasToken: false,                 │
│    hasUser: false                   │
│                                     │
│ ❌ No session found -               │
│    Showing login page               │
│                                     │
│ See: Login form displays            │
│ ✅ SUCCESS                          │
└─────────────────────────────────────┘
```

---

## **Troubleshooting**

### **Problem: Still doesn't redirect** ❌

**Solution 1: Clear Next.js Cache**
```bash
# Stop dev server (Ctrl+C)
# Then run:
cd frontend
rm -rf .next
npm run dev
```

**Solution 2: Check localStorage**
```
1. Open DevTools (F12)
2. Go to Application tab
3. Click: localhost (under Storage)
4. Click: localStorage
5. Check if these exist:
   - isAuthenticated = "true"
   - token = "eyJhb..." (long string)
   - user = "{...}" (JSON object)
```

**Solution 3: Check Auth Service**
```
In DevTools Console, run:
localStorage.getItem("isAuthenticated")
localStorage.getItem("token")
localStorage.getItem("user")

Should show:
"true"
"eyJhbGciOiJIUzI1NiIs..." (JWT token)
"{\"id\":\"...\", \"email\":\"...\"}" (User JSON)
```

---

## **Browser DevTools - Console Messages**

### **Successful Auth Check (Logged In)**
```
🔍 Auth Check on /login: {
  isAuthenticated: 'true',
  hasToken: true,
  hasUser: true,
  tokenLength: 234
}
✅ Session found - Redirecting to dashboard
```

### **Failed Auth Check (Logged Out)**
```
🔍 Auth Check on /login: {
  isAuthenticated: false,
  hasToken: false,
  hasUser: false,
  tokenLength: 0
}
❌ No session found - Showing login page
```

---

## **What Changed in Code**

**Added 100ms delay before checking:**
```typescript
// Small delay to ensure localStorage is fully loaded
await new Promise(resolve => setTimeout(resolve, 100))
```

**Better debugging logs:**
```typescript
console.log('🔍 Auth Check on /login:', {
  isAuthenticated,
  hasToken: !!token,
  hasUser: !!user,
  tokenLength: token?.length || 0
})
```

---

## **Step-by-Step Test Instructions**

```
1️⃣  Login to your account
    └─ You should be on /dashboard

2️⃣  Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
    └─ Page reloads, session is still valid

3️⃣  Navigate to /login
    └─ Type: localhost:3000/login
    └─ Press Enter

4️⃣  Open DevTools (F12)
    └─ Go to Console tab
    └─ Look for "Auth Check" message

5️⃣  Should see one of these:
    ✅ Redirects to /dashboard
       (Session found, auto-redirect)
    
    ❌ Shows login page
       (No valid session)

6️⃣  Try /auth/register same way
    └─ Should also auto-redirect if logged in
```

---

## **Quick Fix Checklist** ✅

- [ ] Did you hard refresh? (Cmd+Shift+R)
- [ ] Dev server running? (npm run dev)
- [ ] Check DevTools Console for error messages
- [ ] Check localStorage has token
- [ ] Browser doesn't have cache issues
- [ ] Try in incognito/private window
- [ ] Check internet connection

---

**Try now and check your browser console! Tell me what logs you see 👀**
