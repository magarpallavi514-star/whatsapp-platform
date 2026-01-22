import mongoose from 'mongoose';
import Conversation from './src/models/Conversation.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGO_URI = process.env.MONGODB_URI;

async function test() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('\n🧪 TESTING PHONE CONFIG QUERY\n');

    // Get a real conversation
    const conv = await Conversation.findOne({});
    
    console.log(`Conversation accountId: ${conv.accountId} (type: ${conv.accountId.constructor.name})`);
    console.log(`Conversation phoneNumberId: ${conv.phoneNumberId}\n`);

    // Test 1: Simple query
    console.log('Test 1: Simple query with conversation.accountId');
    const result1 = await PhoneNumber.findOne({
      accountId: conv.accountId,
      phoneNumberId: conv.phoneNumberId,
      isActive: true
    });
    console.log(`Result: ${result1 ? '✅ FOUND' : '❌ NOT FOUND'}\n`);

    // Test 2: With toString()
    console.log('Test 2: Query with toString()');
    const result2 = await PhoneNumber.findOne({
      accountId: conv.accountId.toString(),
      phoneNumberId: conv.phoneNumberId,
      isActive: true
    });
    console.log(`Result: ${result2 ? '✅ FOUND' : '❌ NOT FOUND'}\n`);

    // Test 3: With $or
    console.log('Test 3: Query with $or');
    const result3 = await PhoneNumber.findOne({
      $or: [
        { accountId: conv.accountId },
        { accountId: conv.accountId.toString() }
      ],
      phoneNumberId: conv.phoneNumberId,
      isActive: true
    });
    console.log(`Result: ${result3 ? '✅ FOUND' : '❌ NOT FOUND'}\n`);

    // Debug: show what's in PhoneNumber
    console.log('Debug: Show all PhoneNumbers accountIds');
    const allPhones = await PhoneNumber.find({});
    allPhones.forEach(p => {
      console.log(`  PhoneNumber accountId: ${p.accountId} (type: ${p.accountId.constructor.name})`);
      console.log(`  Is equal to conv.accountId? ${p.accountId.toString() === conv.accountId.toString()}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
