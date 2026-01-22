import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Conversation from './src/models/Conversation.js';

const MONGO_URI = process.env.MONGODB_URI;

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);

    // Get all accounts
    const accounts = await Account.find({});
    console.log(`\n📋 Found ${accounts.length} accounts\n`);

    const mapping = {};
    accounts.forEach(acc => {
      mapping[acc.accountId] = acc._id;
      console.log(`  ${acc.accountId} → ${acc._id}`);
    });

    // Get conversations
    const convs = await Conversation.find({});
    console.log(`\n📝 Found ${convs.length} conversations\n`);

    // Update each conversation
    let updated = 0;
    for (const conv of convs) {
      if (mapping[conv.accountId]) {
        const newAccountId = mapping[conv.accountId];
        await Conversation.updateOne(
          { _id: conv._id },
          { $set: { accountId: newAccountId } }
        );
        updated++;
        console.log(`✅ Updated: ${conv.accountId} → ${newAccountId}`);
      } else {
        console.log(`⚠️  No mapping found for ${conv.accountId}`);
      }
    }

    console.log(`\n✅ Migration complete: ${updated} conversations updated\n`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrate();
