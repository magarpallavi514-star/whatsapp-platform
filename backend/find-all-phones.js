import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGO_URI = process.env.MONGODB_URI;

async function findAllPhones() {
  try {
    await mongoose.connect(MONGO_URI);

    const phones = await PhoneNumber.find({});
    console.log(`\n📱 TOTAL PHONES IN DATABASE: ${phones.length}\n`);
    
    phones.forEach(phone => {
      console.log(`Phone Number ID: ${phone.phoneNumberId}`);
      console.log(`  Account ID: ${phone.accountId} (type: ${typeof phone.accountId})`);
      console.log(`  Display: ${phone.displayPhone}`);
      console.log(`  Active: ${phone.isActive}`);
      console.log(`  WABA: ${phone.wabaId}`);
      console.log('');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findAllPhones();
