import mongoose from 'mongoose';
import User from './src/models/User.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function checkUserPhones() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Get both users
    const superAdmin = await User.findOne({ email: 'mpiyush2727@gmail.com' }).select('email name phone accountId');
    const enromatics = await User.findOne({ email: 'info@enromatics.com' }).select('email name phone accountId');
    
    console.log('=== SUPERADMIN (mpiyush2727@gmail.com) ===');
    console.log(JSON.stringify(superAdmin, null, 2));
    
    console.log('\n=== ENROMATICS (info@enromatics.com) ===');
    console.log(JSON.stringify(enromatics, null, 2));
    
    // Get all phone numbers
    console.log('\n=== ALL PHONE NUMBERS IN SYSTEM ===');
    const phones = await PhoneNumber.find().select('phoneNumber displayPhoneNumber phoneNumberId accountId isActive');
    console.log(JSON.stringify(phones, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUserPhones();
