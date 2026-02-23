import mongoose from 'mongoose';
import Invoice from './src/models/Invoice.js';
import Payment from './src/models/Payment.js';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';

await mongoose.connect('mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('           💰 REVENUE & ACCOUNTING AUDIT REPORT');
console.log('═══════════════════════════════════════════════════════════════\n');

try {
  // 1. GET ALL INVOICES WITH AMOUNTS
  console.log('📋 INVOICES SUMMARY:');
  console.log('───────────────────────────────────────────────────────────');
  const invoices = await Invoice.find({}).lean();
  
  if (invoices.length === 0) {
    console.log('  ❌ No invoices found');
  } else {
    let totalInvoiceAmount = 0;
    let totalPaidAmount = 0;
    let totalDueAmount = 0;
    let paidInvoices = 0;
    
    invoices.forEach(inv => {
      totalInvoiceAmount += inv.totalAmount || 0;
      totalPaidAmount += inv.paidAmount || 0;
      totalDueAmount += inv.dueAmount || 0;
      
      if (inv.status === 'paid') paidInvoices++;
      
      console.log(`\n  Invoice: ${inv.invoiceNumber}`);
      console.log(`    • Total Amount: ₹${inv.totalAmount}`);
      console.log(`    • Paid Amount: ₹${inv.paidAmount || 0}`);
      console.log(`    • Due Amount: ₹${inv.dueAmount}`);
      console.log(`    • Discount: ₹${inv.discountAmount || 0}`);
      console.log(`    • Status: ${inv.status}`);
      console.log(`    • Account ID: ${inv.accountId}`);
      
      // Verify the math: totalAmount = subtotal + tax - discount
      const calculatedTotal = (inv.subtotal || 0) + (inv.taxAmount || 0) - (inv.discountAmount || 0);
      if (Math.abs(calculatedTotal - inv.totalAmount) > 0.01) {
        console.log(`    ⚠️  MISMATCH: Calculated ₹${calculatedTotal} vs Stored ₹${inv.totalAmount}`);
      }
      
      // Verify: totalAmount = paidAmount + dueAmount
      const expectedDue = inv.totalAmount - (inv.paidAmount || 0);
      if (Math.abs(expectedDue - inv.dueAmount) > 0.01) {
        console.log(`    ⚠️  DUE MISMATCH: Expected ₹${expectedDue} vs Stored ₹${inv.dueAmount}`);
      }
    });
    
    console.log(`\n  📊 INVOICE TOTALS:`);
    console.log(`    • Total Invoice Amount: ₹${totalInvoiceAmount.toFixed(2)}`);
    console.log(`    • Total Paid Amount: ₹${totalPaidAmount.toFixed(2)}`);
    console.log(`    • Total Due Amount: ₹${totalDueAmount.toFixed(2)}`);
    console.log(`    • Paid Invoices: ${paidInvoices}/${invoices.length}`);
  }

  // 2. GET ALL PAYMENTS
  console.log('\n\n💳 PAYMENTS SUMMARY:');
  console.log('───────────────────────────────────────────────────────────');
  const payments = await Payment.find({}).lean();
  
  if (payments.length === 0) {
    console.log('  ❌ No payments found');
  } else {
    let totalPaymentAmount = 0;
    let completedPayments = 0;
    let failedPayments = 0;
    
    payments.forEach(pay => {
      if (pay.status === 'completed') {
        totalPaymentAmount += pay.amount || 0;
        completedPayments++;
      }
      if (pay.status === 'failed') failedPayments++;
      
      console.log(`\n  Payment: ${pay.paymentId}`);
      console.log(`    • Amount: ₹${pay.amount}`);
      console.log(`    • Status: ${pay.status}`);
      console.log(`    • Gateway: ${pay.paymentGateway}`);
      console.log(`    • Account ID: ${pay.accountId}`);
      console.log(`    • Order ID: ${pay.orderId}`);
    });
    
    console.log(`\n  📊 PAYMENT TOTALS:`);
    console.log(`    • Total Payment Amount (Completed): ₹${totalPaymentAmount.toFixed(2)}`);
    console.log(`    • Completed Payments: ${completedPayments}`);
    console.log(`    • Failed Payments: ${failedPayments}`);
    console.log(`    • Total Payment Records: ${payments.length}`);
  }

  // 3. GET ACCOUNTS WITH PAYMENT TRACKING
  console.log('\n\n👤 ACCOUNT PAYMENT TRACKING:');
  console.log('───────────────────────────────────────────────────────────');
  const accounts = await Account.find({ totalPayments: { $gt: 0 } }).lean();
  
  if (accounts.length === 0) {
    console.log('  ℹ️  No accounts with payments');
  } else {
    let totalAccountPayments = 0;
    
    accounts.forEach(acc => {
      totalAccountPayments += acc.totalPayments || 0;
      
      console.log(`\n  Account: ${acc.email}`);
      console.log(`    • Account ID: ${acc._id}`);
      console.log(`    • 7-Digit ID: ${acc.sevenDigitId || 'N/A'}`);
      console.log(`    • Total Payments: ₹${acc.totalPayments}`);
      console.log(`    • Last Payment Date: ${acc.lastPaymentDate ? new Date(acc.lastPaymentDate).toLocaleDateString() : 'N/A'}`);
    });
    
    console.log(`\n  📊 ACCOUNT TOTALS:`);
    console.log(`    • Total Account Payments: ₹${totalAccountPayments.toFixed(2)}`);
    console.log(`    • Accounts with Payments: ${accounts.length}`);
  }

  // 4. RECONCILIATION CHECK
  console.log('\n\n🔍 RECONCILIATION CHECK:');
  console.log('───────────────────────────────────────────────────────────');
  
  const totalFromInvoices = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalFromPayments = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, pay) => sum + (pay.amount || 0), 0);
  const totalFromAccounts = accounts.reduce((sum, acc) => sum + (acc.totalPayments || 0), 0);
  
  console.log(`\n  Invoice paidAmount Total: ₹${totalFromInvoices.toFixed(2)}`);
  console.log(`  Payment Amount Total: ₹${totalFromPayments.toFixed(2)}`);
  console.log(`  Account totalPayments Total: ₹${totalFromAccounts.toFixed(2)}`);
  
  console.log(`\n  ✅ VERIFICATION:`);
  const invoicePaymentMatch = Math.abs(totalFromInvoices - totalFromPayments) < 0.01;
  const paymentAccountMatch = Math.abs(totalFromPayments - totalFromAccounts) < 0.01;
  const allMatch = invoicePaymentMatch && paymentAccountMatch;
  
  console.log(`    • Invoice paidAmount = Payment amount: ${invoicePaymentMatch ? '✅ YES' : '❌ NO'}`);
  console.log(`    • Payment amount = Account totalPayments: ${paymentAccountMatch ? '✅ YES' : '❌ NO'}`);
  console.log(`    • All Match: ${allMatch ? '✅ CORRECT' : '❌ MISMATCH'}`);
  
  if (!allMatch) {
    console.log(`\n  ⚠️  DISCREPANCIES FOUND:`);
    if (!invoicePaymentMatch) {
      const diff = Math.abs(totalFromInvoices - totalFromPayments);
      console.log(`    • Invoice vs Payment difference: ₹${diff.toFixed(2)}`);
    }
    if (!paymentAccountMatch) {
      const diff = Math.abs(totalFromPayments - totalFromAccounts);
      console.log(`    • Payment vs Account difference: ₹${diff.toFixed(2)}`);
    }
  }

  // 5. PAYMENT DETAILS BY SUBSCRIPTION
  console.log('\n\n📈 PAYMENT DETAILS BY SUBSCRIPTION:');
  console.log('───────────────────────────────────────────────────────────');
  const subscriptions = await Subscription.find({}).lean();
  
  subscriptions.forEach(sub => {
    const subPayments = payments.filter(p => p.subscriptionId?.toString() === sub._id.toString());
    const subInvoices = invoices.filter(i => i.subscriptionId?.toString() === sub._id.toString());
    
    if (subPayments.length > 0 || subInvoices.length > 0) {
      console.log(`\n  Subscription: ${sub._id}`);
      console.log(`    • Plan: ${sub.planName}`);
      console.log(`    • Billing Cycle: ${sub.billingCycle}`);
      console.log(`    • Status: ${sub.status}`);
      console.log(`    • Invoices: ${subInvoices.length}`);
      console.log(`    • Payments: ${subPayments.length}`);
    }
  });

  console.log('\n═══════════════════════════════════════════════════════════════\n');

} catch (error) {
  console.error('❌ Error during audit:', error.message);
} finally {
  await mongoose.disconnect();
}
