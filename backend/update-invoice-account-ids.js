import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Invoice from './src/models/Invoice.js';

dotenv.config();

const updateInvoiceAccountIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({});
    console.log(`📊 Found ${users.length} users\n`);

    for (const user of users) {
      const oldId = user._id.toString();
      const newId = user.accountId;

      // Find invoices with old accountId
      const invoices = await Invoice.find({ accountId: oldId });
      
      if (invoices.length > 0) {
        console.log(`🔄 Updating invoices for ${user.name} (${user.email})`);
        console.log(`   Old Account ID: ${oldId}`);
        console.log(`   New Account ID: ${newId}`);
        console.log(`   Found ${invoices.length} invoices\n`);

        // Update all invoices
        await Invoice.updateMany(
          { accountId: oldId },
          { accountId: newId }
        );

        console.log(`   ✅ Updated ${invoices.length} invoices\n`);
      }
    }

    console.log('✅ Invoice accountIds updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateInvoiceAccountIds();
