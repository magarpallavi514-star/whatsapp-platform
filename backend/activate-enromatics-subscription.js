#!/usr/bin/env node
/**
 * Activate Subscription for Enromatics
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';
import Invoice from './src/models/Invoice.js';
import PricingPlan from './src/models/PricingPlan.js';

dotenv.config();

async function activateEnomaticsSubscription() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Enromatics account
    const account = await Account.findOne({ accountId: '2600003' });
    if (!account) {
      console.log('❌ Enromatics account not found');
      process.exit(1);
    }

    console.log(`✅ Found Enromatics account: ${account.name} (${account.accountId})`);

    // Get Starter plan (or create if doesn't exist)
    let plan = await PricingPlan.findOne({ name: 'Starter' });
    if (!plan) {
      plan = await PricingPlan.create({
        name: 'Starter',
        monthlyPrice: 2499,
        setupFee: 3000,
        features: ['Basic WhatsApp integration', 'Up to 100 conversations/month'],
        status: 'active'
      });
      console.log('✅ Created Starter plan');
    } else {
      console.log(`✅ Using existing Starter plan (₹${plan.monthlyPrice}/month)`);
    }

    // Create subscription
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription = new Subscription({
      subscriptionId: `sub_eno_${Date.now()}`,
      accountId: '2600003',
      planId: plan._id,
      status: 'active',
      billingCycle: 'monthly',
      pricing: {
        amount: plan.monthlyPrice,
        discount: 0,
        finalAmount: plan.monthlyPrice,
        currency: 'INR'
      },
      startDate: now,
      endDate: endDate,
      renewalDate: endDate,
      paymentGateway: 'manual',
      paymentStatus: 'paid'
    });

    await subscription.save();
    console.log(`✅ Created subscription: ${subscription.subscriptionId}`);

    // Update account
    await Account.findByIdAndUpdate(account._id, {
      subscription: subscription._id,
      plan: 'starter',
      subscriptionStatus: 'active'
    });
    console.log('✅ Updated account with subscription');

    // Create invoice
    const invoice = new Invoice({
      invoiceId: `inv_eno_${Date.now()}`,
      invoiceNumber: `INV-2026-ENO-${Date.now().toString().slice(-4)}`,
      accountId: '2600003',
      subscriptionId: subscription._id,
      invoiceDate: now,
      dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      periodStart: now,
      periodEnd: endDate,
      billTo: {
        name: account.name,
        email: account.email,
        company: account.company,
        phone: account.phone
      },
      lineItems: [
        {
          description: `${plan.name} Plan - Monthly Subscription`,
          quantity: 1,
          unitPrice: plan.monthlyPrice,
          amount: plan.monthlyPrice
        }
      ],
      subtotal: plan.monthlyPrice,
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: plan.monthlyPrice,
      paidAmount: plan.monthlyPrice,
      dueAmount: 0,
      currency: 'INR',
      status: 'paid',
      paymentStatus: 'paid',
      paymentMethod: 'manual'
    });

    await invoice.save();
    console.log(`✅ Created invoice: ${invoice.invoiceNumber}`);

    // Summary
    console.log(`\n🎉 ENROMATICS SUBSCRIPTION ACTIVATED!\n`);
    console.log(`Account: ${account.name} (2600003)`);
    console.log(`Plan: ${plan.name}`);
    console.log(`Price: ₹${plan.monthlyPrice}/month`);
    console.log(`Status: ACTIVE ✅`);
    console.log(`Subscription ID: ${subscription.subscriptionId}`);
    console.log(`Invoice: ${invoice.invoiceNumber}`);
    console.log(`Valid Until: ${endDate.toDateString()}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

activateEnomaticsSubscription();
