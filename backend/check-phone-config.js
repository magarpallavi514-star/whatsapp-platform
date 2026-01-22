import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Schema for PhoneNumber
const phoneNumberSchema = new mongoose.Schema({
  phoneNumberId: String,
  displayName: String,
  displayPhone: String,
  phone: String,
  phoneNumber: String,
  wabaId: String,
  accountId: String,
  isActive: Boolean,
  verifiedAt: Date,
  lastTestedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Schema for Account
const accountSchema = new mongoose.Schema({
  name: String,
  email: String,
  accountId: String,
  type: String,
  createdAt: { type: Date, default: Date.now }
});

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);
const Account = mongoose.model('Account', accountSchema);

async function checkPhoneNumbers() {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find superadmin account
    console.log('🔍 Finding superadmin account...');
    const superadmin = await Account.findOne({ type: 'internal' });

    if (!superadmin) {
      console.log('❌ Superadmin not found');
      process.exit(1);
    }

    console.log('✅ Found Superadmin:');
    console.log('  Name:', superadmin.name);
    console.log('  Email:', superadmin.email);
    console.log('  Account ID:', superadmin.accountId);
    console.log('  Mongo ID:', superadmin._id);

    // Find phone numbers for this account
    console.log('\n📱 Searching for phone numbers...');
    
    // Try searching by string accountId
    console.log('  Searching by accountId (string):', superadmin.accountId);
    const phonesByString = await PhoneNumber.find({ accountId: superadmin.accountId });
    console.log('  Found by string:', phonesByString.length);

    // Try searching by ObjectId
    console.log('  Searching by _id (ObjectId):', superadmin._id);
    const phonesByObjectId = await PhoneNumber.find({ accountId: superadmin._id });
    console.log('  Found by ObjectId:', phonesByObjectId.length);

    // Show all phone numbers
    console.log('\n📋 All Phone Numbers in Database:');
    const allPhones = await PhoneNumber.find({}).lean();
    console.log('Total phones:', allPhones.length);
    
    allPhones.forEach((phone, i) => {
      console.log(`\n${i + 1}. ${phone.displayName}`);
      console.log('   Phone Number:', phone.phone || phone.displayPhone || phone.phoneNumber);
      console.log('   Phone Number ID:', phone.phoneNumberId);
      console.log('   WABA ID:', phone.wabaId);
      console.log('   Account ID:', phone.accountId);
      console.log('   Is Active:', phone.isActive);
      console.log('   Created:', phone.createdAt?.toDateString());
    });

    // Find all accounts and their phones
    console.log('\n\n📊 Account Phone Mapping:');
    const allAccounts = await Account.find({});
    
    for (const account of allAccounts) {
      const phones = await PhoneNumber.find({ accountId: account.accountId });
      console.log(`\n${account.name} (${account.type || 'customer'})`);
      console.log('  Account ID:', account.accountId);
      console.log('  Phone Numbers:', phones.length);
      phones.forEach(p => {
        console.log(`    - ${p.displayName || p.displayPhone} (ID: ${p.phoneNumberId})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPhoneNumbers();
