import mongoose from 'mongoose';
import Account from './src/models/Account.js';

const MONGO_URI = process.env.MONGODB_URI;

async function check() {
  try {
    const client = await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    
    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    console.log(`\n🔍 SUPERADMIN ACCOUNT: ${superadmin._id}\n`);

    // Check conversations directly in MongoDB
    const conversationsColl = db.collection('conversations');
    
    // Get conversations with string accountId
    const stringConvs = await conversationsColl.find({ 
      accountId: 'pixels_internal' 
    }).limit(3).toArray();
    
    console.log(`📝 With STRING accountId 'pixels_internal': ${stringConvs.length}`);
    stringConvs.forEach(c => {
      console.log(`  - ${c.userPhone} (accountId: ${c.accountId}, type: ${typeof c.accountId})`);
    });

    // Get conversations with ObjectId accountId
    const objectConvs = await conversationsColl.find({ 
      accountId: superadmin._id 
    }).limit(3).toArray();
    
    console.log(`\n📝 With OBJECTID accountId: ${objectConvs.length}`);
    objectConvs.forEach(c => {
      console.log(`  - ${c.userPhone} (accountId: ${c.accountId})`);
    });

    // Get all conversations for this account (any format)
    const allConvs = await conversationsColl.find({
      $or: [
        { accountId: 'pixels_internal' },
        { accountId: superadmin._id },
        { accountId: superadmin._id.toString() }
      ]
    }).limit(5).toArray();
    
    console.log(`\n📝 ALL conversations (any format): ${allConvs.length}`);
    allConvs.forEach(c => {
      console.log(`  - ${c.userPhone} (accountId: ${c.accountId}, type: ${typeof c.accountId})`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

check();
