import mongoose from 'mongoose';

await mongoose.connect('mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp');

const db = mongoose.connection.db;

// Find Enromatics account
const enromatics = await db.collection('accounts').findOne({ email: { $regex: 'eno' } });
if (enromatics) {
  console.log('\n✅ Found Enromatics:');
  console.log(`  _id: ${enromatics._id}`);
  console.log(`  _id type: ${enromatics._id.constructor.name}`);
  console.log(`  Email: ${enromatics.email}`);
  console.log(`  totalPayments: ₹${enromatics.totalPayments}`);
} else {
  console.log('\n❌ Enromatics not found by email');
  // Get all accounts
  const all = await db.collection('accounts').find({}).toArray();
  console.log(`\nAll accounts (${all.length}):`);
  all.forEach(acc => {
    console.log(`  ${acc._id} (${acc._id.constructor.name}) - ${acc.email}`);
  });
}

await mongoose.disconnect();
