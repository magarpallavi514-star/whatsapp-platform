import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import actual models
import Account from './src/models/Account.js';
import PricingPlan from './src/models/PricingPlan.js';
import Subscription from './src/models/Subscription.js';
import Invoice from './src/models/Invoice.js';
import { generateId } from './src/utils/idGenerator.js';

async function assignEnromaticsProPlan() {
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
    console.log('  Type:', enromatics.type);
    console.log('  ID:', enromatics._id);
    console.log('  Account ID:', enromatics.accountId);

    // Find Pro plan
    console.log('\n🔍 Finding Pro pricing plan...');
    const proPlan = await PricingPlan.findOne({
      name: 'Pro',
      isActive: true
    });

    if (!proPlan) {
      console.log('❌ Pro plan not found');
      process.exit(1);
    }

    console.log('✅ Found Pro Plan:');
    console.log('  Name:', proPlan.name);
    console.log('  Monthly Price: ₹' + proPlan.monthlyPrice);
    console.log('  Setup Fee: ₹' + proPlan.setupFee);

    // Create infinite expiry date (year 2099)
    const infiniteExpiryDate = new Date('2099-12-31');
    const originalAmount = proPlan.monthlyPrice + (proPlan.setupFee || 0);
    const subscriptionId = `sub_${generateId()}`;

    console.log('\n📝 Creating Pro subscription for Enromatics with:');
    console.log('  Subscription ID:', subscriptionId);
    console.log('  Discount: 100% (Enterprise Customer)');
    console.log('  Amount: ₹0 (100% discount applied)');
    console.log('  Original Amount: ₹' + originalAmount);
    console.log('  Expiry Date: ' + infiniteExpiryDate.toDateString() + ' (Infinite)');
    console.log('  Status: active');

    // Check if subscription already exists
    let subscription = await Subscription.findOne({ accountId: enromatics._id });

    if (subscription) {
      console.log('\n🔄 Updating existing subscription...');
      // If no subscriptionId, generate one
      if (!subscription.subscriptionId) {
        subscription.subscriptionId = subscriptionId;
      }
      subscription.status = 'active';
      subscription.planId = proPlan._id;
      subscription.billingCycle = 'monthly';
      subscription.pricing = {
        amount: originalAmount,
        discount: originalAmount,
        discountReason: 'Enromatics Enterprise - 100% discount',
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
      console.log('✅ Updated Subscription ID:', subscription.subscriptionId);
    } else {
      console.log('\n📝 Creating new subscription...');
      subscription = await Subscription.create({
        subscriptionId: subscriptionId,
        accountId: enromatics._id,
        planId: proPlan._id,
        status: 'active',
        billingCycle: 'monthly',
        pricing: {
          amount: originalAmount,
          discount: originalAmount,
          discountReason: 'Enromatics Enterprise - 100% discount',
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
      console.log('✅ Created new Subscription ID:', subscription.subscriptionId);
    }

    // Create Invoice
    console.log('\n📄 Creating Invoice...');
    const invoiceId = `inv_${generateId()}`;
    const invoiceNumber = `INV-ENO_${enromatics.accountId}-${Date.now()}`;
    
    const invoice = await Invoice.create({
      invoiceId: invoiceId,
      invoiceNumber: invoiceNumber,
      accountId: enromatics.accountId,
      subscriptionId: subscription._id,
      
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      periodStart: new Date(),
      periodEnd: infiniteExpiryDate,
      
      billTo: {
        name: enromatics.name,
        email: enromatics.email,
        company: enromatics.name,
        phone: 'N/A'
      },
      
      lineItems: [
        {
          description: 'Pro Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: proPlan.monthlyPrice,
          amount: proPlan.monthlyPrice
        },
        {
          description: 'Setup Fee',
          quantity: 1,
          unitPrice: proPlan.setupFee || 0,
          amount: proPlan.setupFee || 0
        }
      ],
      
      subtotal: originalAmount,
      taxRate: 0,
      taxAmount: 0,
      discountAmount: originalAmount,
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      
      currency: 'INR',
      status: 'paid',
      notes: 'Pro Plan subscription with 100% enterprise discount. Infinite validity.',
      paymentTerms: 'Enterprise Agreement',
      
      payments: [
        {
          paymentId: `pay_${generateId()}`,
          amount: 0,
          date: new Date(),
          method: 'manual',
          status: 'success'
        }
      ]
    });

    console.log('✅ Created Invoice:');
    console.log('  Invoice ID:', invoiceId);
    console.log('  Invoice Number:', invoiceNumber);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS: ENROMATICS PRO PLAN ASSIGNED!');
    console.log('='.repeat(60));
    console.log('\n📊 Final Status:');
    console.log('  Account: ' + enromatics.name);
    console.log('  Email: ' + enromatics.email);
    console.log('  Account ID: ' + enromatics.accountId);
    console.log('  Plan: Pro');
    console.log('  Subscription ID: ' + subscription.subscriptionId);
    console.log('  Monthly Cost: ₹0 (100% discount)');
    console.log('  Setup Cost: ₹0');
    console.log('  Total Discount: ₹' + originalAmount);
    console.log('  Expiry: ' + infiniteExpiryDate.toDateString() + ' (Never expires)');
    console.log('  Status: Active ✅');
    
    console.log('\n💼 Invoice Details:');
    console.log('  Invoice Number: ' + invoiceNumber);
    console.log('  Invoice Date: ' + new Date().toLocaleDateString());
    console.log('  Total Amount (After Discount): ₹0');
    console.log('  Status: Paid ✅');

    console.log('\n🎉 Enromatics can now safely use the platform with all Pro features!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Details:', error);
    process.exit(1);
  }
}

assignEnromaticsProPlan();
