import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';

dotenv.config();

async function checkSubscription() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const acc = await Account.findOne({ accountId: 'eno_2600003' });
    console.log('Account:', acc.accountId, '| ObjectId:', acc._id.toString(), '| Type:', acc.type);
    
    const sub = await Subscription.findOne({ accountId: 'eno_2600003' });
    console.log('Subscription (by String accountId):', !!sub);
    if (sub) console.log('  Status:', sub.status);
    
    const allSubs = await Subscription.find({});
    console.log('\nAll subscriptions:');
    allSubs.forEach(s => {
      console.log(`  accountId: ${s.accountId} (type: ${typeof s.accountId}) | status: ${s.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSubscription();
