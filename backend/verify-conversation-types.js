import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI;

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    const convColl = db.collection('conversations');
    const convs = await convColl.find({}).limit(5).toArray();

    console.log('\n📊 ACTUAL CONVERSATION DATA IN DB:\n');
    convs.forEach(conv => {
      console.log(`Conversation: ${conv.conversationId}`);
      console.log(`  accountId: ${conv.accountId}`);
      console.log(`  accountId type: ${typeof conv.accountId}`);
      if (conv.accountId && typeof conv.accountId === 'object' && conv.accountId.$oid) {
        console.log(`  accountId.$oid: ${conv.accountId.$oid}`);
      }
      console.log('');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
