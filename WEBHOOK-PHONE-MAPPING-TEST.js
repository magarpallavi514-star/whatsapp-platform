/**
 * 🔍 WEBHOOK PHONE NUMBER MAPPING VERIFICATION
 * Tests if each phone number properly maps to conversations
 * 
 * Run this in MongoDB shell or Compass
 */

// =====================================================================
// PART 1: VERIFY PHONE NUMBER REGISTRATION
// =====================================================================

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║        WEBHOOK PHONE NUMBER MAPPING VERIFICATION TESTS             ║
╚════════════════════════════════════════════════════════════════════╝

STEP 1: Check all registered phone numbers in system
`);

// Find all active phone numbers
const phoneNumbers = db.phonenumbers.find({ isActive: true }).toArray();

console.log(`\nFound ${phoneNumbers.length} active phone number(s):\n`);

phoneNumbers.forEach(phone => {
  console.log(`
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Phone Number ID: ${phone.phoneNumberId}
  Account: ${phone.accountId}
  Workspace: ${phone.workspaceId}
  Business ID: ${phone.wabaId || 'NOT SET'}
  Business Name: ${phone.businessName || 'N/A'}
  Display Name: ${phone.displayName || phone.businessName || 'N/A'}
  Status: ${phone.isActive ? '✅ Active' : '❌ Inactive'}
  Display Phone: ${phone.displayPhone || 'N/A'}
  Created: ${new Date(phone.createdAt).toLocaleString()}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// =====================================================================
// PART 2: VERIFY WEBHOOK CAN FIND ACCOUNTS BY PHONE + WABA
// =====================================================================

console.log(`

STEP 2: Simulate webhook lookups (what backend does)
`);

// For each phone number, simulate finding the account
phoneNumbers.forEach(phone => {
  console.log(`
  Testing phone: ${phone.phoneNumberId}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Scenario 1: Lookup by WABA ID (entry.id from Meta)
    Query: db.accounts.findOne({ wabaId: "${phone.wabaId}" })
  `);
  
  const accountByWaba = db.accounts.findOne({ wabaId: phone.wabaId });
  
  if (accountByWaba) {
    console.log(`    Result: ✅ Found account ${accountByWaba._id}`);
  } else {
    console.log(`    Result: ❌ Account NOT FOUND - THIS IS A PROBLEM!`);
    console.log(`    Fix: Make sure Account.wabaId = "${phone.wabaId}"`);
  }
  
  console.log(`
  Scenario 2: Verify phone exists for this account
    Query: db.phonenumbers.findOne({ 
      accountId: ObjectId("${accountByWaba._id}"),
      phoneNumberId: "${phone.phoneNumberId}",
      isActive: true 
    })
  `);
  
  const phoneForAccount = db.phonenumbers.findOne({
    accountId: accountByWaba._id,
    phoneNumberId: phone.phoneNumberId,
    isActive: true
  });
  
  if (phoneForAccount) {
    console.log(`    Result: ✅ Phone configured for account`);
  } else {
    console.log(`    Result: ❌ Phone NOT linked to account - THIS IS A PROBLEM!`);
  }
});

// =====================================================================
// PART 3: VERIFY CONVERSATION ISOLATION BY PHONE NUMBER
// =====================================================================

console.log(`

STEP 3: Check conversations are properly isolated by phone number
`);

const conversationsByPhone = db.conversations.aggregate([
  {
    $group: {
      _id: '$phoneNumberId',
      count: { $sum: 1 },
      conversations: {
        $push: {
          id: '$_id',
          customerNumber: '$customerNumber',
          accountId: '$accountId',
          workspaceId: '$workspaceId',
          lastMessageAt: '$lastMessageAt'
        }
      }
    }
  },
  { $sort: { _id: 1 } }
]).toArray();

console.log(`\nFound conversations grouped by phone number:\n`);

conversationsByPhone.forEach(group => {
  console.log(`
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Phone Number ID: ${group._id}
  Total Conversations: ${group.count}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  // Show first 5 conversations for this phone
  group.conversations.slice(0, 5).forEach((conv, idx) => {
    console.log(`
    ${idx + 1}. Conversation: ${conv.id}
       Customer: +${conv.customerNumber}
       Account: ${conv.accountId}
       Workspace: ${conv.workspaceId}
       Last Message: ${new Date(conv.lastMessageAt).toLocaleString()}
    `);
  });
  
  if (group.count > 5) {
    console.log(`    ... and ${group.count - 5} more conversations`);
  }
});

// =====================================================================
// PART 4: VERIFY MESSAGES PROPERLY LINKED TO CONVERSATIONS
// =====================================================================

console.log(`

STEP 4: Verify message-to-conversation mapping
`);

phoneNumbers.forEach(phone => {
  const recentConversations = db.conversations.find({
    phoneNumberId: phone.phoneNumberId
  }).limit(3).toArray();
  
  console.log(`
  Phone: ${phone.phoneNumberId}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  recentConversations.forEach((conv, idx) => {
    const messageCount = db.messages.countDocuments({
      conversationId: conv._id
    });
    
    const messages = db.messages.find({
      conversationId: conv._id
    }).limit(2).toArray();
    
    console.log(`
    Conversation ${idx + 1}: ${conv._id}
    With customer: +${conv.customerNumber}
    Messages: ${messageCount}
    `);
    
    messages.forEach(msg => {
      console.log(`
      - Message ${msg._id}: "${msg.content.text || msg.messageType}"
        Direction: ${msg.direction}
        Created: ${new Date(msg.createdAt).toLocaleString()}
        ConversationId matches: ${msg.conversationId.equals(conv._id) ? '✅ YES' : '❌ NO'}
      `);
    });
  });
});

// =====================================================================
// PART 5: WEBHOOK PATH VERIFICATION DIAGRAM
// =====================================================================

console.log(`

STEP 5: Webhook message routing flow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLOW: Meta Webhook → Backend → Conversation → Socket.io

For each incoming message:

1. Extract from Meta:
   ├─ entry.id (WABA ID) ← "12345678901234567"
   ├─ value.messages[].from (customer phone) ← "5511987654321"
   └─ value.metadata.phone_number_id (phone) ← "108765432109876"

2. Backend resolves:
   ├─ Find Account by: wabaId = entry.id
   │  └─ Returns: Account._id (ObjectId)
   │
   ├─ Find PhoneNumber by: phoneNumberId + accountId
   │  └─ Returns: PhoneNumber.workspaceId
   │
   └─ All scoped by: accountId + workspaceId + phoneNumberId

3. Upsert Conversation:
   ├─ Query: { accountId, workspaceId, phoneNumberId, customerNumber }
   ├─ Set: lastMessageAt, status
   └─ Returns: Conversation._id (MongoDB ObjectId)

4. Save Message:
   ├─ conversationId: Conversation._id
   ├─ accountId: Account._id
   ├─ phoneNumberId: "108765432109876"
   └─ content: text/image/etc

5. Socket.io Broadcast:
   ├─ Room: conversation:\${Conversation._id}
   ├─ Event: new_message
   └─ Delivered to: All connected clients in that room


CRITICAL CHECKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Get all active accounts
const accounts = db.accounts.find({ isActive: true }).toArray();

accounts.forEach(account => {
  console.log(`

  Account: ${account.accountId || account._id} (${account.companyName})
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  WABA ID: ${account.wabaId}
  Default Workspace: ${account.defaultWorkspaceId}
  
  ✅ Check 1: Phone numbers configured for this account
  `);
  
  const phonesForAccount = db.phonenumbers.find({
    accountId: account._id,
    isActive: true
  }).toArray();
  
  console.log(`    Found ${phonesForAccount.length} phone(s)`);
  
  phonesForAccount.forEach(phone => {
    console.log(`
    ├─ ${phone.phoneNumberId}
    │  ├─ Workspace: ${phone.workspaceId}
    │  ├─ WABA ID: ${phone.wabaId}
    │  └─ Business: ${phone.businessName}
    `);
  });
  
  console.log(`
  ✅ Check 2: Account.wabaId matches PhoneNumber.wabaId
  `);
  
  phonesForAccount.forEach(phone => {
    const match = account.wabaId === phone.wabaId;
    console.log(`    ${phone.phoneNumberId}: ${match ? '✅ MATCH' : '❌ MISMATCH!'}`);
  });
  
  console.log(`
  ✅ Check 3: All conversations are properly scoped
  `);
  
  const conversationsForAccount = db.conversations.find({
    accountId: account._id
  }).toArray();
  
  console.log(`    Total conversations: ${conversationsForAccount.length}`);
  
  // Group by phone
  const phoneGroups = {};
  conversationsForAccount.forEach(conv => {
    if (!phoneGroups[conv.phoneNumberId]) {
      phoneGroups[conv.phoneNumberId] = 0;
    }
    phoneGroups[conv.phoneNumberId]++;
  });
  
  Object.entries(phoneGroups).forEach(([phoneId, count]) => {
    console.log(`    ├─ ${phoneId}: ${count} conversation(s)`);
  });
});

console.log(`

╔════════════════════════════════════════════════════════════════════╗
║                    ✅ VERIFICATION COMPLETE                       ║
╚════════════════════════════════════════════════════════════════════╝

Review the output above:
  
  ✅ If you see "Found X active phone number(s)" → Phones are registered
  
  ✅ If all phone lookups show "✅ Found account" → Webhook will work
  
  ✅ If messages show "ConversationId matches: ✅ YES" → Routing is correct
  
  ❌ If you see any "❌" symbols → See FIXES section below


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIXES IF SOMETHING FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FIX 1: "Account NOT FOUND"
  Problem: Account.wabaId doesn't match phone webhook WABA ID
  
  Identify the issue:
    db.accounts.find({ _id: ObjectId("...") })
    → Check wabaId field
    
    db.phonenumbers.find({ accountId: ObjectId("...") })
    → Check wabaId field in phone
  
  Solution: Update Account to match phone's WABA ID
    db.accounts.updateOne(
      { _id: ObjectId("YOUR_ACCOUNT_ID") },
      { $set: { wabaId: "12345678901234567" } }
    )


FIX 2: "Phone NOT linked to account"
  Problem: PhoneNumber not created or has wrong accountId
  
  Check:
    db.phonenumbers.find({ phoneNumberId: "108765432109876" }).pretty()
    → Verify accountId and workspaceId are ObjectIds (not strings)
  
  Solution: Create/update the phone number
    db.phonenumbers.updateOne(
      { phoneNumberId: "108765432109876" },
      { $set: { accountId: ObjectId("..."), workspaceId: ObjectId("...") } }
    )


FIX 3: "Conversations are mixing between phones"
  Problem: Backend not filtering by phoneNumberId correctly
  
  Check backend logs for:
    ✅ Phone Number ID: undefined
    
  If undefined: Frontend is not sending phoneNumberId in API calls
  
  Solution: Update frontend to send phoneNumberId
    See: frontend/app/dashboard/chat/page.tsx
    Change: GET /api/conversations?phoneNumberId=108765432109876


FIX 4: "Messages not linked to conversations"
  Problem: Message.conversationId is null or wrong type
  
  Check:
    db.messages.findOne({ conversationId: null })
    
  If found: Message save is failing silently
  
  Solution: Check backend logs for errors during message save
    Look for: "Error saving message:" in webhook logs


`);
