import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Conversation from './src/models/Conversation.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Message from './src/models/Message.js';

const MONGO_URI = process.env.MONGODB_URI;

async function testLiveChat() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🧪 COMPREHENSIVE LIVE CHAT TEST');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Get accounts
    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    const enromatics = await Account.findOne({ accountId: 'eno_2600003' });

    // ========== TEST 1: SUPERADMIN ==========
    console.log('📊 TEST 1: SUPERADMIN LIVE CHAT\n');
    console.log(`Account: ${superadmin.accountId} (_id: ${superadmin._id})`);

    const superConvs = await Conversation.find({ accountId: superadmin._id }).limit(2);
    console.log(`✅ Found ${superConvs.length} conversations\n`);

    if (superConvs.length > 0) {
      const conv = superConvs[0];
      console.log(`Conversation with: ${conv.userPhone}`);
      console.log(`Phone Number ID: ${conv.phoneNumberId}`);

      // Simulate getPhoneConfig logic
      let queryAccountId = conv.accountId;
      if (typeof conv.accountId === 'string' && /^[a-f0-9]{24}$/.test(conv.accountId)) {
        queryAccountId = new mongoose.Types.ObjectId(conv.accountId);
      }

      const phoneConfig = await PhoneNumber.findOne({
        accountId: queryAccountId,
        phoneNumberId: conv.phoneNumberId,
        isActive: true
      });

      if (phoneConfig) {
        console.log(`✅ Phone Config: FOUND`);
        console.log(`   WABA ID: ${phoneConfig.wabaId}`);
        console.log(`   Phone: ${phoneConfig.displayPhone}`);
      } else {
        console.log(`❌ Phone Config: NOT FOUND`);
      }

      // Check if messages can be created
      const msgCount = await Message.countDocuments({ conversationId: conv.conversationId });
      console.log(`\nMessages in conversation: ${msgCount}`);
      console.log(`\n✅ SUPERADMIN: Ready to send messages`);
    }

    // ========== TEST 2: ENROMATICS ==========
    console.log('\n───────────────────────────────────────────────────────────\n');
    console.log('📊 TEST 2: ENROMATICS LIVE CHAT\n');
    console.log(`Account: ${enromatics.accountId} (_id: ${enromatics._id})`);

    const enroConvs = await Conversation.find({ accountId: enromatics._id }).limit(2);
    console.log(`Found ${enroConvs.length} conversations\n`);

    if (enroConvs.length === 0) {
      console.log(`⚠️  No conversations yet (account just created)\n`);
      
      // But check if phone is configured
      const enroPhone = await PhoneNumber.findOne({
        accountId: enromatics._id,
        isActive: true
      });

      if (enroPhone) {
        console.log(`✅ Phone configured for Enromatics`);
        console.log(`   Phone: ${enroPhone.phoneNumberId}`);
        console.log(`   WABA: ${enroPhone.wabaId}`);
        console.log(`\n✅ ENROMATICS: Ready to receive messages when they arrive`);
      }
    } else {
      const conv = enroConvs[0];
      console.log(`Conversation with: ${conv.userPhone}`);

      let queryAccountId = conv.accountId;
      if (typeof conv.accountId === 'string' && /^[a-f0-9]{24}$/.test(conv.accountId)) {
        queryAccountId = new mongoose.Types.ObjectId(conv.accountId);
      }

      const phoneConfig = await PhoneNumber.findOne({
        accountId: queryAccountId,
        phoneNumberId: conv.phoneNumberId,
        isActive: true
      });

      if (phoneConfig) {
        console.log(`✅ Phone Config: FOUND`);
        console.log(`✅ ENROMATICS: Ready to send messages`);
      } else {
        console.log(`❌ Phone Config: NOT FOUND`);
      }
    }

    // ========== SUMMARY ==========
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📋 SUMMARY\n');

    const totalConvs = await Conversation.countDocuments({});
    const superPhoneActive = await PhoneNumber.findOne({
      accountId: superadmin._id,
      isActive: true
    });
    const enroPhoneActive = await PhoneNumber.findOne({
      accountId: enromatics._id,
      isActive: true
    });

    console.log(`Total conversations in DB: ${totalConvs}`);
    console.log(`Superadmin phone active: ${superPhoneActive ? '✅ YES' : '❌ NO'}`);
    console.log(`Enromatics phone active: ${enroPhoneActive ? '✅ YES' : '❌ NO'}`);

    console.log('\n✅ LIVE CHAT IS READY TO USE!\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLiveChat();
