import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const enrom = await Account.findOne({ accountId: 'eno_2600003' });
  const sub = await Subscription.findOne({
    accountId: enrom._id.toString(),
    status: 'active'
  });
  
  console.log('✅ Subscription found for Enromatics:', !!sub);
  if (sub) console.log('   Status:', sub.status);
  console.log('Will be BLOCKED?', !sub ? 'YES ❌' : 'NO ✅');
  
  process.exit(0);
}

test();
