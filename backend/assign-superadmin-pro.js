import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import actual models
import Account from './src/models/Account.js';
import PricingPlan from './src/models/PricingPlan.js';
import Subscription from './src/models/Subscription.js';
import { generateId } from './src/utils/idGenerator.js';

async function assignSuperadminProPlan() {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find superadmin account
    console.log('🔍 Finding superadmin account...');
    const superadmin = await Account.findOne({ type: 'internal' });

    if (!superadmin) {
      console.log('❌ Superadmin account not found');
      console.log('Looking for accounts with type="internal"...');
      const allAccounts = await Account.find({}).select('name email type');
      console.log('Available accounts:', allAccounts);
      process.exit(1);
    }

    console.log('✅ Found Superadmin Account:');
    console.log('  Name:', superadmin.name);
    console.log('  Email:', superadmin.email);
    console.log('  Type:', superadmin.type);
    console.log('  ID:', superadmin._id);
    console.log('  Current Subscription ID:', superadmin.subscription || '(none)');

    // Find Pro plan
    console.log('\n🔍 Finding Pro pricing plan...');
    const proPlan = await PricingPlan.findOne({
      name: 'Pro',
      isActive: true
    });

    if (!proPlan) {
      console.log('❌ Pro plan not found');
      const allPlans = await PricingPlan.find({ isActive: true }).select('name monthlyPrice setupFee');
      console.log('Available plans:', allPlans);
      process.exit(1);
    }

    console.log('✅ Found Pro Plan:');
    console.log('  Name:', proPlan.name);
    console.log('  Monthly Price: ₹' + proPlan.monthlyPrice);
    console.log('  Setup Fee: ₹' + proPlan.setupFee);
    console.log('  Features:', proPlan.features ? Object.keys(proPlan.features).join(', ') : 'N/A');
    console.log('  Plan ID:', proPlan._id);

    // Create infinite expiry date (year 2099)
    const infiniteExpiryDate = new Date('2099-12-31');
    const originalAmount = proPlan.monthlyPrice + (proPlan.setupFee || 0);
    const subscriptionId = `sub_${generateId()}`;

    console.log('\n📝 Creating Pro subscription with:');
    console.log('  Subscription ID:', subscriptionId);
    console.log('  Discount: 100% (Superadmin perk)');
    console.log('  Amount: ₹0 (100% discount applied)');
    console.log('  Original Amount: ₹' + originalAmount);
    console.log('  Expiry Date: ' + infiniteExpiryDate.toDateString() + ' (Infinite)');
    console.log('  Status: active');

    // Check if subscription already exists for this account
    let subscription = await Subscription.findOne({ accountId: superadmin._id });

    if (subscription) {
      console.log('\n🔄 Updating existing subscription...');
      subscription.status = 'active';
      subscription.planId = proPlan._id;
      subscription.billingCycle = 'monthly';
      subscription.pricing = {
        amount: originalAmount,
        discount: originalAmount, // Full discount
        discountReason: 'Superadmin 100% discount',
        finalAmount: 0,
        currency: 'INR'
      };
      subscription.startDate = new Date();
      subscription.endDate = infiniteExpiryDate;
      subscription.renewalDate = infiniteExpiryDate;
      subscription.paymentGateway = 'manual';
      subscription.autoRenew = true;
      subscription.nextRenewalDate = infiniteExpiryDate;
      subscription.updatedAt = new Date();
      
      await subscription.save();
      console.log('✅ Updated Subscription:', subscription._id);
    } else {
      console.log('\n📝 Creating new subscription...');
      subscription = await Subscription.create({
        subscriptionId: subscriptionId,
        accountId: superadmin._id,
        planId: proPlan._id,
        status: 'active',
        billingCycle: 'monthly',
        pricing: {
          amount: originalAmount,
          discount: originalAmount,
          discountReason: 'Superadmin 100% discount',
          finalAmount: 0,
          currency: 'INR'
        },
        startDate: new Date(),
        endDate: infiniteExpiryDate,
        renewalDate: infiniteExpiryDate,
        paymentGateway: 'manual',
        autoRenew: true,
        nextRenewalDate: infiniteExpiryDate
      });
      console.log('✅ Created new Subscription:', subscription._id);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS: SUPERADMIN PRO PLAN ASSIGNED!');
    console.log('='.repeat(60));
    console.log('\n📊 Final Status:');
    console.log('  Account: ' + superadmin.name);
    console.log('  Email: ' + superadmin.email);
    console.log('  Plan: Pro');
    console.log('  Monthly Cost: ₹0 (100% discount)');
    console.log('  Setup Cost: ₹0');
    console.log('  Expiry: ' + infiniteExpiryDate.toDateString() + ' (Never expires)');
    console.log('  Status: Active ✅');
    console.log('\n🎉 Superadmin can now access ALL pro features unlimited!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Troubleshooting:');
    console.error('  1. Check MONGODB_URI in .env');
    console.error('  2. Check if superadmin account exists (type: "internal")');
    console.error('  3. Check if Pro pricing plan exists and is active');
    process.exit(1);
  }
}

assignSuperadminProPlan();
