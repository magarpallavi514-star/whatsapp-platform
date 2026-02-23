import mongoose from 'mongoose';

await mongoose.connect('mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp');

const db = mongoose.connection.db;

console.log('\n🔍 FINDING ENROMATICS ACCOUNT\n');

// Search for Enromatics in various ways
let enromatics = await db.collection('accounts').findOne({ email: { $regex: /eno|enromatics/i } });

if (!enromatics) {
  // Try searching in invoices for company name
  const invoice = await db.collection('invoices').findOne({ invoiceNumber: 'INV-2026-ENO-9042' });
  if (invoice) {
    console.log('✅ Found invoice:');
    console.log(`   companyName: ${invoice.companyName}`);
    console.log(`   email: ${invoice.email}`);
    console.log(`   accountId: ${invoice.accountId}`);
    
    // Search for account by email
    enromatics = await db.collection('accounts').findOne({ email: invoice.email });
    if (enromatics) {
      console.log(`\n✅ Found matching account by email`);
      console.log(`   _id: ${enromatics._id}`);
    } else {
      console.log(`\n❌ No account found with email: ${invoice.email}`);
      console.log('\nAll accounts:');
      const all = await db.collection('accounts').find({}).toArray();
      all.forEach(acc => {
        console.log(`  ${acc._id} - ${acc.email}`);
      });
    }
  }
}

if (enromatics) {
  console.log(`\n✅ Found Enromatics Account:`);
  console.log(`   _id: ${enromatics._id}`);
  console.log(`   Email: ${enromatics.email}`);
  console.log(`   Company: ${enromatics.companyName}`);
  console.log(`   totalPayments: ₹${enromatics.totalPayments || 0}`);
  
  // Update invoice with correct accountId
  const result = await db.collection('invoices').updateOne(
    { invoiceNumber: 'INV-2026-ENO-9042' },
    { $set: { accountId: enromatics._id.toString() } }
  );
  
  console.log(`\n✅ Updated invoice accountId to: ${enromatics._id.toString()}`);
  
  // Update account totalPayments
  const updateResult = await db.collection('accounts').updateOne(
    { _id: enromatics._id },
    { $set: { totalPayments: 2499, lastPaymentDate: new Date() } }
  );
  
  console.log(`✅ Updated account totalPayments to ₹2499`);
}

await mongoose.disconnect();
