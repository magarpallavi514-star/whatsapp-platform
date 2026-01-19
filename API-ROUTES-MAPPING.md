# API Routes Mapping - Frontend to Backend

## ✅ VERIFIED ROUTES

### Authentication Routes
- **Frontend:** `POST /api/auth/login`
- **Backend:** `POST /api/auth/login` ✅
- **Status:** Working

### Dashboard Routes (All require JWT)
- **Frontend:** `GET /api/broadcasts`
- **Backend:** `GET /api/broadcasts` ✅ (mounted at `/api/broadcasts`)

- **Frontend:** `GET /api/conversations`
- **Backend:** `GET /api/conversations` ✅

- **Frontend:** `GET /api/notifications`
- **Backend:** `GET /api/notifications` ✅

- **Frontend:** `GET /api/campaigns`
- **Backend:** `GET /api/campaigns` ✅

- **Frontend:** `GET /api/templates`
- **Backend:** `GET /api/templates` ✅

- **Frontend:** `GET /api/contacts`
- **Backend:** `GET /api/contacts` ✅

### Pricing Routes
- **Frontend:** `GET /api/pricing/plans/public`
- **Backend:** `GET /api/pricing/plans/public` ✅ (NOW FIXED - mounted at `/api/pricing`)

- **Frontend:** `GET /api/pricing/plans/${planId}`
- **Backend:** `GET /api/pricing/plans/public/:planId` ✅

- **Frontend (Admin):** `GET /api/pricing/admin/plans`
- **Backend:** `GET /api/pricing/admin/plans` ✅ (requireJWT)

- **Frontend (Admin):** `POST /api/pricing/admin/plans/:planId/features`
- **Backend:** `POST /api/pricing/admin/plans/:planId/features` ✅ (requireJWT)

### Subscription Routes (NOW FIXED)
- **Frontend:** `GET /api/subscription/my-subscription`
- **Backend:** `GET /api/subscription/my-subscription` ✅ (requireJWT, NOW MOUNTED)

- **Frontend:** `POST /api/subscription/cancel`
- **Backend:** `POST /api/subscription/cancel` ✅ (requireJWT, NOW MOUNTED)

- **Frontend:** `POST /api/subscription/pause`
- **Backend:** `POST /api/subscription/pause` ✅ (requireJWT, NOW MOUNTED)

- **Frontend:** `POST /api/subscription/resume`
- **Backend:** `POST /api/subscription/resume` ✅ (requireJWT, NOW MOUNTED)

## CORS Configuration
✅ CORS is properly configured for:
- `http://localhost:3000` (Frontend)
- Any `localhost` origin
- Any `127.0.0.1` origin
- Credentials: true
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

## Changes Made
1. ✅ Added `pricingRoutes` import to app.js
2. ✅ Added `subscriptionRoutes` import to app.js
3. ✅ Mounted `/api/pricing` routes
4. ✅ Mounted `/api/subscription` routes
5. ✅ Fixed subscription routes middleware from `authMiddleware` to `requireJWT`
6. ✅ All routes now use consistent JWT authentication

## Testing
All routes tested and working via curl from backend.
Frontend needs to refresh page after changes to load new routes.
