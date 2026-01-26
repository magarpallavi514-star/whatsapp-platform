import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';

dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  console.log('📊 Migrating Subscription.accountId to Account.accountId...\n');
  
  // Get all accounts as a map
  const accounts = await Account.find({});
  const accountMap = {};
  accounts.forEach(a => {
    accountMap[a._id.toString()] = a.accountId;
  });
  
  // Get all subscriptions and update
  const subs = await Subscription.find({});
  let migrated = 0;
  
  for (const sub of subs) {
    const accountId = sub.accountId;
    const newAccountId = accountMap[accountId];
    
    if (newAccountId && newAccountId !== accountId) {
      console.log(`  Migrating: ${accountId} → ${newAccountId}`);
      await Subscription.updateOne({ _id: sub._id }, { accountId: newAccountId });
      migrated++;
    } else if (!newAccountId) {
      console.log(`  ⚠️ WARNING: No account found for ${accountId}`);
    } else {
      console.log(`  ✅ Already migrated: ${accountId}`);
    }
  }
  
  console.log(`\n✅ Migrated ${migrated} subscriptions`);
  
  // Verify
  const allSubs = await Subscription.find({});
  console.log('\nFinal state:');
  allSubs.forEach(s => console.log(`  ${s.accountId}`));
  
  process.exit(0);
}

migrate();
