import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function createEnromaticsAccount() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Use the superadmin account but link to enromatics
    const superAdminId = '695a15a5c526dbe7c085ece2';
    
    // Just update the phone number to point to superadmin account
    // This allows superadmin to receive messages from enromatics phone
    const phoneUpdate = await PhoneNumber.findOneAndUpdate(
      { phoneNumberId: '1003427786179738' },
      {
        accountId: superAdminId,
        phoneNumber: '+918087131777',
        displayPhoneNumber: '+918087131777',
        isActive: true
      },
      { new: true }
    ).select('phoneNumber phoneNumberId accountId isActive');
    
    console.log('✅ Updated PhoneNumber record:');
    console.log(JSON.stringify(phoneUpdate, null, 2));
    
    console.log('\n⚠️  Note: This phone is now linked to the superadmin account');
    console.log('   Enromatics user can still login and access their own data via accountId check in UI');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createEnromaticsAccount();
