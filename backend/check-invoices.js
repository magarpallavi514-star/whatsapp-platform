import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './src/models/Invoice.js';
import User from './src/models/User.js';

dotenv.config();

const checkInvoices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({});
    console.log(`📊 Found ${users.length} users\n`);

    for (const user of users) {
      console.log(`👤 ${user.name} (${user.email})`);
      console.log(`   Account ID: ${user.accountId}`);
      
      const invoices = await Invoice.find({ accountId: user.accountId });
      console.log(`   📄 Invoices: ${invoices.length}\n`);

      invoices.forEach((inv, idx) => {
        console.log(`      ${idx + 1}. ${inv.invoiceNumber}`);
        console.log(`         Amount: ₹${inv.totalAmount}`);
        console.log(`         Status: ${inv.status}`);
        console.log(`         Date: ${new Date(inv.invoiceDate).toLocaleDateString()}\n`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkInvoices();
