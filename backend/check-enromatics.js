import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const enromatics = await Account.findOne({ name: 'Enromatics' });
    console.log('\n📋 Enromatics Account:');
    console.log('  _id:', enromatics._id);
    console.log('  name:', enromatics.name);
    console.log('  email:', enromatics.email);
    console.log('  accountId:', enromatics.accountId);
    
    // Check if subscription exists
    const subscription = await Subscription.findOne({ customerId: enromatics._id });
    console.log('\n📦 Subscription:');
    if (subscription) {
      console.log('  _id:', subscription._id);
      console.log('  customerId:', subscription.customerId);
      console.log('  plan:', subscription.plan);
      console.log('  status:', subscription.status);
    } else {
      console.log('  ❌ No subscription found for this customer');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
