/**
 * 🔍 WEBHOOK VERIFICATION REPORT
 * 
 * Based on your debug logs showing:
 *   accountId: 6971e3a706837a5539992bee
 *   workspaceId: 6971e3a706837a5539992bee
 *   phoneNumberId: undefined ← PROBLEM
 * 
 * This script helps diagnose the webhook phone number mapping issue
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║        🔍 WEBHOOK PHONE MAPPING DIAGNOSTIC REPORT 🔍              ║
║              Status: phoneNumberId is UNDEFINED                  ║
╚════════════════════════════════════════════════════════════════════╝

CURRENT STATE FROM YOUR LOGS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User: info@enromatics.com
Account ID: 6971e3a706837a5539992bee
Workspace ID: 6971e3a706837a5539992bee
Phone Number ID: undefined ❌ MISSING

Problem: Frontend calling /api/conversations without phoneNumberId parameter

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1: VERIFY PHONE NUMBERS ARE REGISTERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run this in MongoDB:

  db.phonenumbers.find({ 
    accountId: ObjectId("6971e3a706837a5539992bee"),
    isActive: true 
  }).pretty()

Expected Output:
  {
    "_id": ObjectId(...),
    "phoneNumberId": "108765432109876",  ← Meta phone ID
    "accountId": ObjectId("6971e3a706837a5539992bee"),
    "workspaceId": ObjectId("6971e3a706837a5539992bee"),
    "wabaId": "123456789012345",        ← Meta WABA ID
    "businessName": "Enromatics",
    "displayName": "Customer Support",
    "isActive": true
  }

What This Checks:
  ✅ Phone numbers exist for your account?
  ✅ Each phone has a phoneNumberId (from Meta)?
  ✅ Each phone has a workspaceId?
  ✅ Each phone has a wabaId (Business Account ID)?


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 2: VERIFY ACCOUNT WABA ID MATCHES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When Meta webhook comes in:
  1. Meta sends: entry.id = "123456789012345" (WABA ID)
  2. Backend queries: Account.findOne({ wabaId: "123456789012345" })
  3. Should find: Your account

Check if WABA ID matches:

  db.accounts.findOne({ 
    _id: ObjectId("6971e3a706837a5539992bee") 
  })

Look for:
  {
    "wabaId": "123456789012345"  ← Must match PhoneNumber.wabaId
  }

If account.wabaId is empty or different:
  
  db.accounts.updateOne(
    { _id: ObjectId("6971e3a706837a5539992bee") },
    { $set: { wabaId: "123456789012345" } }  ← Use phone's wabaId
  )


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 3: VERIFY CONVERSATION ISOLATION BY PHONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you have multiple phones, conversations should NOT mix:

  db.conversations.aggregate([
    {
      $match: {
        accountId: ObjectId("6971e3a706837a5539992bee")
      }
    },
    {
      $group: {
        _id: "$phoneNumberId",
        count: { $sum: 1 },
        sampleCustomer: { $first: "$customerNumber" }
      }
    }
  ])

Expected Output (if you have 2 phones):
  [
    {
      "_id": "108765432109876",
      "count": 12,
      "sampleCustomer": "5511987654321"
    },
    {
      "_id": "119876543210987",
      "count": 8,
      "sampleCustomer": "5521987654321"
    }
  ]

Each phone should have SEPARATE conversations:
  ✅ Phone 1 conversations are isolated from Phone 2
  ✅ Customers can't see messages from other phones
  ✅ Inbox shows only conversations for selected phone


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 4: TEST WEBHOOK WITH EACH PHONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For EACH phone number:

1. Send a WhatsApp message from your phone to the business phone
2. Watch backend logs:

   Expected logs when message arrives:
   
   ✅ 🔔 WEBHOOK HIT
   ✅ Phone Number ID: 108765432109876 (type: string) ← Should NOT be undefined
   ✅ Account ObjectId type: object
   ✅ Conversation ID (MongoDB _id): 65a7b8c9d0e1f2...
   ✅ Socket broadcast successful

   Bad logs would show:
   
   ❌ Phone Number ID: undefined (type: string) ← Backend can't find phone
   ❌ Account not found ← WABA ID mismatch
   ❌ Broadcast failed ← Socket.io issue

3. Check chat appears in inbox <100ms
4. Repeat for each phone number


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 5: TROUBLESHOOT IF WEBHOOK ISN'T WORKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue 1: "Phone number not configured in system"
  Symptom: Webhook logs show phone is unknown
  Cause: Phone not in database or not linked to account
  Fix:
    1. Add phone to PhoneNumber collection
    2. Set accountId = 6971e3a706837a5539992bee
    3. Set phoneNumberId = what Meta provides
    4. Set wabaId = what Meta sends in webhook


Issue 2: "Account not found"
  Symptom: Backend can't find account by WABA ID
  Cause: Account.wabaId doesn't match PhoneNumber.wabaId
  Fix:
    Update Account.wabaId to match phone's WABA ID
    
    db.accounts.updateOne(
      { _id: ObjectId("6971e3a706837a5539992bee") },
      { $set: { wabaId: "META_WABA_ID_HERE" } }
    )


Issue 3: "Conversations showing for ALL phones, not isolated"
  Symptom: When viewing Phone 1, see conversations from Phone 2
  Cause: Frontend not sending phoneNumberId in API call
  Fix:
    Frontend must send: /api/conversations?phoneNumberId=108765432109876
    
    Your logs show:
      phoneNumberId: undefined
    
    This means frontend is calling without the parameter.
    Update: frontend/app/dashboard/chat/page.tsx


Issue 4: "Message received but doesn't appear in chat"
  Symptom: Backend logs show conversation created, but UI is empty
  Cause: Socket.io broadcast not reaching frontend, OR wrong conversation ID
  Fix:
    1. Check Socket.io connection: Look for "Client connected to room: conversation:..."
    2. Verify conversation._id format: Should be ObjectId (24-char hex)
    3. Check Message.conversationId is set correctly


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☐ Step 1: Run MongoDB query to list phone numbers
  Result: _____ phone numbers configured

☐ Step 2: Verify Account.wabaId matches PhoneNumber.wabaId
  Account WABA: ___________________
  Phone WABA: ____________________
  Match: ☐ Yes ☐ No

☐ Step 3: Check conversation isolation
  Phone 1 conversations: ____ (should be separate from others)
  Phone 2 conversations: ____ (should be separate from others)

☐ Step 4: Send test message from each phone
  Phone 1: ☐ Message received ☐ Message NOT received
  Phone 2: ☐ Message received ☐ Message NOT received

☐ Step 5: Verify backend logs show correct phone ID
  Expected: Phone Number ID: 108765432109876 (not undefined)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IF EVERYTHING PASSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Webhook works for ALL phone numbers
✅ Each phone has isolated conversations
✅ Messages appear in real-time (<100ms)
✅ Ready for production deployment

Next: Push to production and monitor live for issues

`);
