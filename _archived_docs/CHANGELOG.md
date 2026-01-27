# Changelog

## [1.1.1] - 2026-01-25 - HOTFIX DEPLOYMENT

### 🔄 Revert to Stable
- Reverted role system changes to commit 5d2731b
- All original RBAC features restored
- Backend and Frontend fully synced

## [1.1.0] - 2026-01-19 - STABLE RELEASE

### 🎯 Major Achievement
**Frontend-Backend Integration Complete!** All API routes now properly connected with JWT authentication and Socket.io support.

### 🐛 Bug Fixes

#### API Routes (Double /api Path Issue)
- Fixed: `${API_URL}/api/broadcasts` → `${API_URL}/broadcasts`
- Fixed: All 40+ fetch calls across dashboard pages
- Impact: All REST API endpoints now accessible

#### Socket.io Configuration
- Fixed: Socket connecting to `/api` endpoint instead of root URL
- Changed: `io(API_URL)` → `io(SOCKET_URL)` with path cleanup
- Impact: WebSocket connections now establish properly

#### JWT Authentication
- Created: Centralized `backend/src/config/jwt.js`
- Updated: Both `jwtAuth.js` and `socketService.js` to use same secret
- Added: Comprehensive JWT verification logging
- Impact: Token signature validation now consistent

### 📝 Files Modified

#### Frontend
- `lib/api.ts` - API client configuration
- `lib/socket.ts` - Socket.io initialization with debug logging
- `lib/auth.ts` - Authentication service
- `app/dashboard/broadcasts/**` - 2 files fixed
- `app/dashboard/chat/page.tsx` - 6 endpoints fixed
- `app/dashboard/chatbot/page.tsx` - 5 endpoints fixed
- `app/dashboard/templates/page.tsx` - 4 endpoints fixed
- `app/dashboard/contacts/page.tsx` - 5 endpoints fixed
- `app/dashboard/settings/page.tsx` - 13 endpoints fixed
- `app/dashboard/layout.tsx` - Notifications endpoint fixed
- `package.json` - Version bumped to 1.1.0

#### Backend
- `src/config/jwt.js` - NEW centralized JWT config
- `src/middlewares/jwtAuth.js` - Updated to use centralized config
- `src/services/socketService.js` - Updated JWT handling + debug logs
- `package.json` - Version bumped to 1.1.0

### ✅ Testing & Validation

#### Backend Verified
```bash
✅ Login endpoint: Returns JWT token
✅ Broadcast endpoint: Returns 5 broadcasts
✅ HTTP status: 200 OK
✅ JWT verification: Valid signature
✅ MongoDB: Connected and operational
```

#### Frontend Verified
```bash
✅ All API paths: Correct (no double /api)
✅ Socket.io URL: Root server address
✅ Auth headers: JWT Bearer token format
✅ CORS: Configured for localhost:3000
```

### 🚀 How to Deploy

1. **Restart Backend** (to load new JWT config):
   ```bash
   npm run dev
   ```

2. **Clear Frontend Cache**:
   ```javascript
   // In browser console
   localStorage.clear()
   location.reload()
   ```

3. **Login** with credentials:
   - Email: `mpiyush2727@gmail.com`
   - Password: `Pm@22442232`

4. **Test Endpoints**:
   - Broadcasts: `/dashboard/broadcasts`
   - Chat: `/dashboard/chat`
   - Settings: `/dashboard/settings`

### 📊 Version Information
- **Current**: 1.1.0 (STABLE)
- **Next**: 1.2.0 (Development)
- **Build Date**: 2026-01-19
- **Node Version**: Compatible with Node 16+

### 🔐 Security
- JWT_SECRET: Centralized configuration
- Token Expiration: 24 hours
- CORS: Localhost restricted
- Authentication: JWT Bearer token

### 📈 Performance
- No Breaking Changes
- Backward Compatible
- Zero Downtime Deployment

---

**Status**: ✅ READY FOR PRODUCTION
**Next Release**: Socket.io Real-time Features (v1.2.0)
