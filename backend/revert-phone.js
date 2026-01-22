import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function revertPhone() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Revert to original accountId
    const phoneUpdate = await PhoneNumber.findOneAndUpdate(
      { phoneNumberId: '1003427786179738' },
      {
        accountId: '2600003'
      },
      { new: true }
    ).select('phoneNumber phoneNumberId accountId isActive');
    
    console.log('✅ Reverted Phone Number:');
    console.log(JSON.stringify(phoneUpdate, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

revertPhone();
