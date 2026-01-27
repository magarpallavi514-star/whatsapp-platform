# WhatsApp Platform API Documentation

## 🚀 Base URL
```
http://localhost:5050/api
```

---

## 📨 Messages API

### Send Text Message
**POST** `/messages/send`

Send a text message via WhatsApp.

**Request:**
```json
{
  "accountId": "pixels_internal",
  "phoneNumberId": "889344924259692",
  "recipientPhone": "918087131777",
  "message": "Hello from WhatsApp Platform!",
  "campaign": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "success": true,
    "messageId": "695a1daa3d827651cbb95adc",
    "waMessageId": "wamid.HBgMOTE4MDg3MTMxNzc3FQIAERgSQkIyMDBEQkQ4RTg4NThEODU5AA=="
  }
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:5050/api/messages/send" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "pixels_internal",
    "phoneNumberId": "889344924259692",
    "recipientPhone": "918087131777",
    "message": "Hello!",
    "campaign": "test"
  }'
```

---

### Send Template Message
**POST** `/messages/send-template`

Send a pre-approved WhatsApp template.

**Request:**
```json
{
  "accountId": "pixels_internal",
  "phoneNumberId": "889344924259692",
  "recipientPhone": "918087131777",
  "templateName": "hello_world",
  "params": [],
  "campaign": "campaign_name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template message sent successfully",
  "data": {
    "success": true,
    "messageId": "...",
    "waMessageId": "..."
  }
}
```

---

### Get Messages
**GET** `/messages?accountId={accountId}&phoneNumberId={phoneNumberId}&status={status}&limit={limit}&skip={skip}`

Retrieve message history.

**Query Parameters:**
- `accountId` (required) - Account ID
- `phoneNumberId` (optional) - Filter by phone number
- `status` (optional) - Filter by status (queued, sent, delivered, read, failed)
- `limit` (optional) - Number of results (default: 50)
- `skip` (optional) - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "messages": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "skip": 0,
    "hasMore": true
  }
}
```

**cURL Example:**
```bash
curl "http://localhost:5050/api/messages?accountId=pixels_internal&limit=10"
```

---

### Get Single Message
**GET** `/messages/:id`

Get details of a specific message.

**Response:**
```json
{
  "success": true,
  "message": {
    "_id": "...",
    "accountId": "pixels_internal",
    "recipientPhone": "918087131777",
    "status": "delivered",
    "content": {...},
    "sentAt": "2026-01-04T...",
    "deliveredAt": "2026-01-04T..."
  }
}
```

---

## 💬 Conversations API

### Get Conversations
**GET** `/conversations?accountId={accountId}&phoneNumberId={phoneNumberId}&status={status}&limit={limit}`

Get inbox conversations.

**Query Parameters:**
- `accountId` (required) - Account ID
- `phoneNumberId` (optional) - Filter by phone number
- `status` (optional) - Filter by status (open, closed)
- `limit` (optional) - Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "conversationId": "pixels_internal_889344924259692_918087131777",
      "userPhone": "918087131777",
      "userName": "Test User",
      "lastMessageAt": "2026-01-04T...",
      "lastMessagePreview": "Hello!",
      "status": "open",
      "unreadCount": 1
    }
  ]
}
```

**cURL Example:**
```bash
curl "http://localhost:5050/api/conversations?accountId=pixels_internal"
```

---

### Get Conversation Messages
**GET** `/conversations/:conversationId/messages?limit={limit}`

Get all messages in a conversation.

**Response:**
```json
{
  "success": true,
  "conversation": {...},
  "messages": [...]
}
```

**cURL Example:**
```bash
curl "http://localhost:5050/api/conversations/pixels_internal_889344924259692_918087131777/messages"
```

---

### Reply to Conversation
**POST** `/conversations/:conversationId/reply`

Send a reply in an existing conversation.

**Request (Text):**
```json
{
  "messageType": "text",
  "message": "Thank you for contacting us!"
}
```

**Request (Template):**
```json
{
  "messageType": "template",
  "templateName": "hello_world",
  "templateParams": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply sent successfully",
  "data": {...}
}
```

---

### Mark as Read
**PATCH** `/conversations/:conversationId/read`

Mark conversation as read (clears unread count).

**Response:**
```json
{
  "success": true,
  "message": "Conversation marked as read"
}
```

---

### Update Conversation Status
**PATCH** `/conversations/:conversationId/status`

Change conversation status.

**Request:**
```json
{
  "status": "closed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation marked as closed"
}
```

---

## 👥 Contacts API

### Get Contacts
**GET** `/contacts?accountId={accountId}&type={type}&isOptedIn={isOptedIn}&limit={limit}&skip={skip}`

Retrieve contacts.

**Query Parameters:**
- `accountId` (required) - Account ID
- `type` (optional) - Filter by type (customer, lead, other)
- `isOptedIn` (optional) - Filter by opt-in status (true, false)
- `limit` (optional) - Number of results (default: 100)
- `skip` (optional) - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "contacts": [...],
  "pagination": {...}
}
```

**cURL Example:**
```bash
curl "http://localhost:5050/api/contacts?accountId=pixels_internal"
```

---

### Create Contact
**POST** `/contacts`

Create a new contact.

**Request:**
```json
{
  "accountId": "pixels_internal",
  "name": "John Doe",
  "whatsappNumber": "919876543210",
  "phone": "+919876543210",
  "email": "john@example.com",
  "type": "customer",
  "tags": ["vip", "premium"],
  "metadata": {
    "source": "website",
    "notes": "Interested in Pro plan"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact created successfully",
  "contact": {...}
}
```

---

### Update Contact
**PUT** `/contacts/:id`

Update an existing contact.

**Request:**
```json
{
  "name": "John Doe Updated",
  "tags": ["vip"],
  "metadata": {...}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact updated successfully",
  "contact": {...}
}
```

---

### Delete Contact
**DELETE** `/contacts/:id`

Delete a contact.

**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

### Bulk Import Contacts
**POST** `/contacts/import`

Import multiple contacts at once.

**Request:**
```json
{
  "accountId": "pixels_internal",
  "contacts": [
    {
      "name": "User 1",
      "whatsappNumber": "919876543210",
      "type": "customer"
    },
    {
      "name": "User 2",
      "whatsappNumber": "919876543211",
      "type": "lead"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Imported 2 contacts, 0 failed",
  "imported": 2,
  "failed": 0,
  "failedContacts": []
}
```

---

## 📊 Stats API

### Get Platform Statistics
**GET** `/stats?accountId={accountId}&phoneNumberId={phoneNumberId}`

Get comprehensive platform statistics.

**Query Parameters:**
- `accountId` (required) - Account ID
- `phoneNumberId` (optional) - Filter by phone number

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalMessages": 3,
    "sentMessages": 2,
    "deliveredMessages": 1,
    "failedMessages": 0,
    "todayMessages": 3,
    "deliveryRate": "33.3%",
    "totalContacts": 1,
    "totalConversations": 1,
    "openConversations": 1,
    "closedConversations": 0,
    "unreadMessages": 1,
    "phoneNumbers": [...]
  }
}
```

**cURL Example:**
```bash
curl "http://localhost:5050/api/stats?accountId=pixels_internal"
```

---

### Get Daily Statistics
**GET** `/stats/daily?accountId={accountId}&days={days}`

Get daily message breakdown for analytics.

**Query Parameters:**
- `accountId` (required) - Account ID
- `phoneNumberId` (optional) - Filter by phone number
- `days` (optional) - Number of days to retrieve (default: 7)

**Response:**
```json
{
  "success": true,
  "stats": [
    {
      "_id": "2026-01-04",
      "statuses": [
        { "status": "sent", "count": 5 },
        { "status": "delivered", "count": 4 }
      ],
      "total": 9
    }
  ]
}
```

---

## 🔔 Webhooks API

### Webhook Verification
**GET** `/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token={token}&hub.challenge={challenge}`

Meta calls this to verify your webhook endpoint.

**Response:** Returns the challenge string

---

### Webhook Handler
**POST** `/webhooks/whatsapp`

Receives incoming messages and status updates from WhatsApp.

**Note:** This endpoint is called by Meta automatically. No authentication required (verified by token).

---

## 🔑 Authentication

**Current Status:** No authentication implemented (Phase 1)

**Coming in Phase 2:**
- API Key authentication
- JWT tokens for dashboard
- Account-based access control

**For now:** All endpoints require `accountId` parameter for tenant isolation.

---

## ⚠️ Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing Quick Commands

```bash
# Test stats
curl "http://localhost:5050/api/stats?accountId=pixels_internal"

# Send message
curl -X POST "http://localhost:5050/api/messages/send" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"pixels_internal","phoneNumberId":"889344924259692","recipientPhone":"918087131777","message":"Test","campaign":"test"}'

# Get conversations
curl "http://localhost:5050/api/conversations?accountId=pixels_internal"

# Get contacts
curl "http://localhost:5050/api/contacts?accountId=pixels_internal"
```

---

## 🚀 Next Steps

1. ✅ Webhooks working
2. ✅ API controllers created
3. ✅ Routes configured
4. ⏳ Add authentication (Phase 2)
5. ⏳ Build frontend dashboard
6. ⏳ Deploy to production

---

**Base URL (Production):** `https://your-domain.com/api`
**Base URL (Development):** `http://localhost:5050/api`
