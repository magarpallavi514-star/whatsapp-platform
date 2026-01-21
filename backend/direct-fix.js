import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const directFix = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB\n');

    // Direct update in invoices collection
    console.log('📄 INVOICES BEFORE:\n');
    let invoices = await db.collection('invoices').find({}).toArray();
    invoices.forEach(inv => {
      console.log(`${inv.invoiceNumber}: accountId = ${inv.accountId}`);
    });

    console.log('\n🔧 UPDATING...\n');

    // Update directly in MongoDB
    await db.collection('invoices').updateMany(
      { accountId: '696f777a00e179c6f43f83f4' },
      { $set: { accountId: '2600001' } }
    );

    await db.collection('invoices').updateMany(
      { accountId: '696f77cd00e179c6f43f8406' },
      { $set: { accountId: '2600002' } }
    );

    console.log('📄 INVOICES AFTER:\n');
    invoices = await db.collection('invoices').find({}).toArray();
    invoices.forEach(inv => {
      console.log(`${inv.invoiceNumber}: accountId = ${inv.accountId}`);
    });

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

directFix();
