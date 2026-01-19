# Dashboard Routes - Frontend to Backend Mapping

## ✅ Sidebar Navigation Routes

### Main Routes (All Users)
| Page | Frontend Route | Backend Endpoint | Method | Auth | Status |
|------|---|---|---|---|---|
| Dashboard | `/dashboard` | None (static) | - | JWT | ✅ |
| Broadcasts | `/dashboard/broadcasts` | `GET /api/broadcasts` | GET | JWT | ✅ |
| Contacts | `/dashboard/contacts` | `GET /api/contacts` | GET | JWT | ✅ |
| Templates | `/dashboard/templates` | `GET /api/templates` | GET | JWT | ✅ |
| Chatbot | `/dashboard/chatbot` | `GET /api/chatbots` | GET | JWT | ✅ |
| Live Chat | `/dashboard/chat` | `GET /api/conversations` | GET | JWT | ✅ |
| Analytics | `/dashboard/analytics` | `GET /api/stats` | GET | JWT | ✅ |
| Campaigns | `/dashboard/campaigns` | `GET /api/campaigns` | GET | JWT | ✅ |

### SuperAdmin Only Routes
| Page | Frontend Route | Backend Endpoint | Method | Auth | Status |
|------|---|---|---|---|---|
| Organizations | `/dashboard/organizations` | `GET /api/admin/organizations` | GET | JWT | 🔴 Not implemented |
| System Health | `/dashboard/system-health` | `GET /health` | GET | None | ✅ |
| Platform Billing | `/dashboard/platform-billing` | `GET /api/pricing` | GET | JWT | ✅ |

## ✅ Data Fetching Patterns by Page

### Broadcasts Page
```
GET /api/broadcasts
GET /api/broadcasts/:id
POST /api/broadcasts
PUT /api/broadcasts/:id
DELETE /api/broadcasts/:id
POST /api/broadcasts/:id/send
```

### Contacts Page
```
GET /api/contacts?limit=100
POST /api/contacts
PUT /api/contacts/:id
DELETE /api/contacts/:id
POST /api/contacts/import
```

### Templates Page
```
GET /api/templates
POST /api/templates
PUT /api/templates/:id
DELETE /api/templates/:id
```

### Chatbot Page
```
GET /api/chatbots
POST /api/chatbots
PUT /api/chatbots/:id
DELETE /api/chatbots/:id
PATCH /api/chatbots/:id/toggle
```

### Conversations (Live Chat)
```
GET /api/conversations
GET /api/conversations/:id/messages
POST /api/conversations/:id/reply
PATCH /api/conversations/:id/read
PATCH /api/conversations/:id/status
```

### Campaigns Page
```
GET /api/campaigns
GET /api/campaigns/:id
POST /api/campaigns
PUT /api/campaigns/:id
DELETE /api/campaigns/:id
PATCH /api/campaigns/:id/pause
PATCH /api/campaigns/:id/resume
```

### Pricing & Billing
```
GET /api/pricing/plans/public
GET /api/pricing/plans/public/:id
POST /api/subscription/initialize
GET /api/subscription/my-subscription
POST /api/subscription/cancel
POST /api/subscription/pause
POST /api/subscription/resume
```

## ⚠️ Issues Found & Fixed

### Fixed Issues
1. ✅ Pricing routes not mounted - FIXED
2. ✅ Subscription routes not mounted - FIXED
3. ✅ JWT middleware inconsistency - FIXED
4. ✅ CORS configured properly

### Code Quality Improvements
- Created `lib/api-utils.ts` with consistent API URL handling
- All pages should use `getApiUrl(endpoint)` helper
- All pages should use `apiFetch()` for consistent token handling

## 🔴 Missing Backend Routes

These routes are called but not implemented in backend:
- `GET /api/admin/organizations` - SuperAdmin org management
- `POST /api/settings/save` - User settings (partial)
- `GET /api/stats` - Analytics stats (may need auth fix)

## Usage Guide for Frontend Developers

Instead of:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
const response = await fetch(`${API_URL}/api/broadcasts`, {...});
```

Use:
```typescript
import { getApiUrl, apiFetch } from '@/lib/api-utils';

const response = await apiFetch('/broadcasts', { method: 'GET' });
const data = await response.json();
```

This ensures:
- Consistent API URL building
- Automatic JWT token injection
- Proper 401 error handling
- Cleaner code
