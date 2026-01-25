/**
 * 🔍 WEBHOOK PHONE MAPPING - ACTUAL DATA CHECK
 * 
 * Copy/paste these MongoDB commands to verify your setup
 * Run in: MongoDB Compass, mongosh, or db.runCommand()
 */

// =====================================================================
// CHECK 1: VERIFY ACCOUNT HAS WABA ID
// =====================================================================

console.log(`

╔════════════════════════════════════════════════════════════════════╗
║        🔍 YOUR ACTUAL DATA VERIFICATION SCRIPT 🔍                 ║
║          Copy these commands into MongoDB and run them             ║
╚════════════════════════════════════════════════════════════════════╝

USE THESE QUERIES TO CHECK YOUR SETUP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


QUERY 1: Check your account and WABA ID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

db.accounts.findOne({ companyName: "Enromatics" })

Expected output:
{
  "_id": ObjectId("6971e3a706837a5539992bee"),
  "companyName": "Enromatics",
  "wabaId": "123456789012345",  ← Should have this!
  "defaultWorkspaceId": ObjectId("..."),
  ...
}

⚠️  If wabaId is missing or null:
  db.accounts.updateOne(
    { _id: ObjectId("6971e3a706837a5539992bee") },
    { $set: { wabaId: "YOUR_META_WABA_ID_HERE" } }
  )


QUERY 2: List ALL phone numbers for your account
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

db.phonenumbers.find({
  accountId: ObjectId("6971e3a706837a5539992bee"),
  isActive: true
}).pretty()

Expected output (if you have 2 phones):
[
  {
    "_id": ObjectId("..."),
    "phoneNumberId": "108765432109876",  ← Meta phone ID 1
    "accountId": ObjectId("6971e3a706837a5539992bee"),
    "workspaceId": ObjectId("6971e3a706837a5539992bee"),
    "wabaId": "123456789012345",
    "businessName": "Enromatics",
    "isActive": true
  },
  {
    "_id": ObjectId("..."),
    "phoneNumberId": "119876543210987",  ← Meta phone ID 2
    "accountId": ObjectId("6971e3a706837a5539992bee"),
    "workspaceId": ObjectId("6971e3a706837a5539992bee"),
    "wabaId": "123456789012345",  ← Same WABA (same business)
    "businessName": "Enromatics",
    "isActive": true
  }
]

⚠️  If empty or missing phones:
  Need to register phones via Settings → WhatsApp Setup
  OR insert manually in MongoDB


QUERY 3: Verify conversations are isolated by phone
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

db.conversations.aggregate([
  { $match: { accountId: ObjectId("6971e3a706837a5539992bee") } },
  {
    $group: {
      _id: "$phoneNumberId",
      count: { $sum: 1 },
      workspaceId: { $first: "$workspaceId" },
      sampleCustomer: { $first: "$customerNumber" }
    }
  },
  { $sort: { _id: 1 } }
]).pretty()

Expected output:
[
  {
    "_id": "108765432109876",  ← Phone 1
    "count": 12,  ← 12 conversations for Phone 1
    "workspaceId": ObjectId("6971e3a706837a5539992bee"),
    "sampleCustomer": "5511987654321"
  },
  {
    "_id": "119876543210987",  ← Phone 2
    "count": 8,  ← 8 conversations for Phone 2 (NOT mixed)
    "workspaceId": ObjectId("6971e3a706837a5539992bee"),
    "sampleCustomer": "5521987654321"
  }
]

✅ If each phone has different count = phones are properly isolated


QUERY 4: Check if webhook was called for a specific phone
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

db.conversations.findOne({
  accountId: ObjectId("6971e3a706837a5539992bee"),
  phoneNumberId: "108765432109876"
})

Expected output:
{
  "_id": ObjectId("65a7b8c9d0e1f2..."),
  "accountId": ObjectId("6971e3a706837a5539992bee"),
  "workspaceId": ObjectId("6971e3a706837a5539992bee"),
  "phoneNumberId": "108765432109876",  ← Confirms webhook sent this phone
  "customerNumber": "5511987654321",
  "lastMessageAt": ISODate("2026-01-25T10:30:00Z"),
  "status": "open",
  "unreadCount": 2
}

✅ If found = webhook HAS been called for this phone


QUERY 5: Check messages are linked to correct conversation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

db.messages.findOne({
  accountId: ObjectId("6971e3a706837a5539992bee"),
  phoneNumberId: "108765432109876"
})

Expected output:
{
  "_id": ObjectId("..."),
  "conversationId": ObjectId("65a7b8c9d0e1f2..."),  ← Linked to conversation
  "accountId": ObjectId("6971e3a706837a5539992bee"),
  "phoneNumberId": "108765432109876",
  "recipientPhone": "5511987654321",
  "direction": "inbound",
  "content": { "text": "Hello!" },
  "status": "received",
  "createdAt": ISODate("2026-01-25T10:30:00Z")
}

✅ If conversationId exists = messages are properly linked


QUERY 6: Count total conversations per phone
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Phone 1
db.conversations.countDocuments({
  accountId: ObjectId("6971e3a706837a5539992bee"),
  phoneNumberId: "108765432109876"
})

// Phone 2
db.conversations.countDocuments({
  accountId: ObjectId("6971e3a706837a5539992bee"),
  phoneNumberId: "119876543210987"
})

Results show:
  Phone 1: 12 conversations
  Phone 2: 8 conversations

Verify: The counts are DIFFERENT and separate ✅


QUERY 7: Simulate webhook lookup process
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// This is what webhook does when message arrives

// Step 1: Find account by WABA ID (what Meta sends)
db.accounts.findOne({ wabaId: "123456789012345" })
// Result: Should find your account ✅

// Step 2: Find phone by phoneNumberId + accountId
db.phonenumbers.findOne({
  accountId: ObjectId("6971e3a706837a5539992bee"),
  phoneNumberId: "108765432109876"
})
// Result: Should find phone config ✅

// Step 3: Find conversations for this phone
db.conversations.find({
  accountId: ObjectId("6971e3a706837a5539992bee"),
  phoneNumberId: "108765432109876"
})
// Result: Should find all conversations for this phone only ✅


QUERY 8: Check recent webhook activity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Find most recent conversations (webhook created these)
db.conversations.find({
  accountId: ObjectId("6971e3a706837a5539992bee")
}).sort({ lastMessageAt: -1 }).limit(5).pretty()

Expected output:
[
  {
    phoneNumberId: "108765432109876",
    lastMessageAt: ISODate("2026-01-25T10:35:00Z")  ← Recent
  },
  {
    phoneNumberId: "119876543210987",
    lastMessageAt: ISODate("2026-01-25T10:30:00Z")  ← Recent
  },
  ...
]

✅ If you see recent timestamps = webhook is receiving messages


═══════════════════════════════════════════════════════════════════════
TROUBLESHOOTING CHECKLIST
═══════════════════════════════════════════════════════════════════════

If Account.wabaId is NULL/missing:
  ❌ Problem: Webhook can't find account
  ✅ Fix: db.accounts.updateOne(
      { _id: ObjectId("...") },
      { $set: { wabaId: "YOUR_META_WABA_ID" } }
    )

If PhoneNumber collection is empty:
  ❌ Problem: Webhook rejects unknown phones
  ✅ Fix: Add phones via Settings → WhatsApp Setup

If conversations show only one phone:
  ❌ Problem: Maybe other phone not configured yet
  ✅ Check: Run Query 2 - see all phones

If no conversations exist:
  ❌ Problem: Webhook hasn't been called yet
  ✅ Fix: Send a test WhatsApp message

If Message.conversationId is null:
  ❌ Problem: Messages aren't linked to conversations
  ✅ Fix: Check backend logs for save errors


═══════════════════════════════════════════════════════════════════════
SUMMARY: HOW TO VERIFY WEBHOOK WORKS FOR ALL PHONES
═══════════════════════════════════════════════════════════════════════

1. Run Query 1: Verify Account has wabaId ✓
2. Run Query 2: Verify all phones are registered ✓
3. Run Query 3: Verify conversations by phone ✓
4. Run Query 4: Verify webhook was called ✓
5. Run Query 5: Verify messages linked ✓
6. Send test message from each phone ✓
7. Check backend logs show correct phoneNumberId ✓
8. Verify message appears in chat <100ms ✓

If ALL checks pass: ✅ WEBHOOK READY FOR PRODUCTION

`);
