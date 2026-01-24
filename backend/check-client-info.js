import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import Account from './src/models/Account.js';
import Payment from './src/models/Payment.js';
import Subscription from './src/models/Subscription.js';

async function checkClientInfo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/replysys');
    console.log('✅ Connected to MongoDB\n');

    const email = 'pixelsadvertise@gmail.com';
    
    // 1. Find Account
    console.log('🔍 Looking for account:', email);
    const account = await Account.findOne({ email });
    
    if (!account) {
      console.log('❌ Account not found with email:', email);
      process.exit(1);
    }

    console.log('\n📋 ACCOUNT INFO:');
    console.log('━'.repeat(60));
    console.log('Name:', account.name);
    console.log('Email:', account.email);
    console.log('Status:', account.status);
    console.log('Account ID:', account.accountId);
    console.log('Company:', account.company || 'N/A');
    console.log('Phone:', account.phone || 'N/A');
    console.log('Created:', account.createdAt);

    // 2. Find Payments (Orders)
    console.log('\n💳 PAYMENT RECORDS (Orders):');
    console.log('━'.repeat(60));
    
    const payments = await Payment.find({ accountId: account._id })
      .sort({ initiatedAt: -1 });

    if (payments.length === 0) {
      console.log('No payment records found');
    } else {
      payments.forEach((payment, index) => {
        console.log(`\n[Order ${index + 1}]`);
        console.log('Payment ID:', payment.paymentId);
        console.log('Order ID:', payment.orderId);
        console.log('Status:', payment.status);
        console.log('Amount:', payment.amount, payment.currency);
        console.log('Gateway:', payment.paymentGateway);
        console.log('Date:', payment.initiatedAt);

        if (payment.pricingSnapshot) {
          console.log('\n  📦 PRICING SNAPSHOT:');
          console.log('  Plan Name:', payment.pricingSnapshot.planName);
          console.log('  Monthly Price:', payment.pricingSnapshot.monthlyPrice);
          console.log('  Setup Fee:', payment.pricingSnapshot.setupFee);
          console.log('  Selected Cycle:', payment.pricingSnapshot.selectedBillingCycle);
          console.log('  Calculated Amount:', payment.pricingSnapshot.calculatedAmount);
          console.log('  Discount Applied:', payment.pricingSnapshot.discountApplied + '%');
          console.log('  Final Amount:', payment.pricingSnapshot.finalAmount);
          console.log('  Captured At:', payment.pricingSnapshot.capturedAt);
        } else {
          console.log('  ⚠️  No pricing snapshot (old payment)');
        }

        if (payment.metadata) {
          console.log('\n  📝 METADATA:');
          console.log('  Plan:', payment.metadata.plan);
          console.log('  Plan Name:', payment.metadata.planName);
          console.log('  Billing Cycle:', payment.metadata.billingCycle);
        }
      });
    }

    // 3. Find Subscriptions
    console.log('\n\n🔄 SUBSCRIPTIONS:');
    console.log('━'.repeat(60));
    
    const subscriptions = await Subscription.find({ accountId: account._id })
      .populate('planId')
      .sort({ createdAt: -1 });

    if (subscriptions.length === 0) {
      console.log('No active subscriptions found');
    } else {
      subscriptions.forEach((sub, index) => {
        console.log(`\n[Subscription ${index + 1}]`);
        console.log('Subscription ID:', sub.subscriptionId);
        console.log('Plan:', sub.planId?.name || sub.planId);
        console.log('Status:', sub.status);
        console.log('Billing Cycle:', sub.billingCycle);
        console.log('Start Date:', sub.startDate);
        console.log('End Date:', sub.endDate);
        console.log('Auto Renew:', sub.autoRenew);

        if (sub.pricing) {
          console.log('\n  💰 PRICING:');
          console.log('  Amount:', sub.pricing.amount);
          console.log('  Discount:', sub.pricing.discount);
          console.log('  Final Amount:', sub.pricing.finalAmount);
          console.log('  Currency:', sub.pricing.currency);
        }
      });
    }

    // Summary
    console.log('\n\n📊 SUMMARY:');
    console.log('━'.repeat(60));
    console.log('✅ Account Status:', account.status);
    console.log('📦 Pending Orders:', payments.filter(p => p.status === 'pending').length);
    console.log('✓ Completed Orders:', payments.filter(p => p.status === 'completed').length);
    console.log('🔄 Active Subscriptions:', subscriptions.filter(s => s.status === 'active').length);

    if (payments.length > 0) {
      const latestPayment = payments[0];
      console.log('\n🔴 LATEST ORDER:');
      console.log('Status:', latestPayment.status);
      console.log('Amount:', latestPayment.amount, latestPayment.currency);
      if (latestPayment.pricingSnapshot) {
        console.log('Plan:', latestPayment.pricingSnapshot.planName);
        console.log('Cycle:', latestPayment.pricingSnapshot.selectedBillingCycle);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkClientInfo();
