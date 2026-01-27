# Socket.io Polling Error - Quick Debug Checklist

## 🚀 Quick Start (Do This First)

### 1. **Restart Backend**
```bash
cd backend
npm run dev
# Watch for: "🔌 Socket.io initialized with transports: ['websocket', 'polling']"
```

### 2. **Check Backend Health**
```bash
curl http://localhost:5050/health
# Should show: { "status": "ok", "socketConnections": X }
```

### 3. **Check Socket Stats**
```bash
curl http://localhost:5050/socket-stats
# Shows which clients use WebSocket vs polling
```

### 4. **Frontend Console**
When you load the chat page, should see:
```
🔌 Socket Init Debug:
  Socket URL: http://localhost:5050
  Token exists: true
  Auth status: true

✅ Socket connected: [socket_id]
📡 Transport: websocket
```

---

## 🔍 If You See "xhr poll error"

### Step 1: Check the Transport
```javascript
// In browser console:
const socket = require('@/lib/socket').getSocket();
console.log('Transport:', socket?.io?.engine?.transport?.name);
```

**Expected:** `websocket` (or `polling` as fallback)

**If polling:** WebSocket upgrade failed (check firewall/proxy)

---

### Step 2: Check Backend Logs
Should see:
```
🔐 Socket Auth Verification:
  Transport: websocket (or polling)
  ✅ Token verified

✅ User connected: [socket_id] (user@email.com)
📍 User subscribed to conversations
```

**If not seeing logs:** Connection isn't reaching backend

**If seeing "Token verified FAILED":** JWT is corrupted or secret mismatch

---

### Step 3: Check Network Tab (DevTools)

1. Open DevTools → **Network** tab
2. Filter: **XHR** (for polling requests)
3. Look for requests to `/socket.io/?`

**Expected:**
- WebSocket upgrade request shows in Network tab briefly
- Should switch to WebSocket (shown in Protocol column)
- No XHR requests once WebSocket is established

**If seeing XHR polling:**
- This is the fallback (slow but working)
- Check if WebSocket is blocked by firewall

**If seeing timeout errors:**
- Network is too slow (increase `connectTimeout`)
- Or backend isn't responding

---

## 🛠️ Common Fixes

### Fix 1: Clear Browser Cache
```javascript
// Open DevTools console and run:
localStorage.removeItem('token');
localStorage.removeItem('isAuthenticated');
localStorage.removeItem('user');
location.reload();
```

Then login again. Socket will get fresh token.

---

### Fix 2: Check Backend is Running
```bash
# In new terminal:
lsof -i :5050
# Should show: node ... listening on port 5050

# If not running:
cd backend && npm run dev
```

---

### Fix 3: Force Polling (for testing)
If WebSocket is blocked but you want to test polling:

**In `socket.ts`, change:**
```javascript
transports: ['websocket', 'polling'],
```

**To:**
```javascript
transports: ['polling'],  // Force polling only
```

Then reload page. Polling should work (slower but works).

---

### Fix 4: Increase Timeouts
If network is slow on production, edit `socketService.js`:

```javascript
// Increase these values:
pingInterval: 30000,      // From 25s to 30s
pingTimeout: 25000,       // From 20s to 25s
connectTimeout: 60000,    // From 45s to 60s
```

---

## 📋 What Each Error Means

| Error | Meaning | Fix |
|-------|---------|-----|
| `xhr poll error` | Polling request failed | Check backend is responding, increase timeout |
| `Invalid token` | JWT is bad | Clear localStorage and login again |
| `Cannot GET /socket.io/` | Socket.io not initialized | Restart backend |
| `Connection timed out` | No response from server | Check network, increase `connectTimeout` |
| `CORS error` | Frontend origin not allowed | Check `allowedOrigins` in backend `app.js` |

---

## 🎯 Test Real-Time Chat

Once Socket.io is connected:

1. **Open two browser windows** (same chat page)
2. **In window 1:** Send a message
3. **Expected in window 2:** Message appears immediately

If message doesn't appear:
- Socket is connected but broadcasts aren't working
- Check that `onNewMessage` listener is set up
- Check backend is calling `broadcastNewMessage()`

---

## 📞 What to Share if Still Broken

If it's still not working, share:

1. **Backend logs:**
   ```bash
   curl http://localhost:5050/socket-stats | jq
   ```

2. **Frontend console errors:**
   - Open DevTools → Console
   - Copy entire error message and stack trace

3. **Network tab screenshot:**
   - DevTools → Network tab
   - Reload page, filter by "socket.io"
   - Screenshot showing the requests

4. **Your environment:**
   ```
   Backend running on: http://localhost:5050 ?
   Frontend running on: http://localhost:3000 ?
   Backend: `npm run dev` (which command?)
   ```

---

## ✅ Success Indicators

When everything is working:

- ✅ `✅ Socket connected` in console
- ✅ `📡 Transport: websocket` (or polling is OK)
- ✅ Messages appear instantly in other windows
- ✅ No red error messages in console
- ✅ `/health` returns `"status": "ok"`
- ✅ `/socket-stats` shows connected clients

---

**Made changes? Restart backend with: `npm run dev`**
