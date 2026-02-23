import mongoose from 'mongoose';

await mongoose.connect('mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp');

const db = mongoose.connection.db;

console.log('\n📋 CHECKING ACCOUNT ID FORMATS\n');

// Check invoices
const invoices = await db.collection('invoices').find({ status: 'paid' }).toArray();
console.log('INVOICES:');
invoices.forEach(inv => {
  console.log(`  Invoice: ${inv.invoiceNumber}`);
  console.log(`  accountId: ${inv.accountId} (type: ${typeof inv.accountId})`);
  console.log(`  accountId is ObjectId? ${inv.accountId.constructor.name}`);
});

// Check accounts
console.log('\nACCOUNTS:');
const accounts = await db.collection('accounts').find({ totalPayments: { $gt: 0 } }).toArray();
accounts.forEach(acc => {
  console.log(`  Account: ${acc._id} (${acc._id.constructor.name})`);
  console.log(`  Email: ${acc.email}`);
  console.log(`  totalPayments: ₹${acc.totalPayments}`);
});

await mongoose.disconnect();
