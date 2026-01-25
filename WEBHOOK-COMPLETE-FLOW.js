/**
 * 🎯 WEBHOOK PHONE MAPPING - EXACT FLOW DIAGRAM
 * 
 * This shows EXACTLY how webhook should map phone numbers to conversations
 * when message arrives from Meta
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║     🎯 WEBHOOK PHONE MAPPING - COMPLETE FLOW DIAGRAM 🎯           ║
║              How messages route to correct conversation            ║
╚════════════════════════════════════════════════════════════════════╝


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: META WEBHOOK ARRIVES AT BACKEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Meta sends POST to: https://yoursite.com/api/webhooks/whatsapp

Body contains:
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789012345",  ← WABA ID (Business Account)
      "changes": [
        {
          "field": "messages",
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "phone_number_id": "108765432109876",  ← Phone number ID
              "display_phone_number": "1 201-555-0123"
            },
            "contacts": [...],
            "messages": [
              {
                "from": "5511987654321",  ← Customer's WhatsApp number
                "id": "wamid...",
                "timestamp": "1234567890",
                "type": "text",
                "text": { "body": "Hello!" }
              }
            ]
          }
        }
      ]
    }
  ]
}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: BACKEND EXTRACTS KEY IDs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Code: backend/src/controllers/webhookController.js

Extract:
  wabaId = body.entry[0].id = "123456789012345"
  phoneNumberId = value.metadata.phone_number_id = "108765432109876"
  customerNumber = message.from = "5511987654321"
  timestamp = message.timestamp

Logs:
  🔔 WEBHOOK HIT
  ✅ WABA ID: 123456789012345
  ✅ Phone Number ID: 108765432109876
  ✅ From: 5511987654321


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: FIND ACCOUNT BY WABA ID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Code:
  const targetAccount = await Account.findOne({
    wabaId: "123456789012345"
  });

Database Query:
  db.accounts.findOne({ wabaId: "123456789012345" })

Result (if configured correctly):
  {
    "_id": ObjectId("6971e3a706837a5539992bee"),  ← Account ID
    "wabaId": "123456789012345",
    "companyName": "Enromatics",
    "defaultWorkspaceId": ObjectId("6971e3a706837a5539992bee")
  }

Logs:
  ✅ Found account: 6971e3a706837a5539992bee
  ✅ Account WABA ID: 123456789012345

If NOT found:
  ❌ Account not found for WABA ID: 123456789012345
  → FIX: Create Account with this wabaId OR update phone.wabaId to match


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: FIND OR CREATE PHONE CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Code:
  const phoneConfig = await PhoneNumber.findOne({
    accountId: "6971e3a706837a5539992bee",
    phoneNumberId: "108765432109876",
    isActive: true
  });

Database Query:
  db.phonenumbers.findOne({
    accountId: ObjectId("6971e3a706837a5539992bee"),
    phoneNumberId: "108765432109876",
    isActive: true
  })

Result (if configured correctly):
  {
    "_id": ObjectId("..."),
    "phoneNumberId": "108765432109876",
    "accountId": ObjectId("6971e3a706837a5539992bee"),
    "workspaceId": ObjectId("6971e3a706837a5539992bee"),
    "wabaId": "123456789012345",
    "businessName": "Enromatics",
    "displayName": "Customer Support",
    "accessToken": "encrypted_token_here",
    "isActive": true
  }

Logs:
  ✅ Phone number configured: 108765432109876
  ✅ Account: 6971e3a706837a5539992bee
  ✅ Workspace: 6971e3a706837a5539992bee

If NOT found:
  ❌ Phone number not configured for this account: 108765432109876
  → FIX: Create PhoneNumber record with these details


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5: FIND OR CREATE CONVERSATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Code:
  const conversationDoc = await Conversation.findOneAndUpdate(
    {
      accountId: "6971e3a706837a5539992bee",
      workspaceId: "6971e3a706837a5539992bee",
      phoneNumberId: "108765432109876",
      customerNumber: "5511987654321"
    },
    {
      $setOnInsert: { /* ... */ },
      $set: { lastMessageAt: new Date(), status: "open" }
    },
    { upsert: true, new: true }
  );

Database Query (upsert):
  db.conversations.findOneAndUpdate(
    {
      accountId: ObjectId("6971e3a706837a5539992bee"),
      workspaceId: ObjectId("6971e3a706837a5539992bee"),
      phoneNumberId: "108765432109876",
      customerNumber: "5511987654321"
    },
    { /* updates */ },
    { upsert: true, new: true }
  )

Result:
  {
    "_id": ObjectId("65a7b8c9d0e1f2g3h4i5j6k7"),  ← Conversation ID
    "accountId": ObjectId("6971e3a706837a5539992bee"),
    "workspaceId": ObjectId("6971e3a706837a5539992bee"),
    "phoneNumberId": "108765432109876",
    "customerNumber": "5511987654321",
    "startedAt": ISODate("..."),
    "lastMessageAt": ISODate("..."),
    "status": "open",
    "unreadCount": 1
  }

Logs:
  ✅ Conversation ID (MongoDB _id): 65a7b8c9d0e1f2g3h4i5j6k7
  ✅ Created new conversation OR found existing


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6: SAVE MESSAGE WITH CORRECT CONVERSATION ID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Code:
  const messageDoc = new Message({
    conversationId: conversationDoc._id,  ← CRITICAL: Must be conversation ID
    accountId: phoneConfig.accountId,
    phoneNumberId: "108765432109876",
    recipientPhone: "5511987654321",
    direction: "inbound",
    messageType: "text",
    content: { text: "Hello!" },
    metaMessageId: "wamid...",
    status: "received",
    timestamp: new Date(parseInt(timestamp) * 1000)
  });
  
  await messageDoc.save();

Database Insert:
  db.messages.insertOne({
    conversationId: ObjectId("65a7b8c9d0e1f2g3h4i5j6k7"),
    accountId: ObjectId("6971e3a706837a5539992bee"),
    phoneNumberId: "108765432109876",
    recipientPhone: "5511987654321",
    content: { text: "Hello!" },
    direction: "inbound",
    status: "received",
    createdAt: ISODate("...")
  })

Logs:
  ✅ Message saved: 65a7b8c9d0e1f2g3h4i5j6k7
  ✅ ConversationId set correctly


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7: BROADCAST VIA SOCKET.IO TO ALL CONNECTED CLIENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Code:
  broadcastNewMessage(
    io,
    conversationDoc._id.toString(),  ← "65a7b8c9d0e1f2g3h4i5j6k7"
    messageDoc,
    conversationDoc
  );

Implementation:
  io.to(\`conversation:\${conversationId}\`).emit("new_message", {
    message: messageDoc,
    conversation: conversationDoc
  });

Broadcasting to Room:
  Room name: "conversation:65a7b8c9d0e1f2g3h4i5j6k7"
  Event: "new_message"
  Data: { message, conversation }

Logs:
  📡 Broadcasted new message via Socket.io
  ✅ Broadcast new_message successful


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 8: FRONTEND RECEIVES IN REAL-TIME (<100ms)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend Socket.io listener:
  socket.on(\`new_message\`, (data) => {
    const { message, conversation } = data;
    
    // If this is the current conversation, show message
    if (currentConversationId === conversation._id) {
      addMessageToUI(message);
      updateLastMessage(conversation.lastMessageAt);
    }
    
    // Update conversation list
    updateInbox(conversation);
  });

Result:
  ✅ Message appears in chat <100ms
  ✅ Unread badge updates
  ✅ Conversation moves to top of inbox


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTI-PHONE ROUTING (CRITICAL FOR YOUR CASE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If your account has MULTIPLE phones:

Scenario: Message comes to Phone 2 instead of Phone 1

Meta webhook:
  {
    entry.id: "123456789012345",  ← Same WABA (one business account)
    metadata.phone_number_id: "119876543210987",  ← Different phone!
    message.from: "5521987654321"  ← Different customer
  }

Backend processing:
  1. Find account by WABA ID
     → Account: Enromatics (same account)
     → Has access to BOTH phones ✅

  2. Find phone by phoneNumberId
     → Query: { accountId, phoneNumberId: "119876543210987", isActive: true }
     → Found: Phone 2 configuration ✅
     → Workspace: Same workspace

  3. Find or create conversation
     → Query: {
         accountId,
         workspaceId,
         phoneNumberId: "119876543210987",  ← Different from Phone 1
         customerNumber: "5521987654321"
       }
     → Result: New conversation (NOT mixed with Phone 1) ✅

  4. Save message and broadcast
     → conversationId: Different conversation ID
     → Room: "conversation:\${different_id}"
     → Frontend sees Phone 2 conversations separate from Phone 1 ✅


CRITICAL: Each phone gets its own conversations!
  Phone 1 (108765432109876):
    ├─ Conversation: Customer A
    ├─ Conversation: Customer B
    └─ Messages only for Phone 1

  Phone 2 (119876543210987):
    ├─ Conversation: Customer C
    └─ Messages only for Phone 2

Never mixed, never confused. ✅


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE QUERY VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To verify your setup is correct, run these MongoDB queries:

1. Check Account has correct WABA ID:
   
   db.accounts.findOne({ _id: ObjectId("6971e3a706837a5539992bee") })
   
   Expected: wabaId is NOT null/undefined


2. Check all phones configured for account:
   
   db.phonenumbers.find({ accountId: ObjectId("6971e3a706837a5539992bee") }).pretty()
   
   Expected: Each phone has phoneNumberId, wabaId, workspaceId, isActive: true


3. Check conversations are separated by phone:
   
   db.conversations.aggregate([
     { $match: { accountId: ObjectId("6971e3a706837a5539992bee") } },
     { $group: { _id: "$phoneNumberId", count: { $sum: 1 } } }
   ])
   
   Expected: Each phone has its own conversation count


4. Verify message-conversation linking:
   
   db.messages.findOne({ conversationId: { $exists: true, $ne: null } })
   
   Expected: Message.conversationId matches Conversation._id


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY: HOW WEBHOOK MAPS PHONE NUMBERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Message Flow:
  Meta → WABA ID → Find Account ✅
       → Phone ID → Find Phone Config ✅
       → Customer Phone → Find/Create Conversation ✅
       → Conversation ID → Broadcast via Socket.io ✅
       → Frontend receives and displays ✅

For Multiple Phones:
  Each phone number:
    ✅ Has separate PhoneNumber record
    ✅ Has separate Conversation set
    ✅ Has separate message stream
    ✅ Never mixed with other phones

Key Fields for Isolation:
  - accountId: Groups all data for one business
  - workspaceId: Groups within account (teams/branches)
  - phoneNumberId: Specific phone in workspace
  - customerNumber: Individual customer

Verification Checklist:
  ☑ Account.wabaId matches PhoneNumber.wabaId
  ☑ PhoneNumber has phoneNumberId from Meta
  ☑ PhoneNumber.isActive = true
  ☑ Conversations scoped by (accountId, workspaceId, phoneNumberId)
  ☑ Messages have conversationId pointing to Conversation._id
  ☑ Socket.io uses conversation._id for rooms

Result:
  ✅ Webhook works for ALL phone numbers
  ✅ Messages route to correct conversation
  ✅ Each phone isolated from others
  ✅ Ready for production

`);
