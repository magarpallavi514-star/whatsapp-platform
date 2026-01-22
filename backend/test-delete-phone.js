import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function testDelete() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('=== TESTING DELETE PHONE NUMBER ===\n');
    
    // Get all phones first
    const phones = await PhoneNumber.find().select('_id phoneNumber accountId phoneNumberId isActive');
    
    console.log('📱 All Phone Numbers:');
    phones.forEach((p, i) => {
      console.log(`${i + 1}. ID: ${p._id}`);
      console.log(`   Phone: ${p.phoneNumber}`);
      console.log(`   Account: ${p.accountId}`);
      console.log(`   Active: ${p.isActive}`);
    });
    
    // Test if we can delete one
    if (phones.length > 0) {
      const testPhone = phones[0];
      console.log(`\n🗑️  Testing delete for: ${testPhone.phoneNumber}`);
      
      if (testPhone.isActive && phones.length === 1) {
        console.log('❌ Cannot delete - it\'s the only active phone!');
      } else {
        const result = await PhoneNumber.deleteOne({ _id: testPhone._id });
        if (result.deletedCount > 0) {
          console.log('✅ Delete successful!');
        } else {
          console.log('❌ Delete failed - document not found');
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testDelete();
