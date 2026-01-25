/**
 * Real-Time Chat Mapping Test
 * Verifies phone_number_id routing and Socket.io broadcast
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Models
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';

async function testRealtimeMapping() {
  try {
    console.log('🔍 Testing Real-Time Chat Mapping...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check Phone Numbers
    console.log('📱 STEP 1: Verify Phone Number Configuration');
    console.log('='.repeat(60));
    const phoneNumbers = await PhoneNumber.find();
    if (phoneNumbers.length === 0) {
      console.log('❌ NO PHONE NUMBERS CONFIGURED');
      console.log('   → You need to add at least one WhatsApp phone number');
      console.log('   → Go to Settings → Add Phone Number\n');
      return;
    }

    phoneNumbers.forEach((phone) => {
      console.log(`✅ Phone Number Found:`);
      console.log(`   phoneNumberId: ${phone.phoneNumberId}`);
      console.log(`   displayNumber: ${phone.displayNumber || 'N/A'}`);
      console.log(`   accountId: ${phone.accountId}`);
      console.log(`   workspaceId: ${phone.workspaceId}`);
      console.log();
    });

    // 2. Check Conversations
    console.log('📭 STEP 2: Check Existing Conversations');
    console.log('='.repeat(60));
    const conversations = await Conversation.find().limit(10);
    if (conversations.length === 0) {
      console.log('⚠️  NO CONVERSATIONS YET - Send/receive a message first\n');
    } else {
      conversations.forEach((conv) => {
        console.log(`✅ Conversation Found:`);
        console.log(`   _id: ${conv._id}`);
        console.log(`   userPhone: ${conv.userPhone}`);
        console.log(`   phoneNumberId: ${conv.phoneNumberId}`);
        console.log(`   accountId: ${conv.accountId}`);
        console.log(`   lastMessage: ${conv.lastMessagePreview || 'N/A'}`);
        console.log();
      });
    }

    // 3. Check Messages
    console.log('💬 STEP 3: Check Message Routing');
    console.log('='.repeat(60));
    const messages = await Message.find().sort({ createdAt: -1 }).limit(10);
    if (messages.length === 0) {
      console.log('⚠️  NO MESSAGES YET\n');
    } else {
      messages.forEach((msg) => {
        console.log(`✅ Message Found:`);
        console.log(`   conversationId: ${msg.conversationId}`);
        console.log(`   from: ${msg.from}`);
        console.log(`   direction: ${msg.direction}`);
        console.log(`   status: ${msg.status}`);
        console.log(`   createdAt: ${msg.createdAt}`);
        console.log();
      });
    }

    // 4. Verify Mapping Logic
    console.log('🔗 STEP 4: Verify Mapping Logic');
    console.log('='.repeat(60));
    
    if (conversations.length > 0) {
      const testConv = conversations[0];
      const testMsgs = await Message.find({ conversationId: { $exists: true, $ne: null } }).limit(1);
      
      if (testMsgs.length > 0) {
        const testMsg = testMsgs[0];
        
        console.log(`Testing Conversation: ${testConv._id}`);
        console.log(`Testing Message: ${testMsg.conversationId}\n`);
        
        // Check if message belongs to conversation
        if (testMsg.conversationId.toString() === testConv._id.toString()) {
          console.log('✅ CORRECT: Message conversationId matches conversation _id');
        } else {
          console.log('❌ WRONG: Message conversationId does NOT match conversation _id');
          console.log(`   Message conversationId: ${testMsg.conversationId}`);
          console.log(`   Conversation _id: ${testConv._id}`);
        }
        
        // Check phone number routing
        const phoneConfig = await PhoneNumber.findOne({
          phoneNumberId: testConv.phoneNumberId
        });
        
        if (phoneConfig) {
          console.log(`✅ CORRECT: Phone number ID found in config`);
          console.log(`   phoneNumberId: ${phoneConfig.phoneNumberId}`);
          console.log(`   Maps to account: ${phoneConfig.accountId}`);
        } else {
          console.log(`❌ WRONG: Phone number ${testConv.phoneNumberId} not found in config`);
        }
      } else {
        console.log('⚠️  No messages with conversationId found (may be legacy messages)');
        console.log('   Send a new test message to populate new field\n');
      }
    }

    // 5. Socket.io Room Verification
    console.log('\n🔌 STEP 5: Socket.io Room Mapping');
    console.log('='.repeat(60));
    console.log('Expected Socket.io Join Pattern:');
    console.log('  socket.on("new_message", (data) => {');
    console.log('    const { conversationId } = data;');
    console.log('    // Should match conversation._id');
    console.log('  });\n');
    
    // 6. Test Scenario
    console.log('🧪 STEP 6: Test Scenario');
    console.log('='.repeat(60));
    console.log('To test real-time mapping:\n');
    console.log('1. Open live chat in browser (Console → Network → Socket.io)');
    console.log('2. Select a conversation');
    console.log('3. Send a test message from phone');
    console.log('4. Check browser console logs:');
    console.log('   - "🔍 CONVERSATION ID DEBUG" shows matching IDs?');
    console.log('   - "✅ IDS MATCH" appears?');
    console.log('   - Message appears in chat in real-time?');
    console.log('5. Check these backend logs:');
    console.log('   - "📬 Webhook received" with correct phoneNumberId');
    console.log('   - "✅ Conversation found/created"');
    console.log('   - "📢 Broadcasting new message" with correct conversationId\n');

    console.log('🐛 DEBUGGING CHECKLIST');
    console.log('='.repeat(60));
    console.log('If real-time NOT working:');
    console.log('□ Check if phoneNumberId matches in webhook vs DB');
    console.log('□ Check if conversationId is MongoDB _id (not formatted string)');
    console.log('□ Check if Socket.io is connected (Browser DevTools)');
    console.log('□ Check if room subscription is active');
    console.log('□ Check browser console for "IDS DO NOT MATCH" error');
    console.log('□ Check backend logs for conversation lookup failures\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testRealtimeMapping();
