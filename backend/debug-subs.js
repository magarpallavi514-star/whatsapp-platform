import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';

dotenv.config();

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const acc = await Account.findOne({ accountId: 'eno_2600003' });
  console.log('Account ObjectId:', acc._id.toString());
  console.log('Account accountId:', acc.accountId);
  
  const sub1 = await Subscription.findOne({ accountId: '6971e3a706837a5539992bee' });
  console.log('Subscription by ObjectId string:', !!sub1, sub1?.status);
  
  const sub2 = await Subscription.findOne({ accountId: 'eno_2600003' });
  console.log('Subscription by Account.accountId:', !!sub2);
  
  // Get all accounts and their subs
  console.log('\nAll accounts:');
  const accounts = await Account.find({});
  for (const a of accounts) {
    const s = await Subscription.findOne({ accountId: a.accountId });
    console.log(`  ${a.accountId} → ${s ? s.status : 'NOT FOUND'}`);
  }
  
  process.exit(0);
}

debug();
