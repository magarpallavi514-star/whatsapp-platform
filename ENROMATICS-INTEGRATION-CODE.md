# 🔌 Enromatics Integration - Updated Code

## ✅ What Enromatics Needs to Update

### 1. Add Environment Variable

In Enromatics `.env` file:
```env
WHATSAPP_PLATFORM_URL=https://whatsapp-platform-production-e48b.up.railway.app
WHATSAPP_PLATFORM_API_KEY=wpk_live_bd29f2f4cb5bec511bcab8b9c2e2dba3895b821bfcfcf18bf9fb6b7b70861d7d
```

---

### 2. Updated Send Message Function

**❌ OLD CODE (DELETE THIS):**
```javascript
// OLD - Complex with accountId, phoneNumberId
const sendWhatsApp = async (recipientPhone, message) => {
  const response = await fetch(`${PLATFORM_URL}/api/messages/send?accountId=1536545574042607`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OLD_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phoneNumberId: '889344924259692',  // ❌ Not needed anymore
      recipientPhone: recipientPhone,
      message: message
    })
  });
};
```

**✅ NEW CODE (USE THIS):**
```javascript
// NEW - Simple with just API key
const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL;
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

const sendWhatsApp = async (recipientPhone, message) => {
  const response = await fetch(`${WHATSAPP_PLATFORM_URL}/api/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipientPhone: recipientPhone,   // Just phone
      message: message                   // Just message
    })
  });
  
  return await response.json();
};
```

---

### 3. Updated Get Conversations Function

**❌ OLD CODE (DELETE THIS):**
```javascript
// OLD - With accountId in query
const getConversations = async () => {
  const response = await fetch(
    `${PLATFORM_URL}/api/conversations?accountId=1536545574042607`,
    {
      headers: { 'Authorization': `Bearer ${OLD_API_KEY}` }
    }
  );
};
```

**✅ NEW CODE (USE THIS):**
```javascript
// NEW - No query params needed
const getConversations = async () => {
  const response = await fetch(`${WHATSAPP_PLATFORM_URL}/api/conversations`, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`
    }
  });
  
  return await response.json();
};
```

---

### 4. Updated Get Messages Function

**✅ NEW CODE:**
```javascript
const getMessages = async (conversationId) => {
  const response = await fetch(
    `${WHATSAPP_PLATFORM_URL}/api/conversations/${conversationId}/messages`,
    {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`
      }
    }
  );
  
  return await response.json();
};
```

---

## 📋 Summary of Changes for Enromatics:

### ❌ REMOVE:
- ❌ `accountId` from query params
- ❌ `phoneNumberId` from request body
- ❌ `tenantId` references
- ❌ Old API key

### ✅ KEEP ONLY:
- ✅ New API key in Authorization header
- ✅ `recipientPhone` in body
- ✅ `message` in body
- ✅ That's it!

---

## 🔑 API Key for Enromatics:
```
wpk_live_bd29f2f4cb5bec511bcab8b9c2e2dba3895b821bfcfcf18bf9fb6b7b70861d7d
```

## 🌐 Base URL:
```
https://whatsapp-platform-production-e48b.up.railway.app
```

---

## ✅ Test After Update:

```bash
# Test send message
curl -X POST https://whatsapp-platform-production-e48b.up.railway.app/api/messages/send \
  -H "Authorization: Bearer wpk_live_bd29f2f4cb5bec511bcab8b9c2e2dba3895b821bfcfcf18bf9fb6b7b70861d7d" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientPhone": "918087131777",
    "message": "Test from Enromatics"
  }'

# Test get conversations
curl https://whatsapp-platform-production-e48b.up.railway.app/api/conversations \
  -H "Authorization: Bearer wpk_live_bd29f2f4cb5bec511bcab8b9c2e2dba3895b821bfcfcf18bf9fb6b7b70861d7d"
```

Both should work now! 🎉
