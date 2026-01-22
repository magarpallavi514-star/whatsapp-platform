import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function checkPhoneNumbers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Get all phone numbers
    const phoneNumbers = await PhoneNumber.find().select('phoneNumber displayPhoneNumber phoneNumberId accountId isActive');
    console.log('=== ALL PHONE NUMBERS IN SYSTEM ===');
    console.log(JSON.stringify(phoneNumbers, null, 2));
    
    // Get all accounts
    const accounts = await Account.find().select('_id name email');
    console.log('\n=== ALL ACCOUNTS ===');
    console.log(JSON.stringify(accounts, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPhoneNumbers();
