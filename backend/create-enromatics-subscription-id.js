import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Subscription from './src/models/Subscription.js';
import Account from './src/models/Account.js';
import { generateId } from './src/utils/idGenerator.js';

async function addSubscriptionIdToEnromatics() {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find Enromatics account
    console.log('🔍 Finding Enromatics account...');
    const enromatics = await Account.findOne({ email: 'info@enromatics.com' });

    if (!enromatics) {
      console.log('❌ Enromatics account not found');
      process.exit(1);
    }

    console.log('✅ Found Enromatics Account:');
    console.log('  Name:', enromatics.name);
    console.log('  Email:', enromatics.email);
    console.log('  ID:', enromatics._id);

    // Find subscription
    console.log('\n🔍 Finding Enromatics subscription...');
    const subscription = await Subscription.findOne({ accountId: enromatics._id });

    if (!subscription) {
      console.log('❌ Subscription not found for Enromatics');
      process.exit(1);
    }

    console.log('✅ Found Subscription:');
    console.log('  ID (_id):', subscription._id);
    console.log('  Current subscriptionId:', subscription.subscriptionId || '(none)');
    console.log('  Status:', subscription.status);
    console.log('  Plan ID:', subscription.planId);

    // Generate and assign subscription ID
    const newSubscriptionId = `sub_${generateId()}`;
    
    subscription.subscriptionId = newSubscriptionId;
    await subscription.save();

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS: SUBSCRIPTION ID CREATED!');
    console.log('='.repeat(60));
    console.log('\n📊 Subscription Details:');
    console.log('  Account: ' + enromatics.name);
    console.log('  Email: ' + enromatics.email);
    console.log('  Subscription ID: ' + newSubscriptionId);
    console.log('  Status: ' + subscription.status);
    console.log('  Start Date: ' + subscription.startDate?.toLocaleDateString());
    console.log('  End Date: ' + subscription.endDate?.toLocaleDateString());
    console.log('\n✅ Enromatics can now safely use the platform!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

addSubscriptionIdToEnromatics();
