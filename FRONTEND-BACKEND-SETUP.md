# 🔗 Frontend-Backend API Integration Setup

## Current Status: ✅ Ready to Connect

Your backend is fully operational with:
- ✅ All API routes configured
- ✅ JWT authentication ready
- ✅ MongoDB database connected
- ✅ Socket.io for real-time chat
- ✅ CORS configured for localhost

Your frontend has:
- ✅ API client service created (`lib/api.ts`)
- ✅ Custom hooks for API calls (`lib/use-api.ts`)
- ✅ Auth context provider (`lib/auth-context.tsx`)
- ✅ Protected routes component
- ✅ Existing auth service with JWT support

---

## 🚀 Getting Started

### Step 1: Start Backend Server

```bash
cd backend
npm install  # if not done already
npm run dev  # or node server.js
```

You should see:
```
==================================================
🚀 Server is running on port 5050
📍 Local: http://localhost:5050
🌍 Environment: development
🔌 WebSocket (Socket.io) enabled for real-time chat
==================================================
```

### Step 2: Start Frontend Dev Server

```bash
cd frontend
npm install  # if not done already
npm run dev
```

Frontend will be at: `http://localhost:3000`

### Step 3: Environment Variables

Frontend `.env.local` should have:
```env
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

Backend `.env` should have:
```env
PORT=5050
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

---

## 📡 API Endpoints Available

### Authentication
```
POST   /api/auth/login      - Login user
POST   /api/auth/logout     - Logout user
GET    /api/auth/me         - Get current user (requires JWT)
```

### Contacts (Requires JWT)
```
GET    /api/contacts        - Get all contacts
POST   /api/contacts        - Create contact
PUT    /api/contacts/:id    - Update contact
DELETE /api/contacts/:id    - Delete contact
POST   /api/contacts/import - Import contacts from CSV
```

### Broadcasts (Requires JWT)
```
GET    /api/broadcasts      - Get all broadcasts
POST   /api/broadcasts      - Create broadcast
PUT    /api/broadcasts/:id  - Update broadcast
DELETE /api/broadcasts/:id  - Delete broadcast
POST   /api/broadcasts/:id/send - Send broadcast
```

### Templates (Requires JWT)
```
GET    /api/templates       - Get all templates
POST   /api/templates       - Create template
PUT    /api/templates/:id   - Update template
DELETE /api/templates/:id   - Delete template
```

### Conversations (Requires JWT)
```
GET    /api/conversations        - Get all conversations
GET    /api/conversations/:id/messages - Get conversation messages
POST   /api/messages/send        - Send message
```

### Stats (Requires API Key or JWT)
```
GET    /api/stats           - Get dashboard statistics
```

### More Routes Available
- `/api/campaigns` - Campaign management
- `/api/account` - Account management
- `/api/settings` - User settings
- `/api/notifications` - Notifications

---

## 🔐 Authentication Flow

### Login Process

1. **User submits login form**
   ```tsx
   const { error } = await api.login(email, password);
   ```

2. **Backend returns JWT token**
   ```json
   {
     "success": true,
     "token": "eyJhbGc...",
     "user": {
       "id": "123",
       "email": "user@example.com",
       "role": "admin"
     }
   }
   ```

3. **Frontend stores token in localStorage**
   ```javascript
   localStorage.setItem('auth_token', token);
   ```

4. **API client automatically attaches token to requests**
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```

5. **Protected routes check authentication**
   ```tsx
   if (!authService.isAuthenticated()) {
     router.push('/login');
   }
   ```

---

## 💻 Using the API Client

### Simple Usage

```typescript
import { api } from '@/lib/api';

// Get all contacts
const { contacts, error } = await api.getContacts();

// Create contact
const { contact, error } = await api.createContact({
  name: 'John Doe',
  phone: '+911234567890',
  email: 'john@example.com'
});

// Update contact
const { contact, error } = await api.updateContact('contactId', {
  name: 'Jane Doe'
});

// Delete contact
const { success, error } = await api.deleteContact('contactId');
```

### Using Custom Hooks (Recommended)

```typescript
'use client';
import { useContacts, useBroadcasts, useTemplates } from '@/lib/use-api';

export default function MyComponent() {
  const { contacts, isLoading, error, fetchContacts, createContact } = useContacts();

  useEffect(() => {
    fetchContacts(); // Fetch on mount
  }, []);

  const handleAddContact = async () => {
    const { contact } = await createContact({
      name: 'New Contact',
      phone: '+911234567890'
    });
    if (contact) {
      // Contact added successfully, contacts state updated automatically
    }
  };

  return (
    <div>
      {isLoading ? 'Loading...' : `${contacts.length} contacts`}
      {error && <p className="text-red-600">{error}</p>}
      <button onClick={handleAddContact}>Add Contact</button>
    </div>
  );
}
```

---

## 🧪 Testing the Connection

### Test 1: Login
```bash
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Test 2: Get Contacts (with JWT token)
```bash
curl http://localhost:5050/api/contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test 3: Create Contact
```bash
curl -X POST http://localhost:5050/api/contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Contact",
    "phone":"+911234567890",
    "email":"test@example.com"
  }'
```

---

## 🔄 Frontend Integration Checklist

### Phase 1: Dashboard Pages (Do This First)
- [ ] Update `/dashboard/contacts` to use `useContacts()` hook
- [ ] Update `/dashboard/broadcasts` to use `useBroadcasts()` hook
- [ ] Update `/dashboard/templates` to use `useTemplates()` hook
- [ ] Update `/dashboard/chat` to use `useConversations()` hook
- [ ] Update `/dashboard/analytics` to use `useStats()` hook

### Phase 2: Features
- [ ] Add create/edit modals for contacts
- [ ] Add broadcast create/send functionality
- [ ] Add template sync from WhatsApp
- [ ] Add real-time messaging with Socket.io
- [ ] Add export/import for contacts

### Phase 3: Polish
- [ ] Add loading states to all pages
- [ ] Add error boundaries
- [ ] Add success notifications
- [ ] Implement pagination for large datasets
- [ ] Add search/filter functionality

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'api'"
**Solution**: Make sure `lib/api.ts` exists and is properly imported

### Issue: CORS Error
**Solution**: Backend CORS is configured for localhost. Check that `NEXT_PUBLIC_API_URL=http://localhost:5050/api`

### Issue: 401 Unauthorized
**Solution**: Token not attached. Check that `localStorage.getItem('auth_token')` returns a value

### Issue: "Database not connected"
**Solution**: Check MongoDB connection string in `.env`. Run: `npm run dev` in backend

### Issue: Real-time chat not working
**Solution**: Socket.io is running. Check WebSocket connections in browser DevTools

---

## 📋 Implementation Template for Dashboard Pages

Here's a template to update any dashboard page:

```typescript
'use client';

import { useEffect } from 'react';
import { useContacts } from '@/lib/use-api'; // or useBroadcasts, useTemplates, etc.
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { contacts, isLoading, error, fetchContacts } = useContacts();

  useEffect(() => {
    fetchContacts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Contacts ({contacts.length})</h1>
      {/* Your UI here */}
    </div>
  );
}
```

---

## 🎯 Next Steps

1. **Start both servers** (backend on 5050, frontend on 3000)
2. **Test login** at http://localhost:3000/login
3. **Update dashboard pages** one by one using the custom hooks
4. **Test with real client data**
5. **Deploy when ready**

---

## 📞 Need Help?

If API calls fail:
1. Check browser console for errors
2. Check backend terminal for logs
3. Verify JWT token in localStorage
4. Test endpoint directly with cURL
5. Check MongoDB connection status at `http://localhost:5050/api/test-db`
