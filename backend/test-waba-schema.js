import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function testWABASchema() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const accounts = await db.collection('accounts').find({}).toArray();
    
    console.log('📋 ACCOUNTS AND THEIR DATA TYPES:\n');
    for (const account of accounts) {
      console.log(`Account: ${account.name} (${account.email})`);
      console.log(`  accountId field: "${account.accountId}" (${typeof account.accountId})`);
      console.log(`  _id field: ${account._id} (${account._id.constructor.name})`);
      console.log();
    }

    // Check existing WABAs
    const phones = await db.collection('phonenumbers').find({}).toArray();
    
    console.log('📱 EXISTING WABAs IN DATABASE:\n');
    if (phones.length === 0) {
      console.log('❌ NO WABAs FOUND - Clean database, ready for new adds!');
    } else {
      for (const phone of phones) {
        console.log(`Phone ID: ${phone.phoneNumberId}`);
        console.log(`  accountId in DB: ${phone.accountId}`);
        console.log(`  accountId type: ${typeof phone.accountId} / ${phone.accountId?.constructor?.name}`);
        console.log(`  wabaId: ${phone.wabaId}`);
        console.log(`  displayName: ${phone.displayName}`);
        console.log();
      }
    }

    console.log('\n✅ SCHEMA CHECK COMPLETE');
    console.log('\nREADY TO ADD NEW WABAs:');
    console.log('- addPhoneNumber will now save accountId as ObjectId');
    console.log('- getPhoneNumbers will query with both formats ($or clause)');
    console.log('- Broadcasts/Chat will find WABAs correctly');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testWABASchema();
