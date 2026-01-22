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

async function setupPhones() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📱 Setting up both phone numbers\n');

    // Check if superadmin exists
    const superadmin = await PhoneNumber.findOne({ phoneNumberId: '889344924259692' });

    if (!superadmin) {
      console.log('🔄 Creating SUPERADMIN phone...');
      await PhoneNumber.create({
        phoneNumber: '+919766504856',
        displayPhoneNumber: '+91 97665 04856',
        phoneNumberId: '889344924259692',
        accountId: 'pixels_internal',
        isActive: true,
        wabaId: '1536545574042607',
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN
      });
      console.log('✅ SUPERADMIN phone created and ACTIVE');
    } else {
      console.log('✅ SUPERADMIN phone already exists');
      if (!superadmin.isActive) {
        await PhoneNumber.updateOne(
          { phoneNumberId: '889344924259692' },
          { isActive: true }
        );
        console.log('✅ SUPERADMIN activated');
      }
    }

    // Check enromatics
    const enromatics = await PhoneNumber.findOne({ phoneNumberId: '1003427786179738' });
    if (enromatics) {
      if (!enromatics.isActive) {
        await PhoneNumber.updateOne(
          { phoneNumberId: '1003427786179738' },
          { isActive: true }
        );
        console.log('✅ ENROMATICS activated');
      } else {
        console.log('✅ ENROMATICS already active');
      }
    }

    console.log('\n📊 Final Status:');
    const all = await PhoneNumber.find({
      phoneNumberId: { $in: ['889344924259692', '1003427786179738'] }
    });

    for (const phone of all) {
      const name = phone.phoneNumberId === '889344924259692' ? 'SUPERADMIN' : 'ENROMATICS';
      const status = phone.isActive ? '✅ ACTIVE' : '❌ INACTIVE';
      console.log(`${name}: ${status} (Account: ${phone.accountId})`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Phone setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupPhones();
