import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';
import Conversation from './src/models/Conversation.js';

const MONGO_URI = process.env.MONGODB_URI;

async function testQuery() {
  try {
    await mongoose.connect(MONGO_URI);

    const convs = await Conversation.find({ accountId: { $ne: null, $ne: undefined } }).limit(2);
    console.log(`\n🧪 Testing queries with actual conversation data:\n`);

    for (const conv of convs) {
      console.log(`Conversation accountId: ${conv.accountId} (${typeof conv.accountId})`);
      console.log(`Conversation phoneNumberId: ${conv.phoneNumberId}`);

      const config = await PhoneNumber.findOne({
        accountId: conv.accountId,
        phoneNumberId: conv.phoneNumberId,
        isActive: true
      });

      if (config) {
        console.log(`✅ FOUND: ${config.phoneNumberId} for account ${conv.accountId}`);
      } else {
        console.log(`❌ NOT FOUND for account ${conv.accountId} + phone ${conv.phoneNumberId}`);
      }
      console.log('');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testQuery();
