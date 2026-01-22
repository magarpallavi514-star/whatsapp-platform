import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function activate() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('🔌 Activating Enromatics phone...\n');
    
    const result = await PhoneNumber.findOneAndUpdate(
      { phoneNumberId: '1003427786179738' },
      { 
        isActive: true,
        phoneNumber: '+918087131777',
        displayPhoneNumber: '+918087131777'
      },
      { new: true }
    ).select('phoneNumber displayPhoneNumber phoneNumberId accountId isActive');
    
    console.log('✅ Phone activated!');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

activate();
