import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';

async function checkEnromaticsWABA() {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find Enromatics account
    console.log('🔍 Finding Enromatics account...');
    const enromatics = await Account.findOne({ email: 'info@enromatics.com' });

    if (!enromatics) {
      console.log('❌ Enromatics account not found');
      process.exit(1);
    }

    console.log('✅ Found Enromatics Account:');
    console.log('  Name:', enromatics.name);
    console.log('  Email:', enromatics.email);
    console.log('  Account ID:', enromatics.accountId);
    console.log('  Type:', enromatics.type);
    console.log('  _id:', enromatics._id);

    // Check for connected phone numbers/WABAs
    console.log('\n📱 Checking connected WABA...');
    
    // Query by accountId (string)
    const phonesByAccountId = await PhoneNumber.find({ accountId: enromatics.accountId });
    console.log('  Phones by accountId (string):', phonesByAccountId.length);

    // Query by _id (ObjectId)
    const phonesByObjectId = await PhoneNumber.find({ accountId: enromatics._id.toString() });
    console.log('  Phones by accountId (_id as string):', phonesByObjectId.length);

    // Get all to check structure
    const allPhones = await PhoneNumber.find({ accountId: { $in: [enromatics.accountId, enromatics._id.toString(), enromatics._id] } });
    
    console.log('\n' + '='.repeat(60));
    if (allPhones.length === 0) {
      console.log('❌ NO WABA CONNECTED');
      console.log('='.repeat(60));
      console.log('\n⚠️ Enromatics needs to add a WhatsApp Business Account!');
      console.log('\nTo add WABA:');
      console.log('1. Go to Settings > WhatsApp Setup');
      console.log('2. Enter Phone Number ID: 1003427786179738');
      console.log('3. Enter WABA ID: 1536545574042607');
      console.log('4. Enter Access Token: (from Meta Dashboard)');
      console.log('5. Click "Add Phone Number"');
    } else {
      console.log('✅ WABA CONNECTED');
      console.log('='.repeat(60));
      console.log('\n📊 Connected Phone Numbers:');
      allPhones.forEach((phone, index) => {
        console.log(`\n  Phone ${index + 1}:`);
        console.log('    Phone Number:', phone.displayPhone || phone.phone || 'N/A');
        console.log('    Phone Number ID:', phone.phoneNumberId);
        console.log('    WABA ID:', phone.wabaId);
        console.log('    Display Name:', phone.displayName);
        console.log('    Active:', phone.isActive ? '✅ Yes' : '❌ No');
        console.log('    Created:', phone.createdAt?.toLocaleDateString());
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkEnromaticsWABA();
