# 🧪 LIVE CHAT TESTING GUIDE - Enromatics

## Step 1: Verify Backend is Running ✅

```bash
# Check backend is running on your server/Railway
curl -X GET http://localhost:5000/api/health

# Or check production
curl -X GET https://your-backend-url/api/health
```

Expected response:
```json
{ "status": "ok", "timestamp": "2026-01-25T..." }
```

---

## Step 2: Send Test Message on WhatsApp

### **How to Send:**

**Option A: Send from Real WhatsApp** (Production Test)
1. Open WhatsApp
2. Send message to your business WhatsApp number
3. Example: "Test message from customer"
4. Watch backend logs in real-time

**Option B: Use Meta Webhook Tester** (If you have access)
```bash
curl -X POST https://your-webhook-url/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "YOUR_WABA_ID",
      "changes": [{
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "phone_number_id": "108765432109876",
            "display_phone_number": "+1 (614) 777-1234"
          },
          "messages": [{
            "from": "16147771234",
            "id": "wamid.test.123",
            "timestamp": "1704067200",
            "type": "text",
            "text": {
              "body": "Test message from webhook"
            }
          }],
          "contacts": [{
            "profile": {
              "name": "Test Customer"
            },
            "wa_id": "16147771234"
          }]
        }
      }]
    }]
  }'
```

---

## Step 3: Monitor Backend Logs 📊

Watch these exact logs in your backend:

### **Expected Log Sequence:**

```
1️⃣ WEBHOOK HIT
   🔔🔔🔔 WEBHOOK HIT! Timestamp: 2026-01-25T12:34:56.789Z
   ✅ Valid WhatsApp webhook object
   📬 INCOMING MESSAGES

2️⃣ PHONE NUMBER FOUND
   ✅ Found account: 6971e3a706837a5539992bee (ObjectId)
   ✅ Account ObjectId type: object (should be object)
   ✅ Phone Number ID: 108765432109876 (should be string)

3️⃣ CONVERSATION CREATED/FOUND
   ✅ Conversation ID (MongoDB _id): 65a7b8c9d0e1f2g3h4i5j6k7
   ✅ Conversation updated with message preview

4️⃣ MESSAGE SAVED
   ✅ Saved incoming message to database: 65a7b8c9d0e1f2g3h4i5j6k8

5️⃣ SOCKET BROADCAST
   📡 Broadcasted new message via Socket.io: 65a7b8c9d0e1f2g3h4i5j6k7
   ✅ Broadcast new_message successful
```

---

## Step 4: Check What Should Happen ✅

### **Backend Should Log:**
```
accountId: 6971e3a706837a5539992bee (type: ObjectId) ✅
workspaceId: 6971e3a706837a5539992bee (type: ObjectId) ✅
phoneNumberId: 108765432109876 (type: string) ✅
```

### **NOT This** (Which Was Broken):
```
phoneNumberId: undefined ❌ (This means frontend not sending it)
```

---

## Step 5: Verify Frontend Receives Message 🔌

### **Open Browser DevTools:**

1. **Network Tab:**
   - Should see WebSocket connection: `/socket.io/?EIO=...`
   - Status: `101 Web Socket Protocol Handshake` ✅

2. **Console:**
   ```javascript
   // Check Socket.io connection
   console.log(socket.connected) // Should be true
   
   // Watch for incoming messages
   socket.on('new_message', (data) => {
     console.log('📨 NEW MESSAGE RECEIVED:', data)
   })
   ```

3. **Application Tab:**
   - Look for Socket.io messages
   - Event: `new_message`
   - Should fire within <100ms of webhook

---

## Step 6: Check Conversation List 📱

### **Frontend Should:**
1. Load inbox with conversations
2. Show new conversation at top
3. Display "Test message from customer" as last message
4. Show unread badge (1) if conversation not selected

### **API Call to Check:**
```bash
# Get conversations for specific phone
curl -X GET "http://localhost:3000/api/conversations?phoneNumberId=108765432109876" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "conversations": [
    {
      "_id": "65a7b8c9d0e1f2g3h4i5j6k7",
      "accountId": "6971e3a706837a5539992bee",
      "workspaceId": "6971e3a706837a5539992bee",
      "phoneNumberId": "108765432109876",
      "userPhone": "16147771234",
      "lastMessagePreview": "Test message from customer",
      "lastMessageAt": "2026-01-25T12:34:56.789Z",
      "unreadCount": 1,
      "status": "open"
    }
  ]
}
```

---

## Step 7: Test Real-Time Sync 🔄

### **Multi-Tab Test:**
1. Open chat in **Tab 1**
2. Open chat in **Tab 2**
3. Send test message from WhatsApp
4. **Both tabs should show message instantly** (<100ms)
5. If only one shows it → Socket broadcast issue
6. If neither shows it → Webhook/database issue

---

## 🔴 Troubleshooting

### **Message Not Appearing?**

```
Check:
1. ✅ Backend is running?
   → curl http://localhost:5000/api/health

2. ✅ Webhook logs show message received?
   → Look for "WEBHOOK HIT" log

3. ✅ phoneNumberId is correct?
   → Should match: 108765432109876

4. ✅ accountId is ObjectId?
   → Should look like: 6971e3a706837a5539992bee

5. ✅ Frontend has phoneNumberId?
   → Check query param: ?phoneNumberId=...

6. ✅ Socket.io connected?
   → DevTools → Application → Socket.io

7. ✅ Conversation has workspaceId?
   → Check database: db.conversations.findOne()
```

---

## 📋 Test Checklist

### **Backend Tests:**
- [ ] Webhook receives message
- [ ] accountId logged as ObjectId
- [ ] workspaceId logged as ObjectId
- [ ] phoneNumberId logged as string
- [ ] Conversation created/updated
- [ ] Message saved to database
- [ ] Socket broadcast emitted

### **Frontend Tests:**
- [ ] Socket.io connected (status: 101)
- [ ] New conversation appears in list
- [ ] Last message preview correct
- [ ] Unread badge shows
- [ ] Message syncs to second tab instantly
- [ ] No console errors

### **Real-Time Sync Test:**
- [ ] Send message on Phone A
- [ ] Message appears on Tab 1 in <100ms
- [ ] Message appears on Tab 2 in <100ms
- [ ] Both tabs stay synchronized
- [ ] Refresh page: Message still there

---

## 🚀 Expected Results

### **After Fix (What You Should See):**
```
✅ Message sent → Webhook logs message received
✅ Webhook processes → Conversation found
✅ Message saved → Database stores it
✅ Socket emits → Frontend receives it
✅ UI updates → Message appears in chat
✅ All <100ms → Real-time sync working
```

### **Before Fix (What Was Happening):**
```
❌ Message sent → Webhook logs correct
❌ phoneNumberId: undefined → Query broken
❌ Multiple conversations returned → Random one picked
❌ Socket broadcast to wrong room → Message missed
❌ UI doesn't update → "Why no new message?"
```

---

## 📞 How to Send Test Message

### **Direct WhatsApp Test (Easiest):**
1. Open WhatsApp on your phone
2. Find your business WhatsApp number
3. Send: "Test message from Enromatics"
4. **Watch backend logs for:**
   ```
   🔔 WEBHOOK HIT
   ✅ Phone Number ID: 108765432109876
   📡 Broadcasted new message via Socket.io
   ```

### **Webhook Simulator (Advanced):**
Use Meta's webhook tester or Postman:
1. Method: POST
2. URL: `https://your-backend/api/webhooks/whatsapp`
3. Header: `Content-Type: application/json`
4. Body: See Step 2 above

---

## ✅ Success Criteria

You'll know it's working when:

1. **Backend Log Shows:**
   ```
   accountId: 6971e3a706837a5539992bee (type: ObjectId) ✅
   workspaceId: 6971e3a706837a5539992bee (type: ObjectId) ✅
   phoneNumberId: 108765432109876 (type: string) ✅
   ```

2. **Frontend Shows:**
   - New conversation appears instantly
   - Message visible in chat window
   - Unread badge increments
   - Multi-tab sync works

3. **Real-Time Performance:**
   - <100ms from sending to receiving
   - No manual refresh needed
   - No browser errors
   - Socket.io connected

---

## 🎯 After Testing

If all checks pass:
```
✅ Live Chat is WORKING
✅ Real-time sync is WORKING
✅ Multi-phone support is WORKING
✅ Ready for production deployment
```

If any check fails:
```
1. Check backend logs
2. Verify phoneNumberId is being sent
3. Verify workspaceId exists in Conversation
4. Check Socket.io connection
5. Check browser console for errors
```

Good luck! 🚀
