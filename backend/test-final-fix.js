import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Conversation from './src/models/Conversation.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGO_URI = process.env.MONGODB_URI;

async function test() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('\n🧪 TESTING FINAL FIX\n');

    // Get superadmin
    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    console.log(`Superadmin ID: ${superadmin._id}`);

    // Get a conversation
    const conv = await Conversation.findOne({ }).lean();
    console.log(`\nConversation accountId: ${conv.accountId} (type: ${typeof conv.accountId})`);
    console.log(`Conversation phoneNumberId: ${conv.phoneNumberId}`);

    // Test the phone config query
    console.log(`\n🔍 Testing PhoneNumber.findOne with STRING accountId:`);
    
    // Simulate what getPhoneConfig does now
    let queryAccountId = conv.accountId;
    if (typeof conv.accountId === 'string' && /^[a-f0-9]{24}$/.test(conv.accountId)) {
      queryAccountId = new mongoose.Types.ObjectId(conv.accountId);
      console.log(`   Converted STRING to ObjectId: ${queryAccountId}`);
    }

    const phoneConfig = await PhoneNumber.findOne({
      accountId: queryAccountId,
      phoneNumberId: conv.phoneNumberId,
      isActive: true
    });

    if (phoneConfig) {
      console.log(`\n✅ SUCCESS! Phone config found:`);
      console.log(`   Phone: ${phoneConfig.phoneNumberId}`);
      console.log(`   WABA: ${phoneConfig.wabaId}`);
      console.log(`   Access Token: ${phoneConfig.accessToken ? '✅ Encrypted' : '❌ Missing'}`);
    } else {
      console.log(`\n❌ FAILED: Phone config not found`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
