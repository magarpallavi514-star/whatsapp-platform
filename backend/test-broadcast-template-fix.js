import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Broadcast from './src/models/Broadcast.js';
import Account from './src/models/Account.js';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';

dotenv.config();

async function testBroadcastTemplate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Find an account
    const account = await Account.findOne({}).limit(1);
    if (!account) {
      console.error('❌ No account found');
      process.exit(1);
    }

    const accountId = account._id;
    console.log(`📊 Testing with Account: ${account.name}`);
    console.log(`   Account ID: ${accountId}\n`);

    // Check if broadcast exists
    const broadcast = await Broadcast.findOne({
      accountId,
      messageType: 'template',
      status: { $in: ['completed', 'running', 'draft'] }
    }).sort({ createdAt: -1 });

    if (broadcast) {
      console.log(`📢 Found Broadcast: ${broadcast.name}`);
      console.log(`   Type: ${broadcast.messageType}`);
      console.log(`   Status: ${broadcast.status}`);
      console.log(`   Stats:`, JSON.stringify(broadcast.stats, null, 2));
      console.log();

      // Check if any messages were created
      const messageCount = await Message.countDocuments({
        accountId,
        messageType: 'template',
        campaign: 'broadcast'
      });

      console.log(`📨 Messages for this broadcast: ${messageCount}`);

      if (messageCount > 0) {
        // Get sample message with conversation
        const sampleMsg = await Message.findOne({
          accountId,
          messageType: 'template',
          campaign: 'broadcast'
        }).lean();

        console.log('\n✅ Sample message:');
        console.log(`   ID: ${sampleMsg._id}`);
        console.log(`   conversationId: ${sampleMsg.conversationId}`);
        console.log(`   recipientPhone: ${sampleMsg.recipientPhone}`);
        console.log(`   status: ${sampleMsg.status}`);

        if (sampleMsg.conversationId) {
          const conv = await Conversation.findById(sampleMsg.conversationId).lean();
          if (conv) {
            console.log('\n✅ Linked Conversation found:');
            console.log(`   ID: ${conv._id}`);
            console.log(`   userPhone: ${conv.userPhone}`);
            console.log(`   workspaceId: ${conv.workspaceId}`);
            console.log(`   phoneNumberId: ${conv.phoneNumberId}`);
            console.log(`   conversationId field: ${conv.conversationId}`);
          } else {
            console.log('\n❌ Conversation not found by ID');
          }
        }
      }
    } else {
      console.log('⚠️  No template broadcast found');
    }

    console.log('\n✅ Test complete\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testBroadcastTemplate();
