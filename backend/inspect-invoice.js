import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const inv = await db.collection('invoices').findOne({});
    console.log('Raw Invoice Document:');
    console.log(JSON.stringify(inv, null, 2));
    console.log('\naccountId type:', typeof inv.accountId);
    console.log('accountId value:', inv.accountId);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

inspect();
