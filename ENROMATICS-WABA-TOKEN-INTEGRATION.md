# 🔌 Enromatics Integration with WABA-Scoped Tokens

## **How It Works**

1. User generates an **Integration Token** in Settings → API Keys
2. Enromatics gets the token (format: `wpi_int_xxxxx`)
3. Enromatics uses this token to authenticate all requests
4. Each request is scoped to that specific WABA account

---

## **Step 1: Generate Integration Token (User)**

In the Platform UI:

1. Go to **Dashboard** → **Settings**
2. Click **API Keys** tab
3. Scroll down to **Integration Token** section
4. Click **"Generate Integration Token"**
5. Copy the token (shown only once!)
6. Share with Enromatics team

**Token Format:** `wpi_int_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## **Step 2: Configure Enromatics**

In Enromatics `.env`:

```env
WHATSAPP_PLATFORM_URL=https://your-platform-url.com
WHATSAPP_INTEGRATION_TOKEN=wpi_int_xxxxx
```

---

## **Step 3: Send Messages from Enromatics**

```javascript
const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL;
const WHATSAPP_INTEGRATION_TOKEN = process.env.WHATSAPP_INTEGRATION_TOKEN;

const sendWhatsApp = async (recipientPhone, message) => {
  const response = await fetch(
    `${WHATSAPP_PLATFORM_URL}/api/integrations/send-message`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_INTEGRATION_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientPhone: recipientPhone,
        message: message
      })
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send message');
  }
  
  return data.data; // { messageId, waMessageId, timestamp }
};

// Usage
try {
  const result = await sendWhatsApp('1234567890', 'Hello from Enromatics!');
  console.log('Message sent:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## **Step 4: Get Conversations from Enromatics**

```javascript
const getConversations = async (limit = 50, offset = 0) => {
  const response = await fetch(
    `${WHATSAPP_PLATFORM_URL}/api/integrations/conversations?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_INTEGRATION_TOKEN}`
      }
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch conversations');
  }
  
  return data.data; // { conversations, pagination }
};

// Usage
try {
  const { conversations, pagination } = await getConversations(50, 0);
  console.log('Conversations:', conversations);
  console.log('Total:', pagination.total);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## **API Endpoints**

### **1. Send Message**
```
POST /api/integrations/send-message
Authorization: Bearer wpi_int_xxxxx
Content-Type: application/json

{
  "recipientPhone": "1234567890",
  "message": "Hello"
}

Response:
{
  "success": true,
  "message": "Message sent successfully via Enromatics",
  "data": {
    "messageId": "mongo-id",
    "waMessageId": "wamessageid",
    "timestamp": "2026-01-08T12:34:56.000Z"
  }
}
```

### **2. Get Conversations**
```
GET /api/integrations/conversations?limit=50&offset=0
Authorization: Bearer wpi_int_xxxxx

Response:
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversationId": "...",
        "userPhone": "1234567890",
        "userName": "John",
        "lastMessageAt": "2026-01-08T12:34:56.000Z",
        "lastMessagePreview": "Last message text",
        "unreadCount": 2
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## **Security Features**

✅ **Token-based auth** - No passwords exposed
✅ **WABA-scoped** - Token is tied to specific account
✅ **Read-only refresh** - Token never shown again after generation
✅ **Last used tracking** - Know when token was last used
✅ **Revocable** - Users can revoke token anytime
✅ **Account isolation** - Each account has its own token

---

## **Error Handling**

```javascript
// 401 - Invalid/expired token
{
  "success": false,
  "message": "Invalid or expired integration token"
}

// 400 - Missing required fields
{
  "success": false,
  "message": "Missing required fields: recipientPhone, message"
}

// 400 - No active phone number
{
  "success": false,
  "message": "No active WhatsApp phone number configured for this account"
}
```

---

## **Troubleshooting**

| Issue | Solution |
|-------|----------|
| 401 error | Check token is correct and hasn't expired |
| 400 "missing fields" | Ensure recipientPhone and message are in request body |
| No phone number error | User needs to add phone number in Settings → WhatsApp Setup |
| Token not working | Regenerate token, old one might be invalid |

---

## **User Guide for Generating Token**

1. **Navigate to Settings**
   - Dashboard → Settings → API Keys tab

2. **Scroll to Integration Token section**
   - Shows your account info and WABA ID

3. **Click "Generate Integration Token"**
   - Confirm you want to replace old token (if exists)

4. **Copy the token**
   - Modal shows full token (only visible once)
   - Click Copy button

5. **Share with Enromatics**
   - Provide token securely (via 1Password, email, etc.)
   - Never share via chat/slack

6. **Monitor usage**
   - See "Last Used" timestamp
   - Know if token is being used

---

## **Token Details**

- **Format:** `wpi_int_` + 64-character hash
- **Expires:** Never (until manually revoked)
- **Scope:** Limited to the account that generated it
- **Usage:** All requests use same token (no per-request generation)
