import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Invoice from './src/models/Invoice.js';

dotenv.config();

const fixInvoiceAccountIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({});
    console.log(`�� Found ${users.length} users\n`);

    let totalUpdated = 0;

    for (const user of users) {
      const userId = user._id.toString();
      const newAccountId = user.accountId;

      console.log(`👤 ${user.name}`);
      console.log(`   MongoDB User ID: ${userId}`);
      console.log(`   New Account ID: ${newAccountId}`);

      // Find invoices with OLD MongoDB ObjectId (as string)
      const invoices = await Invoice.findOneAndUpdate(
        { accountId: userId },
        { accountId: newAccountId },
        { new: true }
      );

      if (invoices) {
        console.log(`   ✅ Updated 1 invoice\n`);
        totalUpdated++;
      } else {
        console.log(`   ℹ️  No invoices to update\n`);
      }
    }

    console.log(`\n✅ Total invoices fixed: ${totalUpdated}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixInvoiceAccountIds();
