# 🔐 Role-Based Access Control - Complete Guide

## 📊 Role Hierarchy Overview

```
┌─────────────────────────────────────────────────┐
│         SUPERADMIN (Platform Level)             │
│  Your Team - Full Platform Control             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│           ADMIN (Organization Level)            │
│  Client's Business Owner - Full Org Control    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│          MANAGER (Team Lead Level)              │
│  Client's Marketing Manager - Campaign Control │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│           AGENT (Support Level)                 │
│  Client's Support Staff - Chat & Basic Access  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│            USER (Viewer Level)                  │
│  Read-Only Access - Reports & Analytics View   │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Role Details & Permissions

### 1️⃣ **SUPERADMIN** (You & Your Team)
**Who they are:**
- Platform owners
- Your development team
- System administrators
- DevOps team

**What they can do:**
✅ **Everything** (God Mode)
- Manage ALL organizations/clients
- Create/delete Admin accounts
- Access data across ALL clients
- System configuration
- Database management
- Platform-wide analytics
- Billing & subscription management
- API keys & webhooks configuration
- Server & infrastructure monitoring
- White-label settings
- Platform feature toggles

**Use Cases:**
- Onboard new clients
- Troubleshoot client issues
- System maintenance
- Platform updates
- Monitor all transactions
- Handle escalated support tickets

**Access Level:** 🟢 100% (All Features + Platform Management)

---

### 2️⃣ **ADMIN** (Client's Business Owner)
**Who they are:**
- Business owner (e.g., store owner, restaurant owner)
- Account owner who pays for the subscription
- CEO/Director level

**What they can do:**
✅ **Full control of THEIR organization only**
- Create/manage team (Managers, Agents, Users)
- Configure WhatsApp Business API for their org
- Manage billing & subscription for their account
- View all campaigns, broadcasts, analytics
- Approve/reject templates
- Delete campaigns
- Export all data
- Change org settings
- Integrate with their tools (CRM, etc.)

**Cannot do:**
❌ Access other organizations' data
❌ Change platform settings
❌ Access superadmin features

**Use Cases:**
- Set up their WhatsApp Business
- Add team members
- Monitor overall performance
- Review monthly reports
- Upgrade/downgrade plans
- Configure integrations

**Access Level:** 🟢 90% (Full Org Control)

---

### 3️⃣ **MANAGER** (Marketing/Campaign Manager)
**Who they are:**
- Marketing manager
- Campaign manager
- Team lead
- Department head

**What they can do:**
✅ **Create & manage campaigns**
- Create broadcasts
- Manage contacts & segments
- Create/edit WhatsApp templates
- Build chatbots & automation
- Schedule campaigns
- View analytics & reports
- Export campaign data
- Manage live chat (view, assign)
- Create customer tags

**Cannot do:**
❌ Delete team members
❌ Change billing/subscription
❌ Delete organization
❌ Manage admin settings
❌ Access billing information

**Use Cases:**
- Launch marketing campaigns
- Segment customers
- Create automated flows
- Analyze campaign performance
- A/B test messages
- Optimize conversion rates

**Access Level:** 🟡 70% (Campaign & Marketing)

---

### 4️⃣ **AGENT** (Customer Support Rep)
**Who they are:**
- Customer support agents
- Sales representatives
- Receptionists
- Frontline staff

**What they can do:**
✅ **Handle customer conversations**
- Reply to live chats
- View contact information
- Send manual messages
- View conversation history
- Tag conversations
- Access canned responses
- View basic dashboards

**Cannot do:**
❌ Create broadcasts/campaigns
❌ View analytics
❌ Manage templates
❌ Create chatbots
❌ Export data
❌ Delete anything
❌ Manage team

**Use Cases:**
- Respond to customer queries
- Handle support tickets via WhatsApp
- Update customer info
- Send order updates manually
- Mark conversations as resolved

**Access Level:** 🟡 40% (Live Chat Only)

---

### 5️⃣ **USER/VIEWER** (Read-Only)
**Who they are:**
- Investors
- Stakeholders
- Consultants
- External viewers

**What they can do:**
✅ **View reports only**
- View dashboard stats
- See reports & analytics
- Download reports

**Cannot do:**
❌ Make ANY changes
❌ Send messages
❌ Create campaigns
❌ Access contacts
❌ View live chats

**Use Cases:**
- Monitor business performance
- Review monthly reports
- Track KPIs

**Access Level:** 🔴 20% (Read-Only Reports)

---

## 🏢 Real-World Example: E-commerce Store

**Your Platform:** Pixels WhatsApp Platform (SaaS)

### Client: "Fashion Store" (Your Customer)

```
YOUR TEAM (SuperAdmin)
├── You (Founder)
├── Developer 1
└── Developer 2
    ↓ manages ↓

FASHION STORE (Admin Account)
├── John (Store Owner) - ADMIN
│   → Can: Manage entire account, add team, billing
│
├── Sarah (Marketing Manager) - MANAGER
│   → Can: Create campaigns, broadcasts, analytics
│
├── Mike (Social Media Manager) - MANAGER
│   → Can: Create campaigns, manage chatbots
│
├── Lisa (Support Agent) - AGENT
│   → Can: Reply to chats, view contacts
│
├── Tom (Support Agent) - AGENT
│   → Can: Reply to chats, view contacts
│
└── David (Investor) - USER
    → Can: View reports only
```

---

## 💼 What You Need for Your Team

### **For Your Platform (SaaS Business):**

1. **Multi-Tenancy Support** 🏢
   - Separate database per organization OR
   - Single database with `organizationId` field
   - Data isolation between clients

2. **SuperAdmin Dashboard** 🎛️
   ```
   - Organizations List
   - Create New Organization
   - Client Analytics (all clients)
   - Billing Overview (all subscriptions)
   - System Health Monitoring
   - API Usage Stats
   - Error Logs
   ```

3. **Organization Management** 🏪
   ```typescript
   interface Organization {
     id: string
     name: string
     whatsappBusinessId: string
     subscription: "free" | "basic" | "pro" | "enterprise"
     adminUserId: string
     createdAt: Date
     status: "active" | "suspended" | "cancelled"
     billingEmail: string
   }
   ```

4. **User-Organization Relationship** 👥
   ```typescript
   interface User {
     id: string
     email: string
     name: string
     role: UserRole
     organizationId: string  // Links user to org
     permissions: string[]
     createdBy: string       // Who created this user
   }
   ```

5. **Backend API Structure** 🔧
   ```
   /api/superadmin/*        → SuperAdmin only
   /api/admin/*             → Admin only
   /api/manager/*           → Manager + Admin
   /api/agent/*             → Agent + Manager + Admin
   /api/user/*              → All authenticated users
   ```

6. **Middleware for Role Checking** 🔒
   ```javascript
   // Example middleware
   const checkRole = (allowedRoles) => {
     return (req, res, next) => {
       if (!allowedRoles.includes(req.user.role)) {
         return res.status(403).json({ error: "Forbidden" })
       }
       next()
     }
   }
   
   // Usage
   app.get('/api/admin/users', 
     authenticate, 
     checkRole(['superadmin', 'admin']), 
     getUsers
   )
   ```

---

## 🔄 User Flow Examples

### **Scenario 1: Onboarding New Client**
```
1. Client signs up → Creates account
2. SuperAdmin reviews → Approves
3. System creates Organization
4. Client becomes ADMIN of their org
5. Client adds their team members
   - Marketing manager → MANAGER
   - Support staff → AGENT
```

### **Scenario 2: Daily Operations**
```
MANAGER (Sarah):
9:00 AM → Creates "Weekend Sale" broadcast
10:00 AM → Schedules for Saturday 10 AM
11:00 AM → Reviews last week's analytics

AGENT (Lisa):
9:00 AM → Opens live chat dashboard
9:05 AM → Responds to customer query
9:30 AM → Escalates issue to Manager
```

### **Scenario 3: Your Team (SuperAdmin)**
```
YOU (SuperAdmin):
- Monitor all organizations
- See total platform revenue
- Handle escalated issues
- Deploy new features
- Check system health
```

---

## ✅ Implementation Checklist

### Phase 1: Foundation
- [x] Role enum defined
- [x] Permissions structure
- [x] Protected routes
- [x] Login with role detection
- [ ] Multi-tenancy (organizationId)
- [ ] Role-based API middleware

### Phase 2: Organization Management
- [ ] Organization creation flow
- [ ] SuperAdmin dashboard
- [ ] Team member invitation
- [ ] Role assignment by Admin

### Phase 3: Advanced Features
- [ ] Activity logs (who did what)
- [ ] Audit trails
- [ ] Permission customization
- [ ] IP whitelisting
- [ ] 2FA for SuperAdmin

---

## 🎓 Summary

**Think of it like this:**

- **SuperAdmin** = You (Platform Owner) → Manage ALL clients
- **Admin** = Client (Store Owner) → Manage THEIR store
- **Manager** = Employee (Marketing) → Run campaigns
- **Agent** = Employee (Support) → Help customers
- **User** = Stakeholder → Just view reports

**Database Structure:**
```
Organizations (Clients)
└── Users (with roles)
    └── Campaigns/Contacts/Messages (data)
```

Each organization is isolated, but SuperAdmin can see everything!

---

## 🚀 Next Steps for Your Team

1. **Implement Organization Model** in backend
2. **Add `organizationId` to all data models**
3. **Create SuperAdmin Dashboard** pages
4. **Add Organization Switcher** for SuperAdmin
5. **Implement Billing System**
6. **Add Invitation System** for team members
7. **Activity Logging** for audit trails

Need help implementing any of these? Let me know! 🎯
