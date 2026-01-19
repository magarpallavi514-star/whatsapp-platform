/**
 * Debug script to check account and phone number sync
 * Run: node check-account-sync.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const Account = mongoose.model('Account', new mongoose.Schema({}, { strict: false }));
const PhoneNumber = mongoose.model('PhoneNumber', new mongoose.Schema({}, { strict: false }));

async function checkSync() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find superadmin account
    console.log('\n📊 Looking for superadmin account...');
    const account = await Account.findOne({ email: 'mpiyush2727@gmail.com' });
    
    if (!account) {
      console.log('❌ Superadmin account NOT found');
      console.log('   Email: mpiyush2727@gmail.com');
      console.log('\n   Available accounts:');
      const allAccounts = await Account.find().limit(5);
      allAccounts.forEach(acc => {
        console.log(`   - ${acc.email || acc.accountId} (${acc._id})`);
      });
    } else {
      console.log('✅ Superadmin account found');
      console.log('   AccountId:', account._id || account.accountId);
      console.log('   Email:', account.email);
      console.log('   Name:', account.name);
      console.log('   Type:', account.type);
      console.log('   Status:', account.status);
    }

    // Check phone numbers
    console.log('\n📱 Checking WhatsApp phone numbers...');
    const accountId = account?._id?.toString() || account?.accountId || 'pixels_internal';
    const phoneNumbers = await PhoneNumber.find({ accountId });
    
    if (phoneNumbers.length === 0) {
      console.log('❌ NO phone numbers connected to this account');
      console.log('   AccountId searched:', accountId);
      console.log('\n   Checking ALL phone numbers in database:');
      const allPhones = await PhoneNumber.find().select('accountId displayPhone displayName').limit(10);
      allPhones.forEach(phone => {
        console.log(`   - ${phone.displayPhone} (${phone.displayName}) → AccountId: ${phone.accountId}`);
      });
    } else {
      console.log(`✅ Found ${phoneNumbers.length} phone number(s):`);
      phoneNumbers.forEach((phone, idx) => {
        console.log(`\n   [${idx + 1}] ${phone.displayPhone} (${phone.displayName})`);
        console.log(`       PhoneNumberId: ${phone.phoneNumberId}`);
        console.log(`       WABA Id: ${phone.wabaId}`);
        console.log(`       Active: ${phone.isActive}`);
        console.log(`       Status: ${phone.verifiedAt ? '✅ Verified' : '⏳ Pending'}`);
      });
    }

    console.log('\n✅ Check complete\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkSync();
