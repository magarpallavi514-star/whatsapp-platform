import mongoose from 'mongoose';

await mongoose.connect('mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp');

const db = mongoose.connection.db;

console.log('\n💰 REVENUE CHECK:\n');

// Check invoices
const invoices = await db.collection('invoices').find({}).toArray();
console.log(`Total Invoices: ${invoices.length}`);
invoices.forEach(inv => {
  console.log(`  • ${inv.invoiceNumber}: ₹${inv.totalAmount} (Status: ${inv.status}, Paid: ₹${inv.paidAmount})`);
});

// Check accounts with payments
const accounts = await db.collection('accounts').find({ totalPayments: { $gt: 0 } }).toArray();
console.log(`\nAccounts with Payments: ${accounts.length}`);
accounts.forEach(acc => {
  console.log(`  • ${acc.email}: ₹${acc.totalPayments}`);
});

// Calculate totals
const totalFromInvoices = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
const totalFromAccounts = accounts.reduce((sum, acc) => sum + (acc.totalPayments || 0), 0);

console.log(`\n📊 MISMATCH CHECK:`);
console.log(`  Sum of Invoice paidAmount: ₹${totalFromInvoices}`);
console.log(`  Sum of Account totalPayments: ₹${totalFromAccounts}`);
console.log(`  Match: ${totalFromInvoices === totalFromAccounts ? '✅ YES' : '❌ NO'}`);

if (totalFromInvoices !== totalFromAccounts) {
  console.log(`  Difference: ₹${Math.abs(totalFromInvoices - totalFromAccounts)}`);
}

await mongoose.disconnect();
