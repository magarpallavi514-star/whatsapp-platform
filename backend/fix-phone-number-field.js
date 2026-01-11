import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const phoneSchema = new mongoose.Schema({}, { strict: false });
const Phone = mongoose.model('PhoneNumber', phoneSchema);

async function fixPhoneNumber() {
  try {
    console.log('🔧 FIXING PHONE NUMBER FIELD\n');
    await mongoose.connect(process.env.MONGODB_URI);

    const phoneNumberId = '889344924259692';
    const yourPhone = '9766504856'; // Your actual mobile number

    console.log('BEFORE:');
    const before = await Phone.findOne({ phoneNumberId });
    console.log(`  phone field: ${before?.phone || 'MISSING'}`);
    console.log(`  displayPhone: ${before?.displayPhone}`);
    console.log(`  displayName: ${before?.displayName}\n`);

    // Update with actual phone number
    const result = await Phone.updateOne(
      { phoneNumberId },
      { $set: { phone: yourPhone } }
    );

    console.log(`UPDATING: phone field → ${yourPhone}`);
    console.log(`Modified: ${result.modifiedCount}\n`);

    console.log('AFTER:');
    const after = await Phone.findOne({ phoneNumberId });
    console.log(`  phone field: ${after?.phone} ✅`);
    console.log(`  displayPhone: ${after?.displayPhone}`);
    console.log(`  displayName: ${after?.displayName}\n`);

    console.log('✅ PHONE NUMBER FIELD FIXED!\n');
    console.log('Now it should show in Settings page correctly.\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixPhoneNumber();
