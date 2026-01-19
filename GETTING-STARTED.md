# 🚀 Getting Servers Running - Troubleshooting Guide

**Date:** January 19, 2026  
**Goal:** Get both backend (5050) and frontend (3000) running with zero errors  

---

## ⚡ Quick Start (Copy & Paste)

### Open Terminal 1 - Backend
```bash
cd /Users/mpiyush/Documents/pixels-whatsapp-platform/whatsapp-platform/backend
npm run dev
```

**Expected Output:**
```
==================================================
🚀 Server is running on port 5050
📍 Local: http://localhost:5050
🌍 Environment: development
🔌 WebSocket (Socket.io) enabled
==================================================
```

### Open Terminal 2 - Frontend
```bash
cd /Users/mpiyush/Documents/pixels-whatsapp-platform/whatsapp-platform/frontend
npm run dev
```

**Expected Output:**
```
> whatsapp@0.1.0 dev
> next dev

  ▲ Next.js 16.1.1

  ○ Ready in 2.5s
  ✓ Compiled successfully
  
  Local:        http://localhost:3000
```

---

## ✅ Verification Checklist

After both servers start, verify:

### Backend Verification
1. Open browser: `http://localhost:5050`
   - Should see: `{"message":"🚀 WhatsApp Platform API is running!"}`

2. Check health: `http://localhost:5050/health`
   - Should see: `{"status":"OK","message":"Server is healthy"}`

3. Check database: `http://localhost:5050/api/test-db`
   - Should see: `{"status":"success","message":"✅ Database connected successfully!"}`

### Frontend Verification
1. Open browser: `http://localhost:3000`
   - Should see: Landing page or redirect to login

2. Try login: `http://localhost:3000/login`
   - Should see: Login form

---

## 🔧 Common Issues & Fixes

### Issue 1: Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5050
```

**Solution:**
```bash
# Find what's using port 5050
lsof -i :5050

# Kill it
kill -9 <PID>

# Or for port 3000
lsof -i :3000
kill -9 <PID>
```

---

### Issue 2: Dependencies Not Installed

**Error Message:**
```
Cannot find module 'express'
Cannot find module 'next'
```

**Solution:**
```bash
# Backend
cd backend
npm install --force

# Frontend
cd frontend
npm install --force
```

---

### Issue 3: MongoDB Connection Failed

**Error Message:**
```
❌ Failed to connect to MongoDB
MongooseError: Cannot connect to mongodb
```

**Solution:**

Check `.env` in backend folder:
```bash
cat backend/.env | grep MONGODB
```

Should have:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

If missing or wrong:
1. Get correct MongoDB connection string
2. Edit `backend/.env`
3. Restart backend server

---

### Issue 4: Picomatch Error (Frontend)

**Error Message:**
```
Invalid package config /node_modules/next/dist/compiled/picomatch/package.json
```

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --force
npm run dev
```

---

### Issue 5: CORS Error

**Error Message:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

Frontend `.env.local` should have:
```
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

Check it:
```bash
cat frontend/.env.local
```

If missing, add it and restart frontend.

---

### Issue 6: 401 Unauthorized Errors

**Error Message:**
```
401 Unauthorized
Invalid token
```

**Solution:**

1. Clear browser storage:
   - Open DevTools (F12)
   - Application → Local Storage → Clear All

2. Log out and log back in:
   - Go to `http://localhost:3000/login`
   - Use valid credentials
   - Try API call again

---

### Issue 7: Cannot Login

**Error Message:**
```
Login failed
Invalid credentials
```

**Solution:**

Check test user exists in database:
```bash
# In backend folder
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(() => {
  const db = mongoose.connection.db;
  db.collection('users').findOne({ email: 'admin@example.com' }).then(user => {
    console.log('User found:', user ? 'YES' : 'NOT FOUND');
    process.exit(0);
  });
});
"
```

If not found, create test user:
```bash
# Create test user
node backend/create-test-data.js
```

Then try login with:
```
Email: admin@example.com
Password: password123
```

---

### Issue 8: Node Version Problems

**Error Message:**
```
No such file or directory
Module not found
```

**Solution:**

Check Node version:
```bash
node --version  # Should be 16.x or higher
npm --version   # Should be 7.x or higher
```

If too old:
```bash
# Install Node 18 or higher
# Visit: https://nodejs.org/
# Or use NVM:
nvm install 18
nvm use 18
```

---

### Issue 9: Environment Variables Not Loading

**Error Message:**
```
process.env.MONGODB_URI is undefined
process.env.PORT is undefined
```

**Solution:**

1. Backend `.env` exists:
```bash
ls -la backend/.env
```

2. Frontend `.env.local` exists:
```bash
ls -la frontend/.env.local
```

3. Required variables in backend/.env:
```
PORT=5050
MONGODB_URI=your_connection_string
NODE_ENV=development
```

4. Required variables in frontend/.env.local:
```
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

After editing, restart servers.

---

### Issue 10: Socket.io Errors

**Error Message:**
```
WebSocket connection failed
Socket.io connection error
```

**Solution:**

This is expected during development. Verify:
1. Backend is running (websocket server active)
2. Frontend can see socket.io script loaded
3. Check browser DevTools → Application → WebSockets

Not critical for basic testing, full chat requires socket connection.

---

## 🧪 Advanced Testing

### Test Backend API Directly

```bash
# Test login
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Should return:
# {"success":true,"token":"eyJhbGc...","user":{...}}
```

### Test Frontend API Client

Open browser console (F12) and run:
```javascript
// Import API client
import { api } from '/lib/api.ts';

// Try login
const result = await api.login('admin@example.com', 'password123');
console.log(result);

// Get contacts (if logged in)
const contacts = await api.getContacts();
console.log(contacts);
```

---

## 📋 Startup Checklist

- [ ] Backend `.env` exists with MONGODB_URI
- [ ] Frontend `.env.local` exists with NEXT_PUBLIC_API_URL
- [ ] Node 16+ installed
- [ ] npm 7+ installed
- [ ] Port 5050 not in use
- [ ] Port 3000 not in use
- [ ] MongoDB running and accessible
- [ ] No `node_modules` permission errors

---

## 🎯 Terminal Setup (Recommended)

### Using iTerm2 or Split Terminal

**Terminal 1:**
```bash
cd backend && npm run dev
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

**Terminal 3:**
```bash
# Monitor logs
tail -f backend/.env
```

---

## ⚡ One-Command Start

```bash
cd /Users/mpiyush/Documents/pixels-whatsapp-platform/whatsapp-platform
./start.sh
```

This script:
- ✅ Installs dependencies if needed
- ✅ Starts backend on 5050
- ✅ Starts frontend on 3000
- ✅ Shows both logs
- ✅ Manages both processes

---

## 🛑 Stopping Servers

```bash
# Stop all Node processes
killall node

# Or individually
# Press Ctrl+C in each terminal
```

---

## 📊 What Each Server Should Do

### Backend (Port 5050)
- ✅ Connect to MongoDB
- ✅ Start HTTP server
- ✅ Initialize Socket.io
- ✅ Load all routes
- ✅ Setup CORS
- ✅ Log startup message

### Frontend (Port 3000)
- ✅ Compile Next.js
- ✅ Setup dev server
- ✅ Load environment variables
- ✅ Ready for hot reload
- ✅ Show "Ready" message

---

## 🔍 Debugging Tips

### Enable Verbose Logging
```bash
# Backend
DEBUG=* npm run dev

# Frontend
npm run dev -- --verbose
```

### Check What's Running
```bash
# What processes on port 5050?
lsof -i :5050

# What processes on port 3000?
lsof -i :3000

# All Node processes
ps aux | grep node
```

### Clear Cache & Restart
```bash
# Backend
cd backend
rm -rf node_modules
npm cache clean --force
npm install
npm run dev

# Frontend
cd frontend
rm -rf node_modules .next
npm cache clean --force
npm install
npm run dev
```

---

## ✅ Success Indicators

You're good to go when you see:

**Backend Terminal:**
```
==================================================
🚀 Server is running on port 5050
📍 Local: http://localhost:5050
🌍 Environment: development
🔌 WebSocket (Socket.io) enabled for real-time chat
==================================================
```

**Frontend Terminal:**
```
  ▲ Next.js 16.1.1
  ✓ Compiled successfully
  Local:        http://localhost:3000
```

**Browser:**
- http://localhost:3000 loads
- Login page visible
- No console errors
- Network requests to http://localhost:5050 succeed

---

## 📞 Still Having Issues?

1. **Check logs carefully** - Error messages usually tell you what's wrong
2. **Google the error** - Search exact error message
3. **Check port conflicts** - `lsof -i :<port>`
4. **Try from scratch** - Delete node_modules and reinstall
5. **Check MongoDB** - Ensure connection string is correct
6. **Restart everything** - Sometimes it just needs a restart

---

## 🎉 Ready to Start?

Run this now:

```bash
cd /Users/mpiyush/Documents/pixels-whatsapp-platform/whatsapp-platform

# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Then visit: **http://localhost:3000**

---

**Last Updated:** January 19, 2026  
**Status:** All systems ready for testing  
**Support:** Check logs and error messages for clues
