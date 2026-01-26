#!/usr/bin/env node
/**
 * Account ID Cleanup Script
 * - Fix main account IDs (pixels_internal → 2600001, eno_2600003 → 2600003)
 * - Delete 3 test accounts
 * - Delete 24 orphaned records (invoices, subscriptions, payments)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Invoice from './src/models/Invoice.js';
import Subscription from './src/models/Subscription.js';
import Payment from './src/models/Payment.js';

dotenv.config();

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const color = type === 'error' ? COLORS.red : type === 'success' ? COLORS.green : type === 'warning' ? COLORS.yellow : COLORS.cyan;
  console.log(`${color}[${timestamp}] ${message}${COLORS.reset}`);
}

async function cleanup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform');
    await log('Connected to MongoDB', 'success');

    let totalFixed = 0;
    let totalDeleted = 0;

    // ========================
    // PHASE 1: FIX MAIN ACCOUNTS
    // ========================
    await log('\n=== PHASE 1: FIX MAIN ACCOUNT IDS ===', 'info');

    // Fix pixels_internal → 2600001
    const pixelsAccount = await Account.findOne({ accountId: 'pixels_internal' });
    if (pixelsAccount) {
      await Account.findByIdAndUpdate(pixelsAccount._id, { accountId: '2600001' });
      await log('✅ Fixed: pixels_internal → 2600001', 'success');
      totalFixed++;
    }

    // Fix eno_2600003 → 2600003
    const enomaticsAccount = await Account.findOne({ accountId: 'eno_2600003' });
    if (enomaticsAccount) {
      await Account.findByIdAndUpdate(enomaticsAccount._id, { accountId: '2600003' });
      await log('✅ Fixed: eno_2600003 → 2600003', 'success');
      totalFixed++;
    }

    // ========================
    // PHASE 2: DELETE TEST ACCOUNTS
    // ========================
    await log('\n=== PHASE 2: DELETE TEST ACCOUNTS ===', 'info');

    const testAccountIds = [
      'acc_1769230634873_ztekmj4jr',
      'acc_1769258656538_298tnsu7s',
      'acc_1769264800265_5rokwxseq'
    ];

    for (const accountId of testAccountIds) {
      const result = await Account.findOneAndDelete({ accountId });
      if (result) {
        await log(`✅ Deleted test account: ${accountId}`, 'success');
        totalDeleted++;
      }
    }

    // ========================
    // PHASE 3: DELETE ORPHANED INVOICES
    // ========================
    await log('\n=== PHASE 3: DELETE ORPHANED INVOICES ===', 'info');

    const orphanedInvoiceIds = [
      'inv_2026121',
      'inv_2026168129'
    ];

    for (const invoiceId of orphanedInvoiceIds) {
      const result = await Invoice.findOneAndDelete({ invoiceId });
      if (result) {
        await log(`✅ Deleted orphaned invoice: ${invoiceId}`, 'success');
        totalDeleted++;
      }
    }

    // ========================
    // PHASE 4: DELETE ORPHANED SUBSCRIPTIONS
    // ========================
    await log('\n=== PHASE 4: DELETE ORPHANED SUBSCRIPTIONS ===', 'info');

    const orphanedSubscriptionIds = [
      'sub_trial_1768973674653',
      'sub_trial_1768973674942'
    ];

    for (const subscriptionId of orphanedSubscriptionIds) {
      const result = await Subscription.findOneAndDelete({ subscriptionId });
      if (result) {
        await log(`✅ Deleted orphaned subscription: ${subscriptionId}`, 'success');
        totalDeleted++;
      }
    }

    // ========================
    // PHASE 5: DELETE ORPHANED PAYMENTS (20 records)
    // ========================
    await log('\n=== PHASE 5: DELETE ORPHANED PAYMENTS ===', 'info');

    const orphanedPaymentIds = [
      'PAY_1769225863532_E1JWDMU07',
      'PAY_1769225916607_A91THNW9G',
      'PAY_1769232860663_WTDUXDAUR',
      'PAY_1769233556894_RZYYNAE1A',
      'PAY_1769254931774_KZ5Y7B9QY',
      'PAY_1769255304403_T2JDF6WG2',
      'PAY_1769255341335_0WID33UNG',
      'PAY_1769255376208_18M769LIS',
      'PAY_1769255602430_VQE73JA',
      'PAY_1769256003966_UMEWICMQB',
      'PAY_1769256600450_1UC6W112N',
      'PAY_1769256866566_ZLHJRNSG4',
      'PAY_1769256902736_ORA49E9NC',
      'PAY_1769259307980_A9BP12AUM',
      'PAY_1769259429128_R98S8B7I9',
      'PAY_1769264823872_T8HJKGP5F',
      'PAY_1769264937929_BK9M7L6DM',
      'PAY_1769265791543_VDVZ8PRX8',
      'PAY_1769266492117_VDZLTB9TK',
      'PAY_1769327120293_OO7I9NB2X'
    ];

    for (const paymentId of orphanedPaymentIds) {
      const result = await Payment.findOneAndDelete({ paymentId });
      if (result) {
        await log(`✅ Deleted orphaned payment: ${paymentId}`, 'success');
        totalDeleted++;
      }
    }

    // ========================
    // SUMMARY
    // ========================
    await log('\n=== CLEANUP SUMMARY ===', 'success');
    console.log(`\n✅ Total records FIXED: ${totalFixed}`);
    console.log(`✅ Total records DELETED: ${totalDeleted}`);
    console.log(`\n📊 Database is now clean!\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    await log(`Cleanup failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run cleanup
cleanup();
