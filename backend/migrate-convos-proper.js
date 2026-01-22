import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Conversation from './src/models/Conversation.js';

const MONGO_URI = process.env.MONGODB_URI;

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);

    // Get all accounts and create mapping
    const accounts = await Account.find({});
    const mapping = {};
    accounts.forEach(acc => {
      mapping[acc.accountId] = acc._id;
    });

    console.log('\n📊 Mapping created:');
    Object.entries(mapping).forEach(([accountId, objectId]) => {
      console.log(`  ${accountId} → ${objectId}`);
    });

    // Get conversations with string accountIds
    const convs = await Conversation.find({});
    console.log(`\n📝 Found ${convs.length} conversations\n`);

    let updated = 0;
    let failed = 0;

    for (const conv of convs) {
      // Skip if already has ObjectId
      if (conv.accountId instanceof mongoose.Types.ObjectId) {
        console.log(`⏭️  Already ObjectId: ${conv.conversationId}`);
        continue;
      }

      // Skip if accountId is undefined
      if (!conv.accountId) {
        console.log(`⚠️  Undefined accountId: ${conv.conversationId}`);
        failed++;
        continue;
      }

      const newAccountId = mapping[conv.accountId];
      if (!newAccountId) {
        console.log(`❌ No mapping for accountId: ${conv.accountId}`);
        failed++;
        continue;
      }

      // Update to ObjectId
      await Conversation.updateOne(
        { _id: conv._id },
        { $set: { accountId: newAccountId } }
      );
      updated++;
      console.log(`✅ Updated: ${conv.conversationId}`);
    }

    console.log(`\n✅ Migration complete: ${updated} updated, ${failed} failed\n`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrate();
