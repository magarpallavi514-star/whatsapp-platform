import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// PhoneNumber Schema
const phoneNumberSchema = new mongoose.Schema({
  phoneNumber: String,
  displayPhoneNumber: String,
  phoneNumberId: String,
  accountId: String,
  isActive: Boolean,
  wabaId: String,
  accessToken: String,
  createdAt: { type: Date, default: Date.now }
});

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

async function checkPhones() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📱 Checking Phone Numbers Status\n');

    const phones = await PhoneNumber.find({
      phoneNumberId: { $in: ['889344924259692', '1003427786179738'] }
    });

    console.log(`Found ${phones.length} phone numbers:\n`);

    for (const phone of phones) {
      console.log(`Phone: ${phone.phoneNumber || 'N/A'}`);
      console.log(`  Phone ID: ${phone.phoneNumberId}`);
      console.log(`  Account: ${phone.accountId}`);
      console.log(`  Active: ${phone.isActive ? '✅ YES' : '❌ NO'}`);
      console.log(`  WABA ID: ${phone.wabaId || 'N/A'}`);
      console.log('');
    }

    // Activate both if needed
    const superadmin = phones.find(p => p.phoneNumberId === '889344924259692');
    const enromatics = phones.find(p => p.phoneNumberId === '1003427786179738');

    if (superadmin && !superadmin.isActive) {
      console.log('🔄 Activating SUPERADMIN phone...');
      await PhoneNumber.updateOne(
        { phoneNumberId: '889344924259692' },
        { isActive: true }
      );
      console.log('✅ SUPERADMIN activated');
    }

    if (enromatics && !enromatics.isActive) {
      console.log('🔄 Activating ENROMATICS phone...');
      await PhoneNumber.updateOne(
        { phoneNumberId: '1003427786179738' },
        { isActive: true }
      );
      console.log('✅ ENROMATICS activated');
    }

    console.log('\n📊 Final Status:');
    const updated = await PhoneNumber.find({
      phoneNumberId: { $in: ['889344924259692', '1003427786179738'] }
    });

    for (const phone of updated) {
      const name = phone.phoneNumberId === '889344924259692' ? 'SUPERADMIN' : 'ENROMATICS';
      console.log(`${name}: ${phone.isActive ? '✅ ACTIVE' : '❌ INACTIVE'}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPhones();
