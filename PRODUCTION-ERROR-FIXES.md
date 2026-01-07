# 🚨 Production Error Fixes & Solutions

## ❌ Error: Railway Server Crash on Deploy

### Root Cause
**Socket.io initialization was mixing ES6 imports with CommonJS require**, causing the server to crash in production environment.

### Location
`backend/src/services/socketService.js` - Line 10

### ❌ Problem Code
```javascript
import jwt from 'jsonwebtoken';

export const initSocketIO = (server) => {
  const { Server } = require('socket.io');  // ❌ Mixed module syntax
  // ...
}
```

### ✅ Solution
Use consistent ES6 import syntax:

```javascript
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';  // ✅ ES6 import

export const initSocketIO = (server) => {
  // Now Server is directly available
  const io = new Server(server, { /* config */ });
  // ...
}
```

### Status
✅ **FIXED** - Committed on 7 Jan 2026

---

## 📋 Production Deployment Checklist

### Before Deploying to Railway:

- [x] All environment variables set in Railway dashboard
- [x] MongoDB Atlas allows Railway IP (0.0.0.0/0)
- [x] Socket.io uses consistent ES6 imports
- [x] CORS configured for frontend domain
- [x] JWT_SECRET set in environment
- [x] All API keys hashed and stored securely
- [x] Meta webhook URL points to Railway domain
- [x] Database backup taken

---

## 🔍 Common Production Errors & Fixes

### 1. **Socket.io Server Crash**
- **Error**: `Cannot find module 'socket.io'` or undefined module
- **Cause**: Mixed require/import syntax
- **Fix**: Use consistent ES6 imports
- **Status**: ✅ FIXED

### 2. **Database Connection Timeout**
- **Error**: `MongooseError: Unable to connect`
- **Cause**: MongoDB Atlas IP whitelist
- **Fix**: Add Railway IP to MongoDB Atlas > Network Access
- **Check**: `0.0.0.0/0` or specific Railway IP range

### 3. **CORS Errors on Frontend**
- **Error**: `Access to XMLHttpRequest blocked by CORS policy`
- **Cause**: Frontend URL not in CORS whitelist
- **Fix**: Add Vercel URL to `backend/src/app.js`
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://whatsapp-platform-nine.vercel.app',
  'https://mpiyush15-whatsapp-platform.vercel.app'
].filter(Boolean);
```

### 4. **JWT Authentication Fails**
- **Error**: `401 Unauthorized`
- **Cause**: JWT_SECRET not set or token expired
- **Fix**: Verify JWT_SECRET in Railway environment variables

### 5. **Webhook Verification Fails**
- **Error**: `401` on Meta webhook callback
- **Cause**: Incorrect verify token
- **Fix**: Ensure `META_VERIFY_TOKEN` matches Meta app settings
- **Default**: `pixels_webhook_secret_2025`

---

## 📊 Production Monitoring

### Health Check
```bash
curl https://YOUR-RAILWAY-URL.railway.app/health
```
Expected response: `{"status":"OK"}`

### Database Test
```bash
curl https://YOUR-RAILWAY-URL.railway.app/api/test-db
```
Expected: List of MongoDB collections

### API Test
```bash
curl https://YOUR-RAILWAY-URL.railway.app/api/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Recent Fixes Applied

| Date | Fix | Commit |
|------|-----|--------|
| 7 Jan 2026 | Fix Socket.io import (ES6) | 7e167c6 |
| 7 Jan 2026 | Fix TypeScript error - prevContactId | 549dde1 |
| 7 Jan 2026 | Add WebSocket real-time chat | 6c4c597 |

---

## 📞 Next Steps

1. Monitor Railway logs after redeployment
2. Test all endpoints with JWT tokens
3. Verify webhook messages are received
4. Check Socket.io connections in browser console
5. Monitor database performance

---

## 🆘 Emergency Rollback

If production is down:
```bash
# Rollback to previous commit
git revert 7e167c6
git push origin main

# Or checkout previous version
git reset --hard 549dde1
git push origin main --force
```
