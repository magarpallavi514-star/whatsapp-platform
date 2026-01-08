import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';

dotenv.config();

const testMessageFetch = async () => {
  try {
    console.log('🔍 Testing message fetch logic...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const phoneToCheck = '918087131777';

    // Find conversation
    const conversation = await Conversation.findOne({
      userPhone: phoneToCheck
    }).lean();

    if (!conversation) {
      console.log('❌ Conversation not found');
      process.exit(1);
    }

    console.log('📬 Found Conversation:');
    console.log(`   ID: ${conversation._id}`);
    console.log(`   Account ID: ${conversation.accountId}`);
    console.log(`   Phone Number ID: ${conversation.phoneNumberId}`);
    console.log(`   User Phone: ${conversation.userPhone}`);
    console.log(`   Conversation ID: ${conversation.conversationId}\n`);

    // OLD WAY (BROKEN):
    console.log('❌ OLD WAY (BROKEN):');
    console.log(`   Query: { conversationId: "${conversation._id}", accountId: "${conversation.accountId}" }`);
    
    const messagesOld = await Message.find({
      conversationId: conversation._id,
      accountId: conversation.accountId
    }).countDocuments();

    console.log(`   Result: ${messagesOld} messages (WRONG!)\n`);

    // NEW WAY (FIXED):
    console.log('✅ NEW WAY (FIXED):');
    console.log(`   Query: { accountId, phoneNumberId, recipientPhone }`);
    console.log(`   Values: {`);
    console.log(`     accountId: "${conversation.accountId}",`);
    console.log(`     phoneNumberId: "${conversation.phoneNumberId}",`);
    console.log(`     recipientPhone: "${conversation.userPhone}"`);
    console.log(`   }`);

    const messagesNew = await Message.find({
      accountId: conversation.accountId,
      phoneNumberId: conversation.phoneNumberId,
      recipientPhone: conversation.userPhone
    }).limit(5).lean();

    console.log(`   Result: ${messagesNew.length} messages found (CORRECT!)\n`);

    console.log('📨 First 5 messages:');
    messagesNew.forEach((msg, i) => {
      console.log(`   ${i + 1}. "${msg.content?.text?.substring(0, 50) || msg.messageType}" (${msg.direction})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Fix verified!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testMessageFetch();
