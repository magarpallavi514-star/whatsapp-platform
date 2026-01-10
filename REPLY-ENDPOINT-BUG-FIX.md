# 🐛 Bug Found: Reply Endpoint Issue

## The Problem

When Enromatics tries to reply to a conversation, the endpoint **fails silently** because of a field mismatch.

---

## 🔴 What's Broken

**File:** `backend/src/controllers/integrationsController.js`
**Line 289:** 
```javascript
const result = await whatsappService.sendTextMessage(
  accountId,
  phoneNumber.phoneNumberId,
  conversation.contactPhone,  // ❌ BUG: This field doesn't exist!
  message,
  { campaign: 'enromatics', conversationId }
);
```

### The Issue:
- Code tries to use `conversation.contactPhone`
- But the Conversation model only has `conversation.userPhone`
- Result: The field is **undefined** → Message can't be sent ❌

---

## ✅ What Enromatics Should Send

### Endpoint:
```
POST /api/integrations/conversations/{conversationId}/reply
```

### Required Headers:
```
Authorization: Bearer {API_KEY}
Content-Type: application/json
x-account-id: {account-id}
```

### Required Body:
```json
{
  "message": "Your reply text here"
}
```

### Optional Body:
```json
{
  "message": "Your reply text here",
  "mediaUrl": "https://...",
  "mediaType": "image"
}
```

---

## 📋 What Data Enromatics Already Fetches

When you fetch conversations from the endpoint, you get:

```javascript
{
  "_id": "695a1a0fbcb4b39a4abb7ac3",
  "conversationId": "pixels_internal_889344924259692_918087131777",
  "accountId": "pixels_internal",
  "phoneNumberId": "889344924259692",
  "userPhone": "918087131777",           // ← USE THIS
  "userName": "Piyush Magar",
  "status": "open",
  "unreadCount": 4,
  "lastMessageAt": "2026-01-08T20:11:46.000Z",
  "lastMessagePreview": "thank you",
  "tags": [],
  "createdAt": "2026-01-04T13:13:11.000Z"
}
```

---

## 🔧 How to Fix

### Step 1: Fix the Backend (WhatsApp Platform)

Change line 289 from:
```javascript
// ❌ WRONG
conversation.contactPhone

// ✅ CORRECT
conversation.userPhone
```

---

### Step 2: What Enromatics Should Do

1. **Fetch conversation details:**
   ```
   GET /api/integrations/conversations/{conversationId}
   ```
   You'll get back the conversation object with `userPhone`

2. **Send reply:**
   ```
   POST /api/integrations/conversations/{conversationId}/reply
   Body: { "message": "Your text" }
   ```

3. **The backend will:**
   - Find the conversation using `conversationId`
   - Extract `userPhone` from the conversation
   - Extract `phoneNumberId` from the conversation
   - Send message to `userPhone` using the `phoneNumberId`

---

## 📊 Data Flow

```
Enromatics Request:
├─ POST /api/integrations/conversations/{conversationId}/reply
└─ Body: { message: "Reply text" }
        ↓
WhatsApp Platform:
├─ Find conversation by conversationId ✅
├─ Extract userPhone (e.g., 918087131777)
├─ Extract phoneNumberId (e.g., 889344924259692)
├─ Get active phone number config
├─ Send message to userPhone
└─ Return success/error
        ↓
WhatsApp:
└─ Message delivered to user
```

---

## 🧪 Test Endpoint

```bash
curl -X POST http://your-server/api/integrations/conversations/pixels_internal_889344924259692_918087131777/reply \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test reply from Enromatics"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Reply sent successfully",
  "data": {
    "messageId": "...",
    "waMessageId": "...",
    "timestamp": "2026-01-08T..."
  }
}
```

---

## 🚨 Issues Found

| Issue | Location | Fix |
|-------|----------|-----|
| Using `contactPhone` instead of `userPhone` | integrationsController.js:289 | Change to `conversation.userPhone` |

---

## ✅ Next Steps

1. Fix line 289 in integrationsController.js
2. Test with Enromatics by sending a reply
3. Verify message appears in WhatsApp
