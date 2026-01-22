import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function fixEnromatics() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Find enromatics account
    const enromatics = await Account.findOne({ email: 'info@enromatics.com' });
    
    if (!enromatics) {
      console.log('❌ Enromatics account not found!');
      process.exit(1);
    }
    
    console.log('✅ Found Enromatics account:', enromatics._id);
    console.log('   Email:', enromatics.email);
    console.log('   Name:', enromatics.name);
    
    // Update the phone number to point to correct account
    const result = await PhoneNumber.findOneAndUpdate(
      { phoneNumberId: '1003427786179738' },
      { 
        accountId: enromatics._id.toString(),
        isActive: true
      },
      { new: true }
    ).select('phoneNumber phoneNumberId accountId isActive');
    
    console.log('\n✅ Updated Phone Number:');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixEnromatics();
