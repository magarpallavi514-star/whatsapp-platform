import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Invoice from './src/models/Invoice.js';

dotenv.config();

const debugIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('👥 USERS:\n');

    const users = await User.find({});
    users.forEach(u => {
      console.log(`Name: ${u.name}`);
      console.log(`  _id: ${u._id} (${u._id.toString()})`);
      console.log(`  accountId: ${u.accountId}\n`);
    });

    console.log('📄 INVOICES:\n');
    const invoices = await Invoice.find({});
    invoices.forEach(inv => {
      console.log(`Invoice: ${inv.invoiceNumber}`);
      console.log(`  accountId: ${inv.accountId}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

debugIds();
