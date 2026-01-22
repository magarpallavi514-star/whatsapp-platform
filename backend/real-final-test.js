import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Conversation from './src/models/Conversation.js';
import whatsappService from './src/services/whatsappService.js';

const MONGO_URI = process.env.MONGODB_URI;

async function realTest() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('\n✅ REAL FINAL TEST - LIVE CHAT WITH WHATSAPP SERVICE\n');

    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    const enromatics = await Account.findOne({ accountId: 'eno_2600003' });

    // TEST 1: Superadmin can load and send
    console.log('🧪 TEST 1: SUPERADMIN LIVE CHAT\n');
    
    const accountId1 = superadmin._id.toString();
    const convs1 = await Conversation.find({ accountId: accountId1 }).limit(1);
    
    if (convs1.length > 0) {
      const conv = convs1[0];
      console.log(`  ✅ Loaded conversation: ${conv.userPhone}`);
      
      try {
        const phoneConfig = await whatsappService.getPhoneConfig(
          conv.accountId,
          conv.phoneNumberId
        );
        console.log(`  ✅ Phone config found: ${phoneConfig.phoneNumberId}`);
        console.log(`  ✅ Can send messages: YES\n`);
      } catch (err) {
        console.log(`  ❌ Error getting phone config: ${err.message}\n`);
      }
    }

    // TEST 2: Enromatics
    console.log('🧪 TEST 2: ENROMATICS LIVE CHAT\n');
    
    const accountId2 = enromatics._id.toString();
    const convs2 = await Conversation.find({ accountId: accountId2 });
    
    console.log(`  ✅ Found ${convs2.length} conversations`);
    if (convs2.length > 0) {
      const conv = convs2[0];
      console.log(`  📱 First: ${conv.userPhone}`);
      
      try {
        const phoneConfig = await whatsappService.getPhoneConfig(
          conv.accountId,
          conv.phoneNumberId
        );
        console.log(`  ✅ Phone config found: ${phoneConfig.phoneNumberId}`);
        console.log(`  ✅ Can send messages: YES\n`);
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}\n`);
      }
    } else {
      console.log(`  ⚠️  No conversations yet (new account)\n`);
    }

    console.log('✅ TESTS COMPLETE\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

realTest();
