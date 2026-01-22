import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Conversation from './src/models/Conversation.js';

const MONGO_URI = process.env.MONGODB_URI;

async function checkMapping() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('\n🏢 ACCOUNTS:\n');
    const accounts = await Account.find({});
    accounts.forEach(acc => {
      console.log(`accountId (string): ${acc.accountId}`);
      console.log(`_id (ObjectId): ${acc._id}`);
      console.log('');
    });

    console.log('\n📝 CONVERSATIONS:\n');
    const convs = await Conversation.find({}).limit(3);
    convs.forEach(conv => {
      console.log(`accountId in conversation: ${conv.accountId}`);
      console.log('');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMapping();
