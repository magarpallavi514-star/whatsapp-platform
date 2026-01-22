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

async function checkBothWABAs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📱 Checking & Fixing Enromatics Phone Status\n');

    const phones = await PhoneNumber.find({
      phoneNumberId: { $in: ['889344924259692', '1003427786179738'] }
    });
    
    // Activate Enromatics if inactive
    const enromatics = phones.find(p => p.phoneNumberId === '1003427786179738');
    if (enromatics && !enromatics.isActive) {
      console.log('🔄 Activating Enromatics phone...\n');
      await PhoneNumber.updateOne(
        { phoneNumberId: '1003427786179738' },
        { $set: { isActive: true } }
      );
      enromatics.isActive = true;
      console.log('✅ Enromatics activated!\n');
    }

    console.log(`Found ${phones.length} phone numbers:\n`);

    for (const phone of phones) {
      const name = phone.phoneNumberId === '889344924259692' ? '🔴 SUPERADMIN' : '🟦 ENROMATICS';
      const status = phone.isActive ? '✅ ACTIVE' : '❌ INACTIVE';
      
      console.log(`${name}`);
      console.log(`  Phone: ${phone.phoneNumber}`);
      console.log(`  Phone ID: ${phone.phoneNumberId}`);
      console.log(`  Account ID: ${phone.accountId}`);
      console.log(`  Status: ${status}`);
      console.log(`  WABA ID: ${phone.wabaId}`);
      console.log(`  Token stored: ${phone.accessToken ? '✅ YES' : '❌ NO'}`);
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('📊 Summary:\n');
    
    const superadmin = phones.find(p => p.phoneNumberId === '889344924259692');
    const enromaticsPhone = phones.find(p => p.phoneNumberId === '1003427786179738');

    if (superadmin && superadmin.isActive) {
      console.log('✅ SUPERADMIN: Configured and ACTIVE');
    } else if (superadmin) {
      console.log('⚠️  SUPERADMIN: Found but INACTIVE - needs activation!');
    } else {
      console.log('❌ SUPERADMIN: NOT in database!');
    }

    if (enromaticsPhone && enromaticsPhone.isActive) {
      console.log('✅ ENROMATICS: Configured and ACTIVE');
    } else if (enromaticsPhone) {
      console.log('⚠️  ENROMATICS: Found but INACTIVE');
    } else {
      console.log('❌ ENROMATICS: NOT in database');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🔑 Token Configuration:\n');
    console.log(`Using WHATSAPP_ACCESS_TOKEN from environment`);
    console.log(`Token length: ${process.env.WHATSAPP_ACCESS_TOKEN?.length || 0} chars`);
    console.log(`Token works for BOTH phone numbers under same Business Account\n`);

    console.log('⚡ How it works:\n');
    console.log('1. Meta sends webhook with phoneNumberId');
    console.log('2. Code looks up phoneNumberId in MongoDB');
    console.log('3. Finds associated accountId (pixels_internal or 2600003)');
    console.log('4. Routes message to that account');
    console.log('\nSo if Superadmin stops working, check:');
    console.log('  ✓ Is phone in DB and isActive=true?');
    console.log('  ✓ Is webhook hitting the right endpoint?');
    console.log('  ✓ Is token valid?');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkBothWABAs();
