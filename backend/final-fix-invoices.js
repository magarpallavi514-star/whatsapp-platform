import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './src/models/Invoice.js';

dotenv.config();

const finalFix = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Manual mapping
    const mappings = [
      { oldId: '696f777a00e179c6f43f83f4', newId: '2600001' },
      { oldId: '696f77cd00e179c6f43f8406', newId: '2600002' }
    ];

    console.log('🔧 Fixing invoice account IDs:\n');

    for (const mapping of mappings) {
      const result = await Invoice.updateMany(
        { accountId: mapping.oldId },
        { accountId: mapping.newId }
      );

      console.log(`✅ Updated ${result.modifiedCount} invoice(s)`);
      console.log(`   ${mapping.oldId} → ${mapping.newId}\n`);
    }

    console.log('✅ All invoices fixed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

finalFix();
