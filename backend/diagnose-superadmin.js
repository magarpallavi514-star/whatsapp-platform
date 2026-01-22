import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Phone Schema
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

async function diagnoseSuperadmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔍 Diagnosing Superadmin WABA\n');

    // Check Superadmin phone
    const superadminPhone = await PhoneNumber.findOne({
      phoneNumberId: '889344924259692'
    });

    console.log('='.repeat(60));
    console.log('📱 SUPERADMIN PHONE CONFIGURATION');
    console.log('='.repeat(60));

    if (!superadminPhone) {
      console.log('❌ SUPERADMIN PHONE NOT FOUND IN DATABASE!');
      console.log('\nExpected:');
      console.log('  Phone ID: 889344924259692');
      console.log('  Phone Number: +919766504856');
      console.log('  Account ID: pixels_internal');
      console.log('  Status: Should be ACTIVE');
      console.log('\nThis is the PROBLEM! The phone needs to be in the database.');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✅ Found Superadmin Phone\n');
    console.log('Phone Number:', superadminPhone.phoneNumber || 'NOT SET');
    console.log('Display Number:', superadminPhone.displayPhoneNumber);
    console.log('Phone ID:', superadminPhone.phoneNumberId);
    console.log('Account ID:', superadminPhone.accountId);
    console.log('Status:', superadminPhone.isActive ? '✅ ACTIVE' : '❌ INACTIVE');
    console.log('WABA ID:', superadminPhone.wabaId);
    console.log('Token stored:', superadminPhone.accessToken ? '✅ YES' : '❌ NO');

    console.log('\n' + '='.repeat(60));
    console.log('🔍 CHECKING CONFIGURATION');
    console.log('='.repeat(60));

    // Check issues
    const issues = [];

    if (superadminPhone.accountId !== 'pixels_internal') {
      issues.push(`❌ Wrong Account ID: "${superadminPhone.accountId}" (should be "pixels_internal")`);
    } else {
      console.log('✅ Account ID is correct (pixels_internal)');
    }

    if (!superadminPhone.isActive) {
      issues.push('❌ Phone is INACTIVE (should be ACTIVE)');
    } else {
      console.log('✅ Phone is ACTIVE');
    }

    if (!superadminPhone.phoneNumber) {
      issues.push('⚠️  Phone number field is empty (data issue, but not critical)');
    } else {
      console.log('✅ Phone number is stored:', superadminPhone.phoneNumber);
    }

    if (issues.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      issues.forEach(issue => console.log('  ' + issue));
    } else {
      console.log('\n✅ NO CONFIGURATION ISSUES!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🌐 WEBHOOK ROUTING TEST');
    console.log('='.repeat(60));
    
    // Simulate webhook lookup
    const phoneFromWebhook = await PhoneNumber.findOne({
      phoneNumberId: '889344924259692'
    });

    if (phoneFromWebhook) {
      console.log('✅ Webhook would find this phone');
      console.log(`✅ Would route to account: ${phoneFromWebhook.accountId}`);
    } else {
      console.log('❌ Webhook would NOT find this phone - CRITICAL!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 BOTH PHONES SUMMARY');
    console.log('='.repeat(60));

    const allPhones = await PhoneNumber.find({
      phoneNumberId: { $in: ['889344924259692', '1003427786179738'] }
    });

    for (const phone of allPhones) {
      const name = phone.phoneNumberId === '889344924259692' ? '🔴 SUPERADMIN' : '🟦 ENROMATICS';
      const status = phone.isActive ? '✅' : '❌';
      console.log(`${name}: ${status} (Account: ${phone.accountId})`);
    }

    if (allPhones.length < 2) {
      console.log('\n⚠️  WARNING: Only found', allPhones.length, 'phone(s). Both should exist!');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

diagnoseSuperadmin();
