import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';
import Account from './src/models/Account.js';

dotenv.config();

async function testMessageFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // 1. Get active accounts
    const accounts = await Account.find({ type: { $in: ['individual', 'business'] } }).limit(3);
    console.log('📊 ACCOUNTS:', accounts.map(a => ({ 
      _id: a._id.toString(), 
      name: a.name,
      accountId: a.accountId 
    })));

    // 2. Check messages by accountId (ObjectId)
    console.log('\n📨 MESSAGES BY ACCOUNTID (OBJECTID):');
    for (const account of accounts) {
      const count = await Message.countDocuments({ accountId: account._id });
      console.log(`  ${account.name}: ${count} messages`);
      
      if (count > 0) {
        const sample = await Message.findOne({ accountId: account._id })
          .select('_id accountId phoneNumberId recipientPhone messageType status');
        console.log(`    Sample: ${JSON.stringify(sample, null, 2)}`);
      }
    }

    // 3. Check conversations
    console.log('\n💬 CONVERSATIONS:');
    for (const account of accounts) {
      const convs = await Conversation.countDocuments({ accountId: account._id });
      console.log(`  ${account.name}: ${convs} conversations`);
      
      if (convs > 0) {
        const sample = await Conversation.findOne({ accountId: account._id })
          .select('_id accountId phoneNumberId conversationId userPhone lastMessageAt');
        console.log(`    Sample: ${JSON.stringify(sample, null, 2)}`);
      }
    }

    // 4. Check if there are any messages without proper ObjectId accountId
    console.log('\n🔍 CHECKING FOR STRING ACCOUNTID ISSUES:');
    const stringAccountIdMessages = await Message.find({ 
      accountId: { $type: 'string' } 
    }).limit(3);
    console.log(`  Messages with String accountId: ${stringAccountIdMessages.length}`);
    if (stringAccountIdMessages.length > 0) {
      console.log('  WARNING: Found messages with String accountId - needs migration!');
    }

    // 5. Test sending flow - check what accountId type is being used
    console.log('\n🔧 SEND MESSAGE REQUIREMENTS:');
    console.log('  accountId type needed: ObjectId (MongoDB._id)');
    console.log('  phoneNumberId type: String');
    console.log('  Message model expects:');
    console.log('    - accountId: ObjectId (req.account._id from JWT)');
    console.log('    - phoneNumberId: String');
    console.log('    - recipientPhone: String');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testMessageFlow();
