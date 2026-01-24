#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
import Account from './src/models/Account.js';
import Payment from './src/models/Payment.js';
import Subscription from './src/models/Subscription.js';

async function checkClient() {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('🔗 Connecting to MongoDB:', mongoUri?.split('@')[1] || 'local');
    
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/replysys');
    console.log('✅ Connected!\n');

    const email = 'pixelsadvertise@gmail.com';
    
    // Find Account
    const account = await Account.findOne({ email });
    
    if (!account) {
      console.log('❌ No account found with email:', email);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('📋 ACCOUNT:');
    console.log('━'.repeat(70));
    console.log('Name:', account.name);
    console.log('Email:', account.email);
    console.log('Status:', account.status);
    console.log('Company:', account.company || 'N/A');
    console.log('Created:', new Date(account.createdAt).toLocaleDateString('en-IN'));

    // Find Payments
    const payments = await Payment.find({ accountId: account._id })
      .sort({ initiatedAt: -1 });

    console.log('\n💳 PENDING ORDERS & PAYMENTS:');
    console.log('━'.repeat(70));
    
    if (payments.length === 0) {
      console.log('No payment records found');
    } else {
      payments.forEach((p, idx) => {
        console.log(`\n[${idx + 1}] ${p.status.toUpperCase()} - ${new Date(p.initiatedAt).toLocaleDateString('en-IN')}`);
        console.log('  Order ID:', p.orderId);
        console.log('  Amount:', '₹' + p.amount?.toLocaleString('en-IN'));
        
        if (p.pricingSnapshot) {
          console.log('  ✅ SNAPSHOT:');
          console.log('    Plan:', p.pricingSnapshot.planName);
          console.log('    Cycle:', p.pricingSnapshot.selectedBillingCycle);
          console.log('    Locked Amount:', '₹' + p.pricingSnapshot.finalAmount?.toLocaleString('en-IN'));
          if (p.pricingSnapshot.discountApplied > 0) {
            console.log('    Discount:', p.pricingSnapshot.discountApplied + '%');
          }
        } else {
          console.log('  ⚠️  No snapshot (old order)');
        }
      });
    }

    // Find Subscriptions
    const subs = await Subscription.find({ accountId: account._id })
      .populate('planId')
      .sort({ createdAt: -1 });

    console.log('\n🔄 SUBSCRIPTIONS:');
    console.log('━'.repeat(70));
    
    if (subs.length === 0) {
      console.log('No subscriptions');
    } else {
      subs.forEach((s, idx) => {
        console.log(`\n[${idx + 1}] ${s.status.toUpperCase()}`);
        console.log('  Plan:', s.planId?.name || 'Unknown');
        console.log('  Cycle:', s.billingCycle);
        console.log('  Active:', new Date(s.startDate).toLocaleDateString('en-IN'), '→', new Date(s.endDate).toLocaleDateString('en-IN'));
        if (s.pricing) {
          console.log('  Amount:', '₹' + s.pricing.finalAmount?.toLocaleString('en-IN'));
        }
      });
    }

    console.log('\n\n📊 SUMMARY:');
    console.log('━'.repeat(70));
    console.log('Account Status:', account.status);
    console.log('Pending Orders:', payments.filter(p => p.status === 'pending').length);
    console.log('Completed Orders:', payments.filter(p => p.status === 'completed').length);
    console.log('Active Subscriptions:', subs.filter(s => s.status === 'active').length);

    if (payments.length > 0) {
      const latest = payments[0];
      const snapshot = latest.pricingSnapshot;
      console.log('\n🔴 LATEST ORDER:');
      console.log('Status:', latest.status);
      console.log('Amount:', '₹' + latest.amount?.toLocaleString('en-IN'));
      if (snapshot) {
        console.log('Plan:', snapshot.planName);
        console.log('Billing Cycle:', snapshot.selectedBillingCycle);
        console.log('Amount Locked:', '₹' + snapshot.finalAmount?.toLocaleString('en-IN'));
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkClient();
