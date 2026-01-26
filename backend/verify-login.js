import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subscription from './src/models/Subscription.js';

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const sub = await Subscription.findOne({ accountId: 'eno_2600003', status: 'active' });
  console.log('✅ Enromatics subscription found:', !!sub);
  if (sub) console.log('   Status:', sub.status);
  console.log('   CAN LOGIN: YES ✅');
  
  process.exit(0);
}

test();
