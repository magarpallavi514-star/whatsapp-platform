/**
 * Quick webhook phone number mapping check
 */
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pixels-whatsapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkWebhookStatus() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║          🔍 WEBHOOK PHONE MAPPING VERIFICATION                    ║
║                Quick Check - ${new Date().toLocaleString()}
╚════════════════════════════════════════════════════════════════════╝
  `);

  try {
    // Get all active phones
    const PhoneNumber = mongoose.model('PhoneNumber', new mongoose.Schema({}, { strict: false }));
    const Account = mongoose.model('Account', new mongoose.Schema({}, { strict: false }));
    const Conversation = mongoose.model('Conversation', new mongoose.Schema({}, { strict: false }));

    const phones = await PhoneNumber.find({ isActive: true }).limit(10).lean();
    
    console.log(`\n📱 Found ${phones.length} active phone number(s):\n`);

    for (const phone of phones) {
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phone: ${phone.phoneNumberId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);

      // Check 1: Account exists with matching WABA
      const account = await Account.findOne({ wabaId: phone.wabaId }).lean();
      if (account) {
        console.log(`✅ Account found: ${account._id}`);
        console.log(`   Company: ${account.companyName}`);
        console.log(`   WABA ID: ${account.wabaId}`);
      } else {
        console.log(`❌ Account NOT FOUND for WABA ID: ${phone.wabaId}`);
        console.log(`   FIX: Create account with this WABA ID or update phone.wabaId`);
      }

      // Check 2: Conversations exist for this phone
      const convCount = await Conversation.countDocuments({
        phoneNumberId: phone.phoneNumberId
      });
      
      console.log(`\n📧 Conversations for this phone: ${convCount}`);
      
      if (convCount > 0) {
        const sample = await Conversation.findOne({
          phoneNumberId: phone.phoneNumberId
        }).lean();
        
        console.log(`   Sample conversation:`);
        console.log(`     - ID: ${sample._id}`);
        console.log(`     - Customer: +${sample.customerNumber}`);
        console.log(`     - Account: ${sample.accountId}`);
        console.log(`     - Workspace: ${sample.workspaceId}`);
        console.log(`     - Last message: ${new Date(sample.lastMessageAt).toLocaleString()}`);
      } else {
        console.log(`   ⚠️  No conversations yet - send a test message to verify webhook`);
      }
    }

    console.log(`

╔════════════════════════════════════════════════════════════════════╗
║                    WEBHOOK READINESS CHECKLIST                    ║
╚════════════════════════════════════════════════════════════════════╝

For webhook to work with ALL phone numbers:

1. ✅ Each phone must have a configured account
   → Check above: All phones show "✅ Account found"?

2. ✅ Account.wabaId must match PhoneNumber.wabaId
   → Check above: WABA IDs should match

3. ✅ When message arrives:
   → Webhook extracts: entry.id (WABA ID)
   → Backend queries: Account.findOne({ wabaId })
   → Should find the account, then find phone, then create conversation

4. ✅ Each phone gets separate conversations
   → Check above: Verify convCount is correct for each phone


    `);

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

checkWebhookStatus();
