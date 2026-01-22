import mongoose from 'mongoose';
import Account from './src/models/Account.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function listAccounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const accounts = await Account.find().select('_id name email createdAt');
    
    console.log('=== ALL ACCOUNTS ===\n');
    accounts.forEach(acc => {
      console.log(`ID: ${acc._id}`);
      console.log(`Name: ${acc.name}`);
      console.log(`Email: ${acc.email}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listAccounts();
