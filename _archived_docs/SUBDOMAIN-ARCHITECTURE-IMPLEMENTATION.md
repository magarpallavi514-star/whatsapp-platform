# Subdomain-Based Multi-Tenancy Architecture Implementation

**Status**: Backend foundation complete ✅  
**Checkpoint**: `stable-before-subdomain-architecture` (created at start)  
**Next**: Frontend implementation + route updates

---

## Phase Summary

### ✅ Phase 1: Backend Foundation (COMPLETED)

**1. Database Schema Update**
- ✅ Added `subdomain` field to Account model
- ✅ Added unique index on subdomain
- ✅ Subdomain validation regex: `[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?`

**2. Subdomain Detection Middleware**
- ✅ Created `/backend/src/middlewares/subdomainDetection.js`
- ✅ Extracts subdomain from hostname (e.g., `client-a.whatsapp-platform.com`)
- ✅ Looks up workspace by subdomain
- ✅ Stores `req.workspaceId` for all downstream routes
- ✅ Integrated into `app.js` (runs first, before all other middlewares)

**3. Authentication Updates**
- ✅ Updated login to include `workspaceId` in JWT token
- ✅ Updated signup to auto-generate subdomain for new accounts
- ✅ Subdomain generation logic:
  - Priority 1: Use company name (if provided)
  - Priority 2: Use first name (if provided)
  - Priority 3: Use email prefix
  - Fallback: Use account ID suffix
  - Handles duplicates by adding `-1`, `-2` suffixes

**4. Workspace Utility Functions**
- ✅ Created `/backend/src/utils/workspaceUtils.js`
- ✅ Provides reusable functions for:
  - Adding workspace filter to queries
  - Aggregation pipeline stage for workspace filtering
  - Validating workspace ownership
  - Middleware for workspace access validation
  - Safe delete/update operations

---

## 🔧 Phase 2: API Route Updates (NOT YET IMPLEMENTED)

**Files to modify** (8+ routes):

### Core Routes (HIGH PRIORITY)
1. **`/api/messages`** → `backend/src/routes/messageRoutes.js`
   - Update find: `Message.find(addWorkspaceFilter(query, req.workspaceId))`
   - Update create: Add `workspaceId: req.workspaceId` to new messages
   - Update delete: Use `deleteWithWorkspaceCheck(Message, {...}, req.workspaceId)`

2. **`/api/conversations`** → `backend/src/routes/conversationRoutes.js`
   - Same pattern as messages
   - Ensure all conversation queries filtered by workspaceId

3. **`/api/contacts`** → `backend/src/routes/contactRoutes.js`
   - Filter by workspace, not just account
   - Prevent one client from accessing another's contacts

4. **`/api/campaigns`** → `backend/src/routes/campaignRoutes.js`
   - Ensure campaigns only visible to their workspace

### Secondary Routes
5. **`/api/templates`** → `backend/src/routes/templateRoutes.js`
6. **`/api/broadcasts`** → `backend/src/routes/broadcastRoutes.js`
7. **`/api/chatbots`** → `backend/src/routes/chatbotRoutes.js`
8. **`/api/stats`** → `backend/src/routes/statsRoutes.js`

### Pattern for Each Route

**Before (current)**:
```javascript
router.get('/messages', requireJWT, async (req, res) => {
  const messages = await Message.find({ accountId: req.user.accountId });
  res.json({ messages });
});
```

**After (with workspace isolation)**:
```javascript
import { addWorkspaceFilter } from '../utils/workspaceUtils.js';

router.get('/messages', requireJWT, async (req, res) => {
  // Filter by both accountId AND workspaceId for maximum security
  const query = { accountId: req.user.accountId };
  const isolatedQuery = addWorkspaceFilter(query, req.workspaceId);
  
  const messages = await Message.find(isolatedQuery);
  res.json({ messages });
});

router.post('/messages', requireJWT, async (req, res) => {
  const newMessage = new Message({
    ...req.body,
    accountId: req.user.accountId,
    workspaceId: req.workspaceId,  // ✅ Always add workspace context
    sentBy: req.user.email
  });
  
  await newMessage.save();
  res.json({ message: newMessage });
});

router.delete('/messages/:id', requireJWT, async (req, res) => {
  const result = await Message.deleteOne(
    addWorkspaceFilter({ _id: req.params.id }, req.workspaceId)
  );
  
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  res.json({ success: true });
});
```

### Database Migration Needed

All existing documents need `workspaceId` field added:

```javascript
// backend/scripts/addWorkspaceIdToExistingDocs.js
import mongoose from 'mongoose';
import Account from '../src/models/Account.js';
import Message from '../src/models/Message.js';
import Contact from '../src/models/Contact.js';
// ... other models

async function migrate() {
  const accounts = await Account.find();
  
  for (const account of accounts) {
    // Update all documents for this account
    await Message.updateMany(
      { accountId: account.accountId, workspaceId: { $exists: false } },
      { $set: { workspaceId: account._id } }
    );
    
    await Contact.updateMany(
      { accountId: account.accountId, workspaceId: { $exists: false } },
      { $set: { workspaceId: account._id } }
    );
    
    // ... repeat for other collections
  }
  
  console.log('✅ Migration complete');
}

migrate().catch(console.error);
```

---

## 🎨 Phase 3: Frontend Implementation (NEXT)

### 3.1 Create Workspace Dynamic Routes

**Structure**:
```
frontend/app/
├── workspace/
│   ├── [workspaceId]/
│   │   ├── layout.tsx          (NEW - main workspace layout)
│   │   ├── dashboard/
│   │   │   └── page.tsx        (UPDATE - move from /dashboard)
│   │   ├── contacts/
│   │   │   └── page.tsx        (UPDATE - move from /contacts)
│   │   ├── campaigns/
│   │   │   └── page.tsx        (UPDATE - move from /campaigns)
│   │   ├── messages/
│   │   │   └── page.tsx        (UPDATE - move from /messages)
│   │   └── settings/
│   │       └── page.tsx        (UPDATE - move from /settings)
├── auth/
│   └── login/
│       └── page.tsx            (UPDATE - auto-detect subdomain)
└── ...
```

### 3.2 Login Page Update

**Goal**: Auto-detect subdomain and show workspace branding

```typescript
// frontend/app/auth/login/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>('Whatsapp Platform');
  
  useEffect(() => {
    // Extract subdomain from current URL
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const parts = host.split('.');
    
    if (parts.length > 1 && parts[0] !== 'www') {
      const sub = parts[0];
      setSubdomain(sub);
      
      // Convert subdomain to readable name
      // "client-a" → "Client A"
      const name = sub
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      setWorkspaceName(name);
    }
  }, []);
  
  return (
    <div className="login-container">
      <h1>{workspaceName} Platform</h1>
      <p>Login to your workspace</p>
      
      {/* Login form */}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
```

### 3.3 Workspace Layout

```typescript
// frontend/app/workspace/[workspaceId]/layout.tsx
'use client';

import { useParams } from 'next/navigation';

export default function WorkspaceLayout({ children }) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  return (
    <div className="workspace-layout">
      {/* Sidebar with workspace context */}
      <Sidebar workspaceId={workspaceId} />
      
      {/* Main content */}
      <main className="workspace-content">
        {children}
      </main>
    </div>
  );
}
```

### 3.4 API Call Updates

```typescript
// frontend/lib/api.ts
export const apiClient = {
  get: async (url: string, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return response.json();
  },
  
  post: async (url: string, data?: any, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return response.json();
  }
};

// Usage in components
const messages = await apiClient.get('/api/messages');
// workspaceId is automatically added by backend middleware!
```

---

## 🔐 Security Guarantees

### Data Isolation

| Layer | Security Measure |
|-------|------------------|
| **DNS** | Wildcard records route subdomains to same server |
| **Subdomain Detection** | Middleware extracts and validates subdomain |
| **Workspace Lookup** | Backend finds Account document by subdomain |
| **JWT Token** | Token contains `workspaceId` for every request |
| **Query Filtering** | Every DB query adds `workspaceId: {...}` filter |
| **Validation** | User's token workspace must match request workspace |

### Attack Prevention

```
❌ Attacker tries: GET /api/messages?workspaceId=other-client
✅ Backend ignores URL param, uses token's workspaceId instead

❌ Attacker tries: Access other-client.domain.com with stolen token
✅ Token's workspaceId won't match URL's workspaceId, access denied

❌ Attacker tries: Craft JWT with different workspaceId
✅ JWT is signed with SECRET, token tampering detected immediately
```

---

## 📋 Implementation Checklist

### Backend (This Session)
- ✅ Add subdomain to Account schema
- ✅ Create subdomain detection middleware
- ✅ Update auth controller with workspaceId
- ✅ Create workspace utility functions
- ❌ Update all API routes with workspace filtering (MANUAL - 8+ files)
- ❌ Run database migration for existing documents

### Frontend (Next Session)
- ❌ Create /workspace/[workspaceId] routes
- ❌ Update login page with subdomain detection
- ❌ Create workspace layout
- ❌ Update all API calls with proper headers
- ❌ Test multi-workspace login

### Deployment
- ❌ Add wildcard DNS record
- ❌ Verify SSL certificate covers wildcards
- ❌ Deploy backend changes
- ❌ Deploy frontend changes
- ❌ Test with multiple subdomains

---

## 🚀 Testing Strategy

### Test Case 1: Multiple Clients Login
```
1. Open client-a.whatsapp-platform.com/auth/login
2. Login with client-a account
3. Verify redirect to /workspace/[clientA-id]/dashboard
4. Check messages show only client-a data

5. Open client-b.whatsapp-platform.com/auth/login
6. Login with client-b account
7. Verify redirect to /workspace/[clientB-id]/dashboard
8. Check messages show only client-b data (not client-a)
```

### Test Case 2: Data Isolation
```
1. Login as client-a
2. Try to access: /api/messages?workspaceId=client-b-id
3. Backend ignores query param, uses token's workspaceId
4. Verify returns only client-a messages, not client-b
```

### Test Case 3: Custom Subdomain Access
```
1. User signs up with company="Acme Corp"
2. System generates subdomain="acme-corp"
3. Open acme-corp.whatsapp-platform.com
4. Verify login page shows "Acme Corp Platform"
5. Verify user can login and access their workspace
```

---

## 📖 Documentation References

- **Subdomain Detection**: `/backend/src/middlewares/subdomainDetection.js` (142 lines)
- **Workspace Utilities**: `/backend/src/utils/workspaceUtils.js` (180 lines)
- **Auth Controller Updates**: `/backend/src/controllers/authController.js` (updated)
- **Account Schema**: `/backend/src/models/Account.js` (updated with subdomain field)

---

## ⚠️ Known Limitations (Current)

1. **API Routes Not Yet Updated**: Messages, contacts, campaigns routes still use `accountId` only
   - Fix: Apply workspace filter utility to each route (estimated 30 minutes per route)

2. **Existing Documents**: Old database records don't have `workspaceId` field
   - Fix: Run migration script to populate workspaceId for all existing documents

3. **Frontend Routes Not Created**: Still using flat `/dashboard`, `/contacts` paths
   - Fix: Create workspace-based routing in Phase 3

4. **Subdomain Required**: Current setup requires subdomain to work
   - Future: Support both subdomain and single URL with workspace ID in JWT

---

## 📞 Next Steps

**Immediate** (Blocking):
1. ✅ Commit current backend changes
2. ⏳ (Manual) Update API routes with workspace filtering (8+ files)
3. ⏳ (Manual) Run database migration for existing documents
4. ⏳ Create frontend workspace routes

**Soon** (High Priority):
1. Add DNS wildcard record configuration
2. Frontend login page subdomain detection
3. Test multi-workspace data isolation
4. Deploy to production

**Future** (Can defer):
1. Custom domain support for enterprise clients
2. Workspace switcher in sidebar (if user has multiple workspaces)
3. Team member management within workspace
4. Workspace billing/pricing per seat

---

**Checkpoint**: `stable-before-subdomain-architecture` (git tag)  
**Next Checkpoint**: `stable-with-subdomain-architecture` (after frontend complete)
