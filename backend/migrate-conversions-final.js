import mongoose from 'mongoose';
import Account from './src/models/Account.js';

const MONGO_URI = process.env.MONGODB_URI;

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    console.log('\n🔄 MIGRATING CONVERSATION ACCOUNTIDS\n');

    // Get account mappings
    const accounts = await Account.find({});
    const mapping = {};
    
    accounts.forEach(acc => {
      mapping[acc.accountId] = new mongoose.Types.ObjectId(acc._id);
    });

    console.log('📊 Account Mappings:');
    Object.entries(mapping).forEach(([accountId, objectId]) => {
      console.log(`  ${accountId} → ${objectId}`);
    });

    // Get conversations collection
    const conversationsColl = db.collection('conversations');

    console.log('\n📝 Converting Conversation.accountId from STRING to OBJECTID:\n');

    for (const [accountId, objectId] of Object.entries(mapping)) {
      const result = await conversationsColl.updateMany(
        { accountId: accountId },
        { $set: { accountId: objectId } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`  ✅ ${accountId}`);
        console.log(`     Updated: ${result.modifiedCount} conversations`);
      }
    }

    // Verify the migration
    console.log('\n✅ VERIFICATION:\n');
    
    const totalConvs = await conversationsColl.countDocuments({});
    console.log(`  Total conversations: ${totalConvs}`);

    for (const [accountId, objectId] of Object.entries(mapping)) {
      const count = await conversationsColl.countDocuments({ accountId: objectId });
      if (count > 0) {
        console.log(`  ✅ ${accountId}: ${count} conversations with ObjectId`);
      }
    }

    console.log('\n✅ MIGRATION COMPLETE!\n');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrate();
