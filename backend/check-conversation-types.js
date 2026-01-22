import mongoose from 'mongoose';
import Conversation from './src/models/Conversation.js';

const MONGO_URI = process.env.MONGODB_URI;

async function check() {
  try {
    await mongoose.connect(MONGO_URI);

    // Use lean() to get raw data
    const convs = await Conversation.find({}).lean().limit(5);
    
    console.log('\n📋 RAW CONVERSATION DATA:\n');
    convs.forEach(conv => {
      console.log(`Conversation: ${conv.conversationId}`);
      console.log(`  accountId (raw): ${conv.accountId}`);
      console.log(`  accountId type: ${typeof conv.accountId}`);
      if (conv.accountId && typeof conv.accountId === 'object') {
        console.log(`  accountId.$oid: ${conv.accountId.$oid || 'N/A'}`);
      }
      console.log('');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

check();
