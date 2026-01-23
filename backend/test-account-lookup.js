import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';

dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const accountId = '6971e3a706837a5539992bee';
    
    console.log('\n🔍 ACCOUNT LOOKUP TEST\n');
    console.log(`Looking for account with _id: ${accountId}\n`);
    
    const acc1 = await Account.findById(accountId);
    console.log('findById result:', !!acc1 ? '✅ Found' : '❌ Not found');
    if (acc1) {
      console.log('  _id:', acc1._id);
      console.log('  email:', acc1.email);
      console.log('  accountId field:', acc1.accountId);
    }
    
    console.log('\nLooking for account with accountId field:', accountId);
    const acc2 = await Account.findOne({ accountId });
    console.log('findOne({accountId}) result:', !!acc2 ? '✅ Found' : '❌ Not found');
    if (acc2) {
      console.log('  _id:', acc2._id);
      console.log('  email:', acc2.email);
    }
    
  } finally {
    await mongoose.connection.close();
  }
}

test();
