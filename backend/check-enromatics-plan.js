import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';

dotenv.config();

async function checkPlan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Find Enromatics account
    const enromatics = await Account.findOne({ name: 'Enromatics' });
    if (!enromatics) {
      console.log('❌ Enromatics account not found');
      process.exit(0);
    }

    console.log('📊 ENROMATICS ACCOUNT:');
    console.log(`  Name: ${enromatics.name}`);
    console.log(`  _id: ${enromatics._id}`);
    console.log(`  Status: ${enromatics.status}`);
    console.log(`  Plan: ${enromatics.plan}`);
    console.log(`  Type: ${enromatics.type}`);
    console.log(`  Subscription Status: ${enromatics.subscriptionStatus}`);

    // Check subscription
    const subscription = await Subscription.findOne({ 
      accountId: enromatics._id 
    });

    if (subscription) {
      console.log('\n📅 SUBSCRIPTION:');
      console.log(`  Status: ${subscription.status}`);
      console.log(`  Plan: ${subscription.planId}`);
      console.log(`  Active: ${subscription.isActive}`);
      console.log(`  Valid From: ${new Date(subscription.validFrom).toLocaleDateString()}`);
      console.log(`  Valid Till: ${new Date(subscription.validTill).toLocaleDateString()}`);
    } else {
      console.log('\n⚠️ No subscription found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPlan();
