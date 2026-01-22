import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';
import Conversation from './src/models/Conversation.js';

const MONGO_URI = process.env.MONGODB_URI;

async function debug() {
  try {
    await mongoose.connect(MONGO_URI);

    const conv = await Conversation.findOne({ accountId: { $ne: null } });
    const phone = await PhoneNumber.findOne({});

    console.log('\n📊 TYPES:\n');
    console.log(`Conversation accountId value: "${conv.accountId}"`);
    console.log(`Conversation accountId type: ${conv.accountId.constructor.name}`);
    console.log(`Conversation accountId instanceof ObjectId: ${conv.accountId instanceof mongoose.Types.ObjectId}`);

    console.log(`\nPhoneNumber accountId value: "${phone.accountId}"`);
    console.log(`PhoneNumber accountId type: ${phone.accountId.constructor.name}`);
    console.log(`PhoneNumber accountId instanceof ObjectId: ${phone.accountId instanceof mongoose.Types.ObjectId}`);

    console.log(`\nAre they equal (==)? ${conv.accountId == phone.accountId}`);
    console.log(`Are they equal (===)? ${conv.accountId === phone.accountId}`);
    console.log(`String comparison: ${String(conv.accountId) === String(phone.accountId)}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debug();
