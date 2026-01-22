# 🔐 Session Security Implementation

## Overview
Complete session security system with:
1. **Single Session Per Browser** - Only one active login allowed
2. **5-Minute Inactivity Timeout** - Auto-logout after no activity
3. **Activity Tracking** - User actions reset the timeout
4. **Hooks Order Fix** - React hooks properly ordered

---

## 🛡️ Features Implemented

### 1. Single Session Per Browser
**Problem:** Multiple tabs could have different sessions
**Solution:** Session lock key prevents multiple concurrent sessions

```typescript
// In localStorage:
replysys_session_lock: "unique_session_id"

// If another session is detected:
setError('⚠️ Another login session detected. Only one session per browser allowed.')
localStorage.clear() // Force clear
window.location.reload()
```

**Where It Works:**
- Login page (email/password)
- Google Sign-In
- Register page

### 2. 5-Minute Inactivity Timeout
**Problem:** Sessions stayed active forever
**Solution:** Track last activity, auto-logout on inactivity

```typescript
// Activity tracking
replysys_last_activity: "1705863000000" // timestamp

// Inactivity check (every 30 seconds)
const inactivityTime = currentTime - lastActivityTime
if (inactivityTime > 5 * 60 * 1000) {
  authService.logout() // Auto-logout
  router.push('/login?expired=true')
}
```

**Activities That Reset Timeout:**
- Mouse clicks
- Keyboard input
- Page scrolling
- Touch events

### 3. Activity Tracking
**Dashboard listens to:**
- `mousedown` - Mouse clicks
- `keydown` - Keyboard input
- `scroll` - Page scrolling
- `touchstart` - Mobile touch

Each action updates `replysys_last_activity` timestamp

### 4. Hooks Order Fix
**Problem:** React error "change in order of Hooks"
**Solution:** 
- Moved Google script loading to after auth check
- Added `isCheckingAuth` dependency
- Proper if-return structure

---

## 📁 Files Modified

### Frontend Files:

1. **[app/login/page.tsx](app/login/page.tsx)**
   - Added session lock checking
   - Added activity tracking on login
   - Fixed hooks order
   - Added loading screen before rendering form

2. **[lib/auth.ts](lib/auth.ts)**
   - Added `checkInactivityTimeout()` function
   - Added `updateActivity()` function
   - Updated `logout()` to clear session lock
   - Added session clearing logic

3. **[app/dashboard/layout.tsx](app/dashboard/layout.tsx)**
   - Added inactivity check on mount
   - Added activity event listeners
   - Added 30-second inactivity check interval
   - Redirects to login on timeout

---

## 🔑 Key Functions

### authService.checkInactivityTimeout()
```typescript
// Checks if user exceeded 5-minute inactivity
// Returns: true if timeout exceeded
// Action: Auto-logout and clear session
const timedOut = authService.checkInactivityTimeout()
if (timedOut) {
  router.push('/login?expired=true')
}
```

### authService.updateActivity()
```typescript
// Updates last activity timestamp
// Called on: mouse, keyboard, scroll, touch
authService.updateActivity()
// Sets: replysys_last_activity = Date.now()
```

### authService.logout()
```typescript
// Clears all session data including:
// - isAuthenticated
// - user
// - token
// - replysys_session_lock
// - replysys_last_activity
await authService.logout()
```

---

## 📊 Local Storage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `isAuthenticated` | "true" / false | Auth flag |
| `token` | JWT string | API authentication |
| `user` | JSON object | Current user data |
| `replysys_session_lock` | Unique ID | Single session lock |
| `replysys_last_activity` | Timestamp | Inactivity tracking |

---

## 🧪 Testing

### Test 1: Single Session
1. Login in Tab 1
2. Open new Tab 2
3. Try to login with different account
4. Should see: "Another login session detected"
5. Other session should be cleared automatically

### Test 2: 5-Minute Timeout
1. Login successfully
2. Don't interact for 5 minutes
3. Try any action on dashboard
4. Should auto-logout and redirect to /login

### Test 3: Activity Reset
1. Login successfully
2. Move mouse or press keys
3. "Checking your session..." should show
4. Should stay logged in

### Test 4: Logout Button
1. Click logout
2. All session data cleared
3. Redirected to /login
4. Cannot access /dashboard without re-login

---

## 🐛 Bug Fixes

### React Hooks Error Fixed
**Before:**
```
React has detected a change in the order of Hooks called by LoginPage.
Previous render: useState, useState, useState, useState, useState, useState, useContext, useEffect
Next render: useState, useState, useState, useState, useState, useEffect
```

**Root Cause:**
- `if (isCheckingAuth) return` at component root breaks hooks order
- Google script loading was conditional without dependency

**Solution:**
- Moved Google script loading to separate useEffect with dependency
- Conditional rendering happens AFTER hooks are called
- Proper loading screen component

---

## ⚙️ Configuration

**Inactivity Timeout:** 5 minutes (300,000 ms)
```typescript
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
```

**Inactivity Check Interval:** 30 seconds
```typescript
const inactivityCheckInterval = setInterval(() => {
  if (authService.checkInactivityTimeout()) {
    router.push('/login?expired=true');
  }
}, 30000);
```

**Session Lock Key:** Unique per browser
```typescript
const SESSION_LOCK_KEY = 'replysys_session_lock_' + Date.now();
```

---

## 🔄 Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│ USER VISITS /login                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Check isCheckingAuth = true (show loading)               │
│ 2. Check localStorage for token & isAuthenticated           │
│ 3. If found → redirect to /dashboard                        │
│ 4. If not → show login form (setIsCheckingAuth = false)    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ USER ENTERS CREDENTIALS & CLICKS LOGIN                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Check for existing session lock                          │
│ 2. If found from another session → error & clear            │
│ 3. Validate credentials with backend                        │
│ 4. If success:                                              │
│    - Set replysys_session_lock (unique ID)                  │
│    - Set replysys_last_activity (current time)              │
│    - Store token, user, isAuthenticated                     │
│    - Redirect to /dashboard                                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ USER IS ON /dashboard                                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Check inactivity on mount                                │
│ 2. Setup activity listeners (mouse, keyboard, scroll)       │
│ 3. Each activity → updateActivity() → reset timer           │
│ 4. Every 30 seconds → check if timeout exceeded             │
│ 5. If timeout → logout & redirect to /login                 │
│ 6. If activity → continue session                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ USER CLICKS LOGOUT OR INACTIVITY TIMEOUT                    │
├─────────────────────────────────────────────────────────────┤
│ 1. Call authService.logout()                                │
│ 2. Clear token, user, isAuthenticated                       │
│ 3. Clear replysys_session_lock                              │
│ 4. Clear replysys_last_activity                             │
│ 5. Redirect to /login                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Summary

✅ **Single Session Per Browser** - Prevents multiple concurrent logins
✅ **5-Minute Inactivity Timeout** - Auto-logout for security
✅ **Activity Tracking** - Resets timer on user interaction
✅ **Hooks Order Fixed** - React error resolved
✅ **Logout Clears Everything** - Clean session termination

---

## ⚡ Next Steps

1. **Test** - Run through all test cases above
2. **Deploy** - Push to production when verified
3. **Monitor** - Watch server logs for logout errors
4. **Document** - Update API docs with session requirements

