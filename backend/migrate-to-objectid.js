import mongoose from 'mongoose';
import Account from './src/models/Account.js';

const MONGO_URI = process.env.MONGODB_URI;

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    // Get account mapping
    const accounts = await Account.find({});
    const mapping = {};
    accounts.forEach(acc => {
      mapping[acc.accountId] = acc._id; // Map string → ObjectId
    });

    console.log('\n📊 ACCOUNT MAPPING:');
    Object.entries(mapping).forEach(([str, oid]) => {
      console.log(`  ${str} → ${oid}`);
    });

    // Update conversations collection
    const convColl = db.collection('conversations');
    
    console.log('\n🔄 MIGRATING CONVERSATIONS:\n');

    // For each account, convert all its conversations
    for (const [accountIdStr, accountIdObj] of Object.entries(mapping)) {
      const result = await convColl.updateMany(
        { accountId: accountIdStr },
        { $set: { accountId: accountIdObj } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ ${accountIdStr}: ${result.modifiedCount} conversations converted to ObjectId`);
      }
    }

    // Handle any remaining ones with undefined accountId (delete or set to default)
    const undefinedCount = await convColl.countDocuments({ accountId: { $in: [null, undefined] } });
    if (undefinedCount > 0) {
      console.log(`\n⚠️  Found ${undefinedCount} conversations with undefined accountId`);
    }

    // Verify
    console.log('\n✅ VERIFICATION:');
    const conversationCount = await convColl.countDocuments({});
    console.log(`  Total conversations: ${conversationCount}`);

    const withString = await convColl.countDocuments({ accountId: { $type: 'string' } });
    console.log(`  Still STRING: ${withString}`);

    const withOid = await convColl.countDocuments({ accountId: { $type: 'objectId' } } );
    console.log(`  Now ObjectId: ${withOid}`);

    console.log('\n✅ MIGRATION COMPLETE\n');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrate();
