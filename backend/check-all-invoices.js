import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './src/models/Invoice.js';

dotenv.config();

const checkAllInvoices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const invoices = await Invoice.find({});
    console.log(`📊 Total invoices in DB: ${invoices.length}\n`);

    invoices.forEach((inv, idx) => {
      console.log(`${idx + 1}. ${inv.invoiceNumber}`);
      console.log(`   Invoice ID: ${inv.invoiceId}`);
      console.log(`   Account ID: ${inv.accountId} (type: ${typeof inv.accountId})`);
      console.log(`   Amount: ₹${inv.totalAmount}`);
      console.log(`   Status: ${inv.status}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAllInvoices();
