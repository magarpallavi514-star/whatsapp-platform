/**
 * 🔍 WEBHOOK VERIFICATION SCRIPT
 * Checks if webhook is working for ALL phone numbers correctly
 * Tests: Phone number mapping, message routing, account isolation
 */

const scenarios = [
  {
    name: "Single Phone Number Test",
    description: "Account with 1 phone number",
    setup: {
      account: "Account A (1 phone)",
      phones: ["108765432109876"],
      workspace: "workspace-001"
    },
    test: `
    Expected Behavior:
    1. Send message to phone 108765432109876
    2. Webhook receives it
    3. Conversation created with:
       - accountId: ObjectId
       - workspaceId: ObjectId
       - phoneNumberId: "108765432109876"
    4. Message saved and broadcast ✓
    
    Logs to Watch:
    ✅ Phone Number ID: 108765432109876 (should be string)
    ✅ Account ObjectId type: object
    ✅ Conversation ID (MongoDB _id): 65a7b8c9d0e1f2...
    ✅ Broadcast new_message successful
    `
  },
  {
    name: "Multi-Phone Number Test",
    description: "Account with 2+ phone numbers",
    setup: {
      account: "Account B (3 phones)",
      phones: ["108765432109876", "119876543210987", "220987654321098"],
      workspace: "workspace-002"
    },
    test: `
    Expected Behavior:
    1. Send message to phone 108765432109876
    2. Webhook receives → Account B, Phone 1 ✓
    3. Conversation created for Phone 1 (NOT mixed with Phone 2)
    
    4. Send message to phone 119876543210987
    5. Webhook receives → Account B, Phone 2 ✓
    6. Conversation created for Phone 2 (separate from Phone 1)
    
    CRITICAL: Each phone has separate conversation list
    
    Logs to Watch:
    Message 1: Phone Number ID: 108765432109876
    Message 2: Phone Number ID: 119876543210987
    
    Should NOT mix conversations between phones!
    
    Expected Database:
    db.conversations.find({ accountId: ObjectIdB })
    → Should return 2+ conversations (one per phone)
    → Each has different phoneNumberId
    `
  },
  {
    name: "Multi-Workspace Test",
    description: "Same account, different workspaces",
    setup: {
      account: "Account C",
      workspace1: "workspace-C1",
      workspace2: "workspace-C2",
      phones_w1: ["108765432109876"],
      phones_w2: ["119876543210987"]
    },
    test: `
    Expected Behavior:
    1. Workspace C1 has phone 108765432109876
    2. Workspace C2 has phone 119876543210987
    3. Same account but different workspaces
    
    4. Send message to phone 108765432109876
    5. Webhook → Find conversation with:
       accountId: ObjectIdC
       workspaceId: ObjectIdC1
       phoneNumberId: "108765432109876"
    
    6. Send message to phone 119876543210987
    7. Webhook → Find conversation with:
       accountId: ObjectIdC
       workspaceId: ObjectIdC2
       phoneNumberId: "119876543210987"
    
    CRITICAL: Conversations isolated by BOTH workspace + phone
    
    Expected Logs:
    Message 1 to phone 1:
      accountId: ObjectIdC
      workspaceId: ObjectIdC1
      phoneNumberId: 108765432109876
    
    Message 2 to phone 2:
      accountId: ObjectIdC
      workspaceId: ObjectIdC2
      phoneNumberId: 119876543210987
    `
  },
  {
    name: "Phone Number Mismatch Test",
    description: "Message to phone not configured",
    setup: {
      account: "Account D",
      configured_phones: ["108765432109876"],
      received_from_phone: "999999999999999"
    },
    test: `
    Expected Behavior:
    1. Webhook receives message from unconfigured phone 999999999999999
    2. Backend tries to find account by phoneNumberId
    3. Phone NOT in database → Query fails
    4. Webhook logs error and returns 200 (acknowledges to Meta)
    
    Expected Logs:
    ❌ Phone number not configured in system: 999999999999999
    OR
    ❌ Phone number not configured for this account
    
    IMPORTANT: Webhook should NOT crash, just log error
    `
  }
];

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║          🔍 WEBHOOK VERIFICATION - TEST SCENARIOS 🔍               ║
╚════════════════════════════════════════════════════════════════════╝

Run these tests to verify webhook works for ALL phone numbers:

`);

scenarios.forEach((scenario, index) => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST ${index + 1}: ${scenario.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Description: ${scenario.description}

Setup: ${JSON.stringify(scenario.setup, null, 2)}
${scenario.test}
`);
});

console.log(`

╔════════════════════════════════════════════════════════════════════╗
║               📋 WEBHOOK VERIFICATION CHECKLIST                   ║
╚════════════════════════════════════════════════════════════════════╝

For EACH phone number in your account, verify:

Phone 1: [YOUR_PHONE_ID_1]
  ☐ Can receive messages?
  ☐ Webhook logs show correct phoneNumberId?
  ☐ Conversation created with correct phoneNumberId?
  ☐ Messages don't mix with other phones?

Phone 2: [YOUR_PHONE_ID_2]
  ☐ Can receive messages?
  ☐ Webhook logs show correct phoneNumberId?
  ☐ Conversation created (separate from Phone 1)?
  ☐ Inbox doesn't show Phone 1 conversations?

Phone 3: [YOUR_PHONE_ID_3]
  ☐ (If applicable) Same as Phone 1 & 2


╔════════════════════════════════════════════════════════════════════╗
║            🔧 HOW TO TEST EACH PHONE NUMBER                       ║
╚════════════════════════════════════════════════════════════════════╝

STEP 1: Identify Your Phone Numbers
  Get from: Settings → WhatsApp Setup → Connected Phones
  Example:
    - Phone 1: 108765432109876 (Owned number)
    - Phone 2: 119876543210987 (Secondary number)

STEP 2: Send Test Message From Each Phone's Customer
  Option A: Use WhatsApp (send from real customer phone)
  Option B: Use Meta Webhook Tester

STEP 3: Check Backend Logs
  Watch for:
    ✅ Phone Number ID: [PHONE_ID] (should match what you sent from)
    ✅ Conversation created with phoneNumberId: [PHONE_ID]
    ❌ NOT mixing with other phone IDs

STEP 4: Verify Database
  MongoDB:
    db.conversations.find({
      phoneNumberId: "108765432109876"
    })
    
  Should return: Conversations ONLY for Phone 1
  Should NOT return: Conversations for Phone 2


╔════════════════════════════════════════════════════════════════════╗
║           🚨 COMMON WEBHOOK ISSUES & FIXES                        ║
╚════════════════════════════════════════════════════════════════════╝

ISSUE 1: Phone number not recognized
  Symptom:
    ❌ "Phone number not configured in system: [PHONE_ID]"
  
  Cause:
    - Phone not added to PhoneNumber collection
    - Phone not linked to account
    - Wrong Meta phone ID
  
  Fix:
    1. Check PhoneNumber.findOne({ phoneNumberId })
    2. Verify phone exists in database
    3. Verify accountId matches webhook account
    4. Verify workspaceId is set


ISSUE 2: Messages mixing between phones
  Symptom:
    ❌ Send to Phone 1, conversation shows messages from Phone 2
  
  Cause:
    - Query not scoped by phoneNumberId
    - Conversation query missing phoneNumberId filter
  
  Fix (Already Applied):
    ✅ conversationController now requires phoneNumberId
    ✅ Webhook creates conversation with phoneNumberId
    ✅ All queries filter by (accountId, workspaceId, phoneNumberId)


ISSUE 3: Wrong account receives message
  Symptom:
    ❌ Webhook matches to wrong account
  
  Cause:
    - Phone number mapped to multiple accounts
    - WABA ID confusion
  
  Fix:
    1. Verify PhoneNumber.accountId is correct
    2. Check Account.wabaId matches webhook entry.id
    3. Ensure PhoneNumber.workspaceId is set


ISSUE 4: Conversation created but message not saved
  Symptom:
    ✅ Logs show: "Conversation created"
    ❌ Message doesn't appear in chat
  
  Cause:
    - Message save failed silently
    - conversationId mismatch
    - Message.accountId or phoneNumberId undefined
  
  Fix:
    1. Check Message.conversationId is ObjectId
    2. Verify Message.accountId matches Conversation.accountId
    3. Verify Message.phoneNumberId matches Conversation.phoneNumberId


╔════════════════════════════════════════════════════════════════════╗
║               🔍 DEBUG LOGS TO WATCH                              ║
╚════════════════════════════════════════════════════════════════════╝

When you send a test message, backend logs should show:

GOOD ✅:
  🔔 WEBHOOK HIT
  ✅ Phone Number ID: 108765432109876 (type: string)
  ✅ Account ObjectId type: object
  ✅ Conversation ID: 65a7b8c9d0e1f2...
  📡 Broadcasted new message via Socket.io
  ✅ Broadcast new_message successful

BAD ❌:
  ✅ Phone Number ID: undefined (missing - frontend issue)
  ❌ Phone number not configured (phone not in DB)
  ❌ Account not found (WABA ID mismatch)
  ❌ Broadcast new_message failed (Socket.io issue)


╔════════════════════════════════════════════════════════════════════╗
║                  ✅ VERIFICATION SUCCESS CRITERIA                 ║
╚════════════════════════════════════════════════════════════════════╝

You'll know webhook is working correctly when:

1. Single Phone Number:
   ✓ Send message → Appears in inbox <100ms
   ✓ Logs show: phoneNumberId: [EXACT_ID]

2. Multiple Phone Numbers:
   ✓ Phone 1 messages in Phone 1 inbox only
   ✓ Phone 2 messages in Phone 2 inbox only
   ✓ No conversation mixing
   ✓ Each phone has separate conversation list

3. Multi-Workspace:
   ✓ Workspace 1 users see Phone 1 only
   ✓ Workspace 2 users see Phone 2 only
   ✓ Conversations properly isolated

4. Error Handling:
   ✓ Message from unknown phone → Error logged, no crash
   ✓ Webhook returns 200 to Meta (acknowledged)
   ✓ No null pointer exceptions


╔════════════════════════════════════════════════════════════════════╗
║                    🧪 QUICK TEST COMMANDS                         ║
╚════════════════════════════════════════════════════════════════════╝

Check database has phone numbers:
  db.phonenumbers.find().pretty()
  
  Should show:
    _id: ObjectId
    phoneNumberId: "108765432109876"
    accountId: ObjectId
    workspaceId: ObjectId
    isActive: true

Check conversations per phone:
  db.conversations.aggregate([
    { $group: { _id: "$phoneNumberId", count: { $sum: 1 } } }
  ])
  
  Should show separate counts for each phone

Check messages per conversation:
  db.conversations.findOne({ phoneNumberId: "108765432109876" })
  
  Then:
  db.messages.find({
    conversationId: ObjectId("65a7b8c9...")
  }).count()

`);
