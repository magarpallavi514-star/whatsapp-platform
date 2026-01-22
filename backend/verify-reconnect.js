import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function verify() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('=== VERIFYING ENROMATICS PHONE CONNECTION ===\n');
    
    // Check phone in our DB
    const phone = await PhoneNumber.findOne({ 
      phoneNumberId: '1003427786179738' 
    }).select('phoneNumber displayPhoneNumber phoneNumberId accountId isActive wabaPhoneNumberId');
    
    console.log('📱 Phone in DB:');
    if (phone) {
      console.log(JSON.stringify(phone, null, 2));
    } else {
      console.log('❌ Phone not found in DB!');
    }
    
    // Check Enromatics account
    const account = await Account.findOne({ _id: '2600003' });
    
    console.log('\n👤 Enromatics Account:');
    if (account) {
      console.log('   ID:', account._id);
      console.log('   Name:', account.name);
      console.log('   Email:', account.email);
    } else {
      console.log('❌ Account not found!');
    }
    
    console.log('\n✅ VERIFICATION STATUS:');
    if (phone && account) {
      if (phone.accountId === '2600003') {
        console.log('   ✅ Phone is linked to correct account!');
        console.log('   ✅ Ready to receive messages!');
      } else {
        console.log('   ❌ Phone linked to wrong account:', phone.accountId);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verify();
