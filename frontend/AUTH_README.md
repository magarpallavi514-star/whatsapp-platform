# Authentication & Role-Based Access Control

## Overview
The dashboard implements a role-based authentication system with different access levels for users.

## User Roles

### 1. **Admin** (`admin`)
- Full access to all dashboard features
- Can access: Dashboard, Broadcasts, Contacts, Templates, Chatbot, Live Chat, Analytics, Campaigns, Settings

### 2. **Manager** (`manager`)
- Access to most features except some advanced settings
- Can access: Dashboard, Broadcasts, Contacts, Templates, Chatbot, Live Chat, Analytics, Campaigns, Settings

### 3. **Agent** (`agent`)
- Limited access for customer support agents
- Can access: Dashboard, Broadcasts, Contacts, Live Chat, Settings

### 4. **User** (`user`)
- Basic access
- Can access: Dashboard, Settings

## Demo Accounts

For testing purposes, use these email addresses:

| Email | Role | Access Level |
|-------|------|--------------|
| `admin@test.com` | Admin | Full Access |
| `manager@test.com` | Manager | Manager Access |
| `agent@test.com` | Agent | Agent Access |
| `user@test.com` | User | Basic Access |

**Password:** Any password (for demo purposes)

## How It Works

### 1. Authentication Flow
1. User enters email and password on `/login` page
2. `authService.login()` validates credentials (currently mock)
3. User role is determined based on email
4. User data is stored in localStorage
5. User is redirected to `/dashboard`

### 2. Route Protection
- All dashboard routes are wrapped in `<ProtectedRoute>` component
- Component checks if user is authenticated
- Redirects to `/login` if not authenticated
- Checks role-based permissions for specific routes
- Redirects to `/dashboard` if user lacks required permissions

### 3. Navigation Filtering
- Sidebar navigation items are filtered based on user role
- Users only see menu items they have permission to access

## Files Structure

```
frontend/
├── app/
│   ├── login/
│   │   └── page.tsx                 # Login page
│   └── dashboard/
│       ├── layout.tsx               # Protected layout with sidebar
│       ├── page.tsx                 # Dashboard home
│       ├── broadcasts/page.tsx      # Broadcasts page
│       ├── contacts/page.tsx        # Contacts page
│       ├── templates/page.tsx       # Templates page
│       ├── chatbot/page.tsx         # Chatbot page
│       ├── chat/page.tsx            # Live chat page
│       ├── analytics/page.tsx       # Analytics page
│       ├── campaigns/page.tsx       # Campaigns page
│       └── settings/page.tsx        # Settings page
├── components/
│   └── ProtectedRoute.tsx           # Auth wrapper component
└── lib/
    └── auth.ts                      # Auth service & permissions
```

## Permissions Configuration

Edit `frontend/lib/auth.ts` to modify permissions:

```typescript
export const permissions = {
  canAccessBroadcasts: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT],
  canAccessContacts: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT],
  canAccessTemplates: [UserRole.ADMIN, UserRole.MANAGER],
  canAccessChatbot: [UserRole.ADMIN, UserRole.MANAGER],
  canAccessChat: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT],
  canAccessAnalytics: [UserRole.ADMIN, UserRole.MANAGER],
  canAccessCampaigns: [UserRole.ADMIN, UserRole.MANAGER],
  canAccessSettings: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT, UserRole.USER],
}
```

## Integrating with Real API

To connect with your backend API, update `frontend/lib/auth.ts`:

1. **Replace mock login** with API call:
```typescript
login: async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("user", JSON.stringify(data.user))
      return { success: true, user: data.user }
    }
    
    return { success: false, error: data.message }
  } catch (error) {
    return { success: false, error: "Login failed" }
  }
}
```

2. **Add token-based authentication**:
```typescript
localStorage.setItem("token", data.token)
```

3. **Add API interceptor** for authenticated requests:
```typescript
const token = localStorage.getItem("token")
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Security Notes

⚠️ **Current Implementation:**
- Uses localStorage for demo purposes
- Mock authentication (no real password validation)
- Client-side only protection

🔒 **Production Recommendations:**
1. Implement secure JWT-based authentication
2. Use httpOnly cookies for token storage
3. Add server-side route protection (middleware)
4. Implement refresh tokens
5. Add CSRF protection
6. Enable rate limiting on login attempts
7. Add password hashing (bcrypt/argon2)
8. Implement 2FA for admin accounts

## Dashboard Pages

All pages are fully functional with sample data:

- ✅ **Dashboard** - Overview with stats, recent activity, quick actions
- ✅ **Broadcasts** - Manage bulk message campaigns
- ✅ **Contacts** - Manage WhatsApp contacts and groups
- ✅ **Templates** - WhatsApp message templates
- ✅ **Chatbot** - AI chatbot management
- ✅ **Live Chat** - Real-time customer conversations
- ✅ **Analytics** - Performance metrics and charts
- ✅ **Campaigns** - Marketing campaign tracking
- ✅ **Settings** - User profile and preferences

## Next Steps

1. Connect to backend API endpoints
2. Replace mock data with real data from MongoDB
3. Implement WebSocket for live chat functionality
4. Add data visualization charts in Analytics
5. Implement file uploads for imports
6. Add email verification
7. Implement password reset flow
8. Add activity logging
