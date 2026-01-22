import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGO_URI = process.env.MONGODB_URI;

async function checkPhones() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check superadmin phones
    console.log('\n🔍 SUPERADMIN PHONES:');
    const superadminPhones = await PhoneNumber.find({ accountId: 'pixels_internal' });
    console.log(`Found: ${superadminPhones.length}`);
    superadminPhones.forEach(phone => {
      console.log(`  - Phone: ${phone.phoneNumberId}`);
      console.log(`    Display: ${phone.displayPhone}`);
      console.log(`    Active: ${phone.isActive}`);
      console.log(`    AccountId type: ${typeof phone.accountId}, value: ${phone.accountId}`);
      console.log(`    WABA: ${phone.wabaId}`);
      console.log(`    Access Token exists: ${!!phone.accessToken}`);
    });

    // Check enromatics phones (as string and ObjectId)
    console.log('\n🔍 ENROMATICS PHONES:');
    const eno = await PhoneNumber.find({ 
      $or: [
        { accountId: 'eno_2600003' },
        { accountId: new mongoose.Types.ObjectId('2600003') }
      ]
    });
    console.log(`Found: ${eno.length}`);
    eno.forEach(phone => {
      console.log(`  - Phone: ${phone.phoneNumberId}`);
      console.log(`    Display: ${phone.displayPhone}`);
      console.log(`    Active: ${phone.isActive}`);
      console.log(`    AccountId type: ${typeof phone.accountId}, value: ${phone.accountId}`);
      console.log(`    WABA: ${phone.wabaId}`);
      console.log(`    Access Token exists: ${!!phone.accessToken}`);
    });

    // Test getPhoneConfig simulation
    console.log('\n🧪 TESTING QUERY:');
    const testSuperadmin = await PhoneNumber.findOne({
      accountId: 'pixels_internal',
      phoneNumberId: '889344924259692',
      isActive: true
    });
    console.log(`Query for superadmin: ${testSuperadmin ? '✅ FOUND' : '❌ NOT FOUND'}`);

    const testEnromatics = await PhoneNumber.findOne({
      accountId: 'eno_2600003',
      phoneNumberId: '1003427786179738',
      isActive: true
    });
    console.log(`Query for Enromatics: ${testEnromatics ? '✅ FOUND' : '❌ NOT FOUND'}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPhones();
