# WhatsApp Platform - Webhook Setup Guide

## 🎯 Overview
This guide helps you configure Meta's WhatsApp Cloud API webhooks to receive incoming messages and status updates.

---

## 📋 Prerequisites
- ✅ WhatsApp Business Account (WABA) set up in Meta Business Manager
- ✅ Server running and publicly accessible
- ✅ Webhook endpoints deployed at: `/api/webhooks/whatsapp`

---

## 🔧 Webhook Configuration

### Step 1: Access Meta Business Manager
1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Select your **WhatsApp Business Account**
3. Navigate to **Configuration** → **Webhooks**

### Step 2: Add Webhook URL
**Webhook URL:**
```
https://your-domain.com/api/webhooks/whatsapp
```

For local testing with ngrok:
```
https://your-ngrok-url.ngrok.io/api/webhooks/whatsapp
```

**Verify Token:**
```
pixels_webhook_secret_2025
```
*(Must match `META_VERIFY_TOKEN` in your .env file)*

### Step 3: Subscribe to Webhook Fields
Check these fields to receive updates:

✅ **messages** - Receive incoming messages from users
✅ **message_status** - Get delivery/read receipts (CRITICAL)

Optional:
⚠️ **messaging_handovers** - Agent handover events (can skip if causing errors)

### Step 4: Save and Test
1. Click **Verify and Save**
2. Meta will call your webhook with verification challenge
3. Your server should respond with the challenge string
4. Status should show **Verified ✓**

---

## 🧪 Testing Your Webhook

### Test 1: Webhook Verification (GET)
```bash
curl "http://localhost:5050/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=pixels_webhook_secret_2025&hub.challenge=test123"
```

**Expected Response:**
```
test123
```

### Test 2: Simulate Incoming Message (POST)
```bash
curl -X POST "http://localhost:5050/api/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test_entry",
      "changes": [{
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "phone_number_id": "889344924259692",
            "display_phone_number": "918087131777"
          },
          "contacts": [{
            "profile": {
              "name": "Test User"
            },
            "wa_id": "918087131777"
          }],
          "messages": [{
            "from": "918087131777",
            "id": "wamid.test123",
            "timestamp": "1700000000",
            "type": "text",
            "text": {
              "body": "Hello"
            }
          }]
        }
      }]
    }]
  }'
```

**Expected Response:**
```
OK (200)
```

### Test 3: Simulate Status Update (POST)
```bash
curl -X POST "http://localhost:5050/api/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test_entry",
      "changes": [{
        "field": "messages",
        "value": {
          "statuses": [{
            "id": "wamid.HBgMOTE4MDg3MTMxNzc3FQIAERgSMzdFOEE4QUYyNEMzQjU4MjQzAA==",
            "status": "delivered",
            "timestamp": "1700000000",
            "recipient_id": "918087131777"
          }]
        }
      }]
    }]
  }'
```

**Expected Response:**
```
OK (200)
```

---

## 📊 What Gets Tracked

### Incoming Messages
When a user sends a message to your WABA number:
1. Webhook receives message data
2. **Contact** created/updated with user info
3. **Conversation** thread created/updated
4. **Message** saved to database (direction: inbound)
5. **Keyword rules** checked for auto-reply

### Status Updates
When your sent message changes status:
1. Webhook receives status update
2. **Message** status updated (sent → delivered → read)
3. **Phone number stats** incremented
4. **Status history** recorded

---

## 🔍 Monitoring Webhooks

### Check Server Logs
```bash
tail -f logs/webhook.log
```

Look for:
- `🔔🔔🔔 WEBHOOK HIT!` - Webhook received
- `✅ Status updated in database` - Status processed
- `✅ Saved incoming message` - Message saved
- `✅ Matched keyword rule` - Auto-reply triggered

### Check Meta Webhook Logs
1. Meta Business Manager → WhatsApp → Configuration → Webhooks
2. Click **Recent Deliveries** tab
3. Check for:
   - ✅ 200 OK responses = Working
   - ❌ 4xx/5xx errors = Check server logs
   - ⚠️ No requests = Subscription issue

---

## 🚨 Troubleshooting

### Issue: Webhook verification fails
**Solution:**
- Check `META_VERIFY_TOKEN` in .env matches Meta configuration
- Ensure server is publicly accessible
- Test with curl command above

### Issue: Messages not being received
**Solution:**
- Verify `messages` field is subscribed in Meta
- Check phone number ID matches your WABA
- Ensure `phoneNumberId` exists in your database

### Issue: Status updates not working
**Solution:**
- Verify `message_status` field is subscribed (CRITICAL)
- Check that sent messages have `waMessageId` in database
- Status updates only work for messages sent via Meta API

### Issue: Keyword auto-reply not triggering
**Solution:**
- Check keyword rules are active (`isActive: true`)
- Verify keywords match (case-insensitive)
- Check rule applies to correct phone number

---

## 🎯 Quick Fix Checklist

- [ ] Server running and publicly accessible
- [ ] Webhook URL configured in Meta
- [ ] Verify token matches .env file
- [ ] `messages` field subscribed
- [ ] `message_status` field subscribed
- [ ] Phone number configured in database
- [ ] Test with curl commands above
- [ ] Check server logs for errors

---

## 📚 Additional Resources

- [Meta WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Webhook Subscription Guide](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)
- [Webhook Security](https://developers.facebook.com/docs/graph-api/webhooks/security)

---

## 🎉 Success Checklist

When everything is working, you should see:

✅ Webhook verification passes in Meta
✅ `Recent Deliveries` shows 200 OK responses
✅ Incoming messages saved to database
✅ Status updates reflected in database
✅ Keyword auto-replies sent automatically
✅ Conversation threads created
✅ Contact records updated

---

**Need Help?** Check the server logs first - they're very detailed!

```bash
# View live webhook logs
cd backend
node server.js | grep WEBHOOK
```
