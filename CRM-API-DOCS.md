# 🎯 CRM API Documentation

## Overview

Complete CRM system for managing WhatsApp Business Account connections with Meta.

**Base URL**: `/api/crm`  
**Authentication**: JWT (user must be logged in)  
**Subscription**: Required for all CRM features

---

## 📊 Dashboard

### Get CRM Dashboard Overview
```
GET /api/crm/dashboard
```

**Description**: Get complete overview of your WhatsApp business account

**Response**:
```json
{
  "success": true,
  "data": {
    "account": {
      "name": "Enromatics",
      "wabaId": "1211735840550044",
      "businessId": "123456789",
      "syncStatus": "synced",
      "lastSync": "2026-01-30T10:30:00Z"
    },
    "phoneNumbers": {
      "total": 1,
      "list": [
        {
          "id": "507f1f77bcf86cd799439011",
          "number": "+91 80871 31777",
          "isActive": true,
          "quality": "green",
          "verified": true
        }
      ]
    },
    "contacts": {
      "total": 150,
      "active": 45,
      "lastWeekGrowth": "+45"
    },
    "conversations": {
      "total": 200,
      "open": 12,
      "closed": 188,
      "activeRate": 6
    },
    "messages": {
      "total": 5432,
      "sent": 2100,
      "received": 3332,
      "today": 45,
      "avgPerDay": 181
    },
    "recent": {
      "conversations": [
        {
          "_id": "conv1",
          "contactName": "John Doe",
          "status": "open",
          "lastMessage": "Thanks!",
          "lastMessageAt": "2026-01-30T10:15:00Z"
        }
      ],
      "topContacts": [
        {
          "id": "contact1",
          "name": "John Doe",
          "messages": 45,
          "phone": "+919876543210"
        }
      ]
    }
  }
}
```

---

## 👥 Contacts Management

### List All Contacts
```
GET /api/crm/contacts?search=john&sort=lastMessageAt&order=-1&limit=50&skip=0
```

**Query Parameters**:
- `search` (string): Search by name or phone
- `sort` (string): Sort field (default: `lastMessageAt`)
- `order` (number): 1 for ascending, -1 for descending (default: -1)
- `limit` (number): Results per page (default: 50)
- `skip` (number): Skip results (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "phone": "+919876543210",
      "email": "john@example.com",
      "lastMessageAt": "2026-01-30T10:15:00Z",
      "unreadCount": 2,
      "avatar": "https://..."
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "skip": 0,
    "pages": 3
  }
}
```

### Create New Contact
```
POST /api/crm/contacts
```

**Request Body**:
```json
{
  "name": "John Doe",
  "phone": "+919876543210",
  "email": "john@example.com",
  "tags": ["vip", "customer"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": "+919876543210",
    "email": "john@example.com",
    "tags": ["vip", "customer"],
    "accountId": "acc_1769447135387_bwdquusek",
    "createdAt": "2026-01-30T10:00:00Z"
  }
}
```

### Update Contact
```
PUT /api/crm/contacts/:id
```

**Request Body**:
```json
{
  "name": "John Doe Jr",
  "email": "john.jr@example.com",
  "tags": ["vip", "premium"],
  "notes": "Premium customer since Jan 2026"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe Jr",
    "email": "john.jr@example.com",
    "tags": ["vip", "premium"],
    "notes": "Premium customer since Jan 2026"
  }
}
```

---

## 💬 Conversation Management

### List Conversations
```
GET /api/crm/conversations?status=open&limit=50&skip=0
```

**Query Parameters**:
- `status` (string): Filter by status (open/closed)
- `limit` (number): Results per page (default: 50)
- `skip` (number): Skip results (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "conv1",
      "contactId": "contact1",
      "contactName": "John Doe",
      "status": "open",
      "lastMessage": "Thanks for your help!",
      "lastMessageAt": "2026-01-30T10:15:00Z",
      "unreadCount": 1
    }
  ],
  "pagination": {
    "total": 200,
    "limit": 50,
    "skip": 0
  }
}
```

### Get Conversation Details
```
GET /api/crm/conversation/:conversationId?limit=50&skip=0
```

**Response**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "_id": "conv1",
      "contactId": "contact1",
      "contactName": "John Doe",
      "status": "open",
      "createdAt": "2026-01-28T10:00:00Z"
    },
    "messages": [
      {
        "_id": "msg1",
        "text": "Hi, I need help",
        "direction": "incoming",
        "timestamp": "2026-01-30T09:30:00Z",
        "status": "delivered"
      },
      {
        "_id": "msg2",
        "text": "Sure, what's the issue?",
        "direction": "outgoing",
        "timestamp": "2026-01-30T09:35:00Z",
        "status": "delivered"
      }
    ],
    "total": 45
  }
}
```

---

## 📈 Analytics

### Get CRM Analytics
```
GET /api/crm/analytics?days=30
```

**Query Parameters**:
- `days` (number): Analytics period (default: 30)

**Response**:
```json
{
  "success": true,
  "data": {
    "messageTrend": [
      {
        "_id": "2026-01-30",
        "count": 45,
        "sent": 20,
        "received": 25
      },
      {
        "_id": "2026-01-29",
        "count": 52,
        "sent": 22,
        "received": 30
      }
    ],
    "avgResponseTime": 1240,
    "contactGrowth": [
      {
        "_id": "2026-01-30",
        "count": 5
      }
    ],
    "period": "Last 30 days"
  }
}
```

---

## 🚀 Usage Examples

### JavaScript/Node.js

```javascript
// Get Dashboard
const dashboard = await fetch('http://localhost:5000/api/crm/dashboard', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
}).then(r => r.json());

console.log(dashboard.data.conversations.total);

// Search Contacts
const contacts = await fetch('http://localhost:5000/api/crm/contacts?search=john&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
}).then(r => r.json());

// Create Contact
const newContact = await fetch('http://localhost:5000/api/crm/contacts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Jane Doe',
    phone: '+919876543210',
    email: 'jane@example.com',
    tags: ['customer']
  })
}).then(r => r.json());
```

---

## ✅ Sync Requirements

Before using CRM, ensure your WhatsApp account is fully synced:

```javascript
// Check dashboard response for account sync
const crm = await fetch('/api/crm/dashboard').then(r => r.json());

if (crm.data.account.syncStatus === 'synced') {
  // Account is ready for CRM features
}
```

**Requirements**:
- ✅ WABA ID synced from OAuth
- ✅ Business ID synced from webhook
- ✅ Phone numbers connected
- ✅ Access token stored

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | WABA not fully synced | Complete OAuth and wait for webhook |
| 404 | Contact/Conversation not found | Verify ID exists |
| 401 | Unauthorized | Check JWT token |
| 403 | Subscription required | Upgrade account |
| 500 | Server error | Check logs |

---

## Rate Limits

- Dashboard: 100 req/hour
- Contacts: 500 req/hour
- Conversations: 500 req/hour
- Analytics: 100 req/hour

---

## Webhook Events

When new messages arrive, they're automatically added to conversations and contacts updated.

No additional webhook configuration needed - handled by platform.

---

## Next Steps

1. **Connect WhatsApp**: OAuth flow in Settings
2. **Wait for Webhook**: Business ID sync (5-10 seconds)
3. **Access CRM Dashboard**: `GET /api/crm/dashboard`
4. **Manage Contacts**: Create, update, search
5. **View Conversations**: Track all interactions
6. **Monitor Analytics**: See trends and metrics

