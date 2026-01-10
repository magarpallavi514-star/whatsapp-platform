import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const phoneNumberSchema = new mongoose.Schema({}, { strict: false });
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

async function checkPhoneConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const phones = await PhoneNumber.find({}).limit(5);
    
    console.log('\n📱 Phone Number Configurations:\n');
    if (phones.length === 0) {
      console.log('❌ No phone numbers configured!');
    } else {
      phones.forEach((p, i) => {
        console.log(`${i + 1}. Phone Number ID: ${p.phoneNumberId}`);
        console.log(`   Account ID: ${p.accountId}`);
        console.log(`   Phone: ${p.phone || 'N/A'}`);
        console.log(`   Active: ${p.isActive}`);
        console.log(`   Created: ${p.createdAt}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPhoneConfig();
