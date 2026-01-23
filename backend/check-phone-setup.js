import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPhone() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const phone = await PhoneNumber.findOne({ phoneNumberId: '1003427786179738' });
    
    if (!phone) {
      console.log('❌ Phone not found in database');
      process.exit(1);
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('📱 PHONE CONFIGURATION');
    console.log('═'.repeat(60));
    console.log('\n✅ Phone found:');
    console.log('  phoneNumberId:', phone.phoneNumberId);
    console.log('  accountId:', phone.accountId);
    console.log('  accountId type:', typeof phone.accountId);
    console.log('  isActive:', phone.isActive);
    console.log('  displayPhone:', phone.displayPhone);
    console.log('  wabaId:', phone.wabaId);
    
    console.log('\n' + '═'.repeat(60));
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkPhone();
