import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const schema = new mongoose.Schema({}, { strict: false });
const Account = mongoose.model('Account', schema);
const Phone = mongoose.model('PhoneNumber', schema);

async function checkPhoneNumbers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('\n📱 PHONE NUMBERS STATUS\n');

    // Get superadmin
    const superAdmin = await Account.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    console.log('Superadmin Account:');
    console.log(`  ID: ${superAdmin?._id}`);
    console.log(`  Email: ${superAdmin?.email}`);
    console.log('');

    // Get all phones
    console.log('All Phone Numbers:');
    const allPhones = await Phone.find({});
    allPhones.forEach((p, i) => {
      console.log(`  ${i + 1}. ID: ${p.phoneNumberId}`);
      console.log(`     Account: ${p.accountId}`);
      console.log(`     Name: ${p.displayName}`);
      console.log(`     Phone: ${p.phone || 'NOT SET'}`);
      console.log(`     Active: ${p.isActive}`);
      console.log('');
    });

    // Check phones for superadmin
    if (superAdmin) {
      console.log('Phones for Superadmin Account:');
      const adminPhones = await Phone.find({ accountId: superAdmin._id.toString() });
      if (adminPhones.length === 0) {
        console.log('  ❌ NO PHONES FOUND');
      } else {
        adminPhones.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.phoneNumberId} - ${p.displayName} (${p.phone})`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPhoneNumbers();
