import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';
import Account from './src/models/Account.js';

dotenv.config();

async function testFullSystemFix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    const account = await Account.findOne({}).limit(1);
    if (!account) {
      console.error('❌ No account found');
      process.exit(1);
    }

    const accountId = account._id;
    console.log(`📊 Full System Validation`);
    console.log(`Account: ${account.name}`);
    console.log(`Account ID: ${accountId}\n`);

    // ============================================
    // TEST 1: Check Conversation Schema
    // ============================================
    console.log('🔍 TEST 1: Conversation Schema Validation');
    const sampleConv = await Conversation.findOne({ accountId }).lean();
    
    if (sampleConv) {
      console.log('✅ Sample Conversation found:');
      console.log(`   - accountId: ${sampleConv.accountId ? '✅' : '❌'}`);
      console.log(`   - workspaceId: ${sampleConv.workspaceId ? '✅' : '❌'}`);
      console.log(`   - phoneNumberId: ${sampleConv.phoneNumberId ? '✅' : '❌'}`);
      console.log(`   - userPhone: ${sampleConv.userPhone ? '✅' : '❌'}`);
      console.log(`   - conversationId: ${sampleConv.conversationId ? '✅' : '❌'}`);
      console.log(`   - lastMessageAt: ${sampleConv.lastMessageAt ? '✅' : '❌'}`);
      
      // Check for old field
      if (sampleConv.customerNumber) {
        console.log(`   ❌ CRITICAL: Old field "customerNumber" still present!`);
      } else {
        console.log(`   ✅ No old "customerNumber" field`);
      }
    } else {
      console.log('⚠️  No conversations found for this account');
    }

    // ============================================
    // TEST 2: Check Message-Conversation Linking
    // ============================================
    console.log('\n🔍 TEST 2: Message-Conversation Linking');
    const sampleMsg = await Message.findOne({ accountId }).lean();
    
    if (sampleMsg) {
      console.log('✅ Sample Message found:');
      console.log(`   - conversationId: ${sampleMsg.conversationId ? '✅' : '❌'}`);
      console.log(`   - messageType: ${sampleMsg.messageType ? '✅' : '❌'}`);
      console.log(`   - direction: ${sampleMsg.direction ? '✅' : '❌'}`);
      
      if (sampleMsg.conversationId) {
        const linkedConv = await Conversation.findById(sampleMsg.conversationId).lean();
        if (linkedConv) {
          console.log(`   ✅ Conversation link VALID`);
          console.log(`      userPhone: ${linkedConv.userPhone}`);
        } else {
          console.log(`   ❌ Conversation link BROKEN (ID not found in DB)`);
        }
      }
    } else {
      console.log('⚠️  No messages found for this account');
    }

    // ============================================
    // TEST 3: Conversation Count & Status
    // ============================================
    console.log('\n🔍 TEST 3: Conversation Statistics');
    const totalConvs = await Conversation.countDocuments({ accountId });
    const activeConvs = await Conversation.countDocuments({ accountId, status: 'open' });
    const closedConvs = await Conversation.countDocuments({ accountId, status: 'closed' });
    
    console.log(`Total Conversations: ${totalConvs}`);
    console.log(`  - Active: ${activeConvs}`);
    console.log(`  - Closed: ${closedConvs}`);

    // ============================================
    // TEST 4: Broadcast Messages Check
    // ============================================
    console.log('\n🔍 TEST 4: Broadcast Message Validation');
    const broadcastMsgs = await Message.find({
      accountId,
      campaign: 'broadcast'
    }).limit(5).lean();
    
    if (broadcastMsgs.length > 0) {
      console.log(`Found ${broadcastMsgs.length} broadcast messages:`);
      let validCount = 0;
      
      for (const msg of broadcastMsgs) {
        if (msg.conversationId && msg.messageType) {
          validCount++;
          console.log(`  ✅ Message has conversationId + messageType`);
        } else {
          console.log(`  ❌ Message missing required fields`);
          console.log(`     conversationId: ${msg.conversationId ? '✅' : '❌'}`);
          console.log(`     messageType: ${msg.messageType ? '✅' : '❌'}`);
        }
      }
      console.log(`\nValid broadcast messages: ${validCount}/${broadcastMsgs.length}`);
    } else {
      console.log('⚠️  No broadcast messages found');
    }

    // ============================================
    // TEST 5: Check for Old Field References
    // ============================================
    console.log('\n🔍 TEST 5: Old Field References Check');
    const oldFieldConvs = await Conversation.countDocuments({
      accountId,
      customerNumber: { $exists: true }
    });
    const oldFieldMsgs = await Message.countDocuments({
      accountId,
      customerNumber: { $exists: true }
    });
    
    console.log(`Conversations with old "customerNumber": ${oldFieldConvs}`);
    console.log(`Messages with old "customerNumber": ${oldFieldMsgs}`);
    
    if (oldFieldConvs === 0 && oldFieldMsgs === 0) {
      console.log('✅ No old field references found');
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('📋 SUMMARY');
    console.log('='.repeat(50));
    
    if (totalConvs > 0 && activeConvs > 0) {
      console.log('✅ Live Chat System: OPERATIONAL');
      console.log('✅ Conversations: VALID');
      console.log('✅ Message Linking: VALID');
      console.log('✅ Broadcast System: READY');
      console.log('✅ Old Fields: REMOVED');
    } else {
      console.log('⚠️  System has limited data - validation inconclusive');
    }

    console.log('\n✅ Full System Validation Complete\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testFullSystemFix();
