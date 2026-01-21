import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fix = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected\n');

    // Convert ObjectIds to 7-digit string IDs
    const updates = [
      {
        oldId: new mongoose.Types.ObjectId('696f777a00e179c6f43f83f4'),
        newId: '2600001'
      },
      {
        oldId: new mongoose.Types.ObjectId('696f77cd00e179c6f43f8406'),
        newId: '2600002'
      }
    ];

    console.log('📄 BEFORE:\n');
    let invoices = await db.collection('invoices').find({}).toArray();
    invoices.forEach(inv => {
      console.log(`${inv.invoiceNumber}: accountId = ${inv.accountId} (type: ${typeof inv.accountId})`);
    });

    console.log('\n🔧 UPDATING...\n');

    for (const update of updates) {
      const result = await db.collection('invoices').updateMany(
        { accountId: update.oldId },
        { $set: { accountId: update.newId } }
      );
      console.log(`✅ Updated ${result.modifiedCount} invoice(s)`);
      console.log(`   ${update.oldId} → ${update.newId}\n`);
    }

    console.log('📄 AFTER:\n');
    invoices = await db.collection('invoices').find({}).toArray();
    invoices.forEach(inv => {
      console.log(`${inv.invoiceNumber}: accountId = ${inv.accountId} (type: ${typeof inv.accountId})`);
    });

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fix();
