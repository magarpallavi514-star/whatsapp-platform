#!/usr/bin/env node
/**
 * Account ID Consistency Audit
 * Checks for ObjectId/String confusion and inconsistencies across all related models
 * Decision: Use accountId (String, YYXXXXX format) as SINGLE SOURCE OF TRUTH
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Invoice from './src/models/Invoice.js';
import Subscription from './src/models/Subscription.js';
import Payment from './src/models/Payment.js';
import Contact from './src/models/Contact.js';
import Message from './src/models/Message.js';
import Campaign from './src/models/Campaign.js';

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

async function auditAccountIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform');
    await log('Connected to MongoDB', 'success');

    const issues = {
      accountsWithInvalidIds: [],
      orphanedInvoices: [],
      orphanedSubscriptions: [],
      orphanedPayments: [],
      accountsWithoutRecords: [],
      mismatchedReferences: [],
      missingAccountIds: []
    };

    // ========================
    // 1. AUDIT ACCOUNTS
    // ========================
    await log('\n=== AUDITING ACCOUNTS ===', 'info');
    const accounts = await Account.find({});
    await log(`Total accounts: ${accounts.length}`, 'info');

    for (const account of accounts) {
      // Check _id format
      if (!account._id || typeof account._id !== 'object' || !account._id.toString()) {
        issues.accountsWithInvalidIds.push({
          accountId: account.accountId,
          _id: account._id,
          issue: 'Invalid _id format (should be ObjectId)'
        });
      }

      // Check accountId format (YYXXXXX)
      if (!account.accountId || !/^\d{7}$/.test(account.accountId)) {
        issues.accountsWithInvalidIds.push({
          accountId: account.accountId,
          issue: 'Invalid accountId format (should be YYXXXXX)'
        });
      }

      // Check for duplicate accountIds
      const duplicates = await Account.countDocuments({ accountId: account.accountId });
      if (duplicates > 1) {
        issues.mismatchedReferences.push({
          type: 'Account',
          accountId: account.accountId,
          issue: `Duplicate accountId found (${duplicates} records)`
        });
      }
    }

    if (issues.accountsWithInvalidIds.length === 0) {
      await log('✅ All accounts have valid _id (ObjectId) and accountId (YYXXXXX) format', 'success');
    } else {
      await log(`❌ Found ${issues.accountsWithInvalidIds.length} accounts with invalid ID format`, 'error');
      issues.accountsWithInvalidIds.forEach(a => {
        console.log(`   - Account: ${a.accountId || 'UNKNOWN'}, _id: ${a._id}, Issue: ${a.issue}`);
      });
    }

    // ========================
    // 2. AUDIT INVOICES
    // ========================
    await log('\n=== AUDITING INVOICES ===', 'info');
    const invoices = await Invoice.find({});
    await log(`Total invoices: ${invoices.length}`, 'info');

    for (const invoice of invoices) {
      // Check accountId reference
      if (!invoice.accountId || !/^\d{7}$/.test(invoice.accountId)) {
        issues.missingAccountIds.push({
          type: 'Invoice',
          invoiceId: invoice.invoiceId,
          issue: `Invalid accountId: ${invoice.accountId}`
        });
      }

      // Check if account exists
      const accountExists = await Account.findOne({ accountId: invoice.accountId });
      if (!accountExists) {
        issues.orphanedInvoices.push({
          invoiceId: invoice.invoiceId,
          accountId: invoice.accountId,
          issue: 'Account does not exist'
        });
      }

      // Check subscriptionId reference
      if (invoice.subscriptionId && typeof invoice.subscriptionId !== 'object') {
        issues.missingAccountIds.push({
          type: 'Invoice',
          invoiceId: invoice.invoiceId,
          issue: `subscriptionId is not ObjectId: ${typeof invoice.subscriptionId}`
        });
      }
    }

    if (issues.orphanedInvoices.length === 0 && issues.missingAccountIds.filter(i => i.type === 'Invoice').length === 0) {
      await log('✅ All invoices have valid accountId references and linked accounts exist', 'success');
    } else {
      if (issues.orphanedInvoices.length > 0) {
        await log(`❌ Found ${issues.orphanedInvoices.length} orphaned invoices`, 'error');
        issues.orphanedInvoices.forEach(i => {
          console.log(`   - Invoice: ${i.invoiceId}, Account: ${i.accountId}`);
        });
      }
    }

    // ========================
    // 3. AUDIT SUBSCRIPTIONS
    // ========================
    await log('\n=== AUDITING SUBSCRIPTIONS ===', 'info');
    const subscriptions = await Subscription.find({});
    await log(`Total subscriptions: ${subscriptions.length}`, 'info');

    for (const subscription of subscriptions) {
      // Check accountId reference
      if (!subscription.accountId || !/^\d{7}$/.test(subscription.accountId)) {
        issues.missingAccountIds.push({
          type: 'Subscription',
          subscriptionId: subscription.subscriptionId,
          issue: `Invalid accountId: ${subscription.accountId}`
        });
      }

      // Check if account exists
      const accountExists = await Account.findOne({ accountId: subscription.accountId });
      if (!accountExists) {
        issues.orphanedSubscriptions.push({
          subscriptionId: subscription.subscriptionId,
          accountId: subscription.accountId,
          issue: 'Account does not exist'
        });
      }

      // Check planId is ObjectId
      if (subscription.planId && typeof subscription.planId !== 'object') {
        issues.mismatchedReferences.push({
          type: 'Subscription',
          subscriptionId: subscription.subscriptionId,
          issue: `planId is not ObjectId: ${typeof subscription.planId}`
        });
      }
    }

    if (issues.orphanedSubscriptions.length === 0 && issues.missingAccountIds.filter(i => i.type === 'Subscription').length === 0) {
      await log('✅ All subscriptions have valid accountId references and linked accounts exist', 'success');
    } else {
      if (issues.orphanedSubscriptions.length > 0) {
        await log(`❌ Found ${issues.orphanedSubscriptions.length} orphaned subscriptions`, 'error');
        issues.orphanedSubscriptions.forEach(s => {
          console.log(`   - Subscription: ${s.subscriptionId}, Account: ${s.accountId}`);
        });
      }
    }

    // ========================
    // 4. AUDIT PAYMENTS
    // ========================
    await log('\n=== AUDITING PAYMENTS ===', 'info');
    const payments = await Payment.find({});
    await log(`Total payments: ${payments.length}`, 'info');

    for (const payment of payments) {
      // Check accountId reference
      if (!payment.accountId || !/^\d{7}$/.test(payment.accountId)) {
        issues.missingAccountIds.push({
          type: 'Payment',
          paymentId: payment.paymentId,
          issue: `Invalid accountId: ${payment.accountId}`
        });
      }

      // Check if account exists
      const accountExists = await Account.findOne({ accountId: payment.accountId });
      if (!accountExists) {
        issues.orphanedPayments.push({
          paymentId: payment.paymentId,
          accountId: payment.accountId,
          issue: 'Account does not exist'
        });
      }
    }

    if (issues.orphanedPayments.length === 0 && issues.missingAccountIds.filter(i => i.type === 'Payment').length === 0) {
      await log('✅ All payments have valid accountId references and linked accounts exist', 'success');
    } else {
      if (issues.orphanedPayments.length > 0) {
        await log(`❌ Found ${issues.orphanedPayments.length} orphaned payments`, 'error');
        issues.orphanedPayments.forEach(p => {
          console.log(`   - Payment: ${p.paymentId}, Account: ${p.accountId}`);
        });
      }
    }

    // ========================
    // 5. VERIFY ACCOUNT ID UNIQUENESS
    // ========================
    await log('\n=== VERIFYING ACCOUNT ID UNIQUENESS ===', 'info');
    const duplicateAccountIds = await Account.aggregate([
      { $group: { _id: '$accountId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateAccountIds.length === 0) {
      await log('✅ All accountIds are unique across the system', 'success');
    } else {
      await log(`❌ Found ${duplicateAccountIds.length} duplicate accountIds`, 'error');
      duplicateAccountIds.forEach(dup => {
        console.log(`   - accountId: ${dup._id} appears ${dup.count} times`);
      });
      issues.mismatchedReferences.push(...duplicateAccountIds);
    }

    // ========================
    // SUMMARY
    // ========================
    await log('\n=== AUDIT SUMMARY ===', 'info');
    const totalIssues = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);

    console.log(`\nTotal issues found: ${totalIssues}`);
    console.log(`  - Invalid Account IDs: ${issues.accountsWithInvalidIds.length}`);
    console.log(`  - Orphaned Invoices: ${issues.orphanedInvoices.length}`);
    console.log(`  - Orphaned Subscriptions: ${issues.orphanedSubscriptions.length}`);
    console.log(`  - Orphaned Payments: ${issues.orphanedPayments.length}`);
    console.log(`  - Mismatched References: ${issues.mismatchedReferences.length}`);
    console.log(`  - Missing AccountIds: ${issues.missingAccountIds.length}`);

    if (totalIssues === 0) {
      await log('\n🎉 AUDIT PASSED: System has perfect account ID consistency!', 'success');
    } else {
      await log(`\n⚠️  AUDIT FAILED: Found ${totalIssues} consistency issues that need fixing`, 'error');
      console.log('\nDetailed Issues:');
      console.log(JSON.stringify(issues, null, 2));
    }

    process.exit(totalIssues === 0 ? 0 : 1);
  } catch (error) {
    await log(`Audit failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run audit
auditAccountIds();
