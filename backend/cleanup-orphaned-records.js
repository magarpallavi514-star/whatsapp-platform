/**
 * Clean Migration: Standardize Account IDs
 * 
 * Current Issues:
 * 1. Some accounts use custom names (pixels_internal, eno_2600003)
 * 2. Some use UUID pattern (acc_timestamp_randomid)
 * 3. Some orphaned records point to non-existent accounts
 * 
 * Strategy:
 * 1. Keep existing valid accounts as-is (they work with controllers)
 * 2. Delete orphaned records (invoices, subscriptions, payments for deleted accounts)
 * 3. Verify all data references match existing accountIds
 */

import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Invoice from './src/models/Invoice.js';
import Subscription from './src/models/Subscription.js';
import Payment from './src/models/Payment.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

async function cleanupOrphanedRecords() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Step 1: Get all valid accountIds
    const accounts = await Account.find().select('accountId email').lean();
    const validAccountIds = new Set(accounts.map(a => a.accountId));
    
    console.log(`Found ${accounts.length} valid accounts:`);
    accounts.forEach(a => console.log(`  • ${a.email} → accountId: ${a.accountId}`));

    // Step 2: Find and delete orphaned invoices
    console.log('\n📋 Checking Invoices...');
    const allInvoices = await Invoice.find().lean();
    const orphanedInvoices = allInvoices.filter(inv => !validAccountIds.has(inv.accountId));
    
    if (orphanedInvoices.length > 0) {
      console.log(`  Found ${orphanedInvoices.length} orphaned invoices:`);
      orphanedInvoices.forEach(inv => {
        console.log(`    - ${inv._id}: accountId=${inv.accountId} (DELETED)`);
      });
      await Invoice.deleteMany({ _id: { $in: orphanedInvoices.map(i => i._id) } });
      console.log(`  ✓ Deleted ${orphanedInvoices.length} orphaned invoices`);
    } else {
      console.log('  ✓ All invoices reference valid accounts');
    }

    // Step 3: Find and delete orphaned subscriptions
    console.log('\n📋 Checking Subscriptions...');
    const allSubscriptions = await Subscription.find().lean();
    const orphanedSubs = allSubscriptions.filter(sub => !validAccountIds.has(sub.accountId));
    
    if (orphanedSubs.length > 0) {
      console.log(`  Found ${orphanedSubs.length} orphaned subscriptions:`);
      orphanedSubs.forEach(sub => {
        console.log(`    - ${sub._id}: accountId=${sub.accountId} (DELETED)`);
      });
      await Subscription.deleteMany({ _id: { $in: orphanedSubs.map(s => s._id) } });
      console.log(`  ✓ Deleted ${orphanedSubs.length} orphaned subscriptions`);
    } else {
      console.log('  ✓ All subscriptions reference valid accounts');
    }

    // Step 4: Find and delete orphaned payments
    console.log('\n📋 Checking Payments...');
    const allPayments = await Payment.find().lean();
    const orphanedPayments = allPayments.filter(pay => !validAccountIds.has(pay.accountId));
    
    if (orphanedPayments.length > 0) {
      console.log(`  Found ${orphanedPayments.length} orphaned payments:`);
      orphanedPayments.forEach(pay => {
        console.log(`    - ${pay._id}: accountId=${pay.accountId} (DELETED)`);
      });
      await Payment.deleteMany({ _id: { $in: orphanedPayments.map(p => p._id) } });
      console.log(`  ✓ Deleted ${orphanedPayments.length} orphaned payments`);
    } else {
      console.log('  ✓ All payments reference valid accounts');
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('CLEANUP SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total accounts maintained: ${accounts.length}`);
    console.log(`Orphaned invoices deleted: ${orphanedInvoices.length}`);
    console.log(`Orphaned subscriptions deleted: ${orphanedSubs.length}`);
    console.log(`Orphaned payments deleted: ${orphanedPayments.length}`);
    console.log('\n✅ Database is now clean! All records reference valid accounts.');

    await mongoose.connection.close();

  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

cleanupOrphanedRecords();
