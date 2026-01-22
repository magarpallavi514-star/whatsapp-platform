import mongoose from 'mongoose';
import Conversation from './src/models/Conversation.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';

const MONGO_URI = process.env.MONGODB_URI;

async function testLiveChat() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('\n🧪 LIVE CHAT TEST\n');

    // Get accounts
    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    const enromatics = await Account.findOne({ accountId: 'eno_2600003' });

    console.log('📊 ACCOUNTS:');
    console.log(`  Superadmin _id: ${superadmin._id}`);
    console.log(`  Enromatics _id: ${enromatics._id}\n`);

    // Test 1: Load conversations for Superadmin
    console.log('🔍 SUPERADMIN - Loading conversations:');
    const superadminConvs = await Conversation.find({ accountId: superadmin._id }).limit(3);
    console.log(`  Found ${superadminConvs.length} conversations`);
    if (superadminConvs.length > 0) {
      const conv = superadminConvs[0];
      console.log(`  First: ${conv.userPhone}`);
      
      // Check if phone config exists
      const phoneConfig = await PhoneNumber.findOne({
        accountId: conv.accountId,
        phoneNumberId: conv.phoneNumberId,
        isActive: true
      });
      console.log(`  ✅ Phone config found: ${phoneConfig ? 'YES' : 'NO'}`);
    } else {
      console.log(`  ❌ No conversations found!`);
    }

    // Test 2: Load conversations for Enromatics
    console.log('\n🔍 ENROMATICS - Loading conversations:');
    const enromaticsConvs = await Conversation.find({ accountId: enromatics._id }).limit(3);
    console.log(`  Found ${enromaticsConvs.length} conversations`);
    if (enromaticsConvs.length > 0) {
      const conv = enromaticsConvs[0];
      console.log(`  First: ${conv.userPhone}`);
      
      // Check if phone config exists
      const phoneConfig = await PhoneNumber.findOne({
        accountId: conv.accountId,
        phoneNumberId: conv.phoneNumberId,
        isActive: true
      });
      console.log(`  ✅ Phone config found: ${phoneConfig ? 'YES' : 'NO'}`);
    } else {
      console.log(`  ⚠️  No conversations found (this is expected for new accounts)`);
    }

    // Test 3: Check if phones are properly configured
    console.log('\n📱 PHONE CONFIGURATIONS:');
    const phones = await PhoneNumber.find({});
    phones.forEach(phone => {
      const accountName = phone.accountId.toString() === superadmin._id.toString() ? 'Superadmin' : 'Enromatics';
      console.log(`  ${accountName} - ${phone.phoneNumberId}: ${phone.isActive ? '✅ Active' : '❌ Inactive'}`);
    });

    console.log('\n✅ Live chat test complete\n');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLiveChat();
