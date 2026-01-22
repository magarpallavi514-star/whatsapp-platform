import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import crypto from 'crypto';

dotenv.config();

async function createSuperadminWABA() {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find superadmin
    const superadmin = await Account.findOne({ email: 'mpiyush2727@gmail.com' });
    
    if (!superadmin) {
      console.log('❌ Superadmin not found');
      process.exit(1);
    }

    console.log('👑 CREATING DEFAULT WABA FOR SUPERADMIN');
    console.log('='.repeat(60));
    console.log('Account:', superadmin.email);
    console.log('Account ID:', superadmin.accountId);

    // Check if already exists
    const existingPhone = await PhoneNumber.findOne({
      accountId: superadmin.accountId,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID
    });

    if (existingPhone) {
      console.log('\n⚠️ Default WABA already exists for superadmin');
      console.log('Phone Number ID:', existingPhone.phoneNumberId);
      console.log('Display Name:', existingPhone.displayName);
      console.log('Active:', existingPhone.isActive ? '✅' : '❌');
      
      if (!existingPhone.isActive) {
        console.log('\n🔄 Activating existing WABA...');
        existingPhone.isActive = true;
        await existingPhone.save();
        console.log('✅ WABA activated');
      }
      
      process.exit(0);
    }

    // Create new WABA from .env
    console.log('\n📱 Creating new WABA from .env credentials...');
    
    const phone = new PhoneNumber({
      accountId: superadmin.accountId,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      displayName: 'Default WABA (Environment)',
      displayPhone: 'Default Phone',
      phone: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      isActive: true,
      verifiedAt: new Date(),
      createdAt: new Date(),
      metadata: {
        source: 'environment',
        createdBy: 'system',
        purpose: 'default_superadmin_waba'
      }
    });

    await phone.save();

    console.log('\n✅ SUCCESS - Default WABA created for superadmin!');
    console.log('='.repeat(60));
    console.log('Phone Number ID:', phone.phoneNumberId);
    console.log('WABA ID:', phone.wabaId);
    console.log('Display Name:', phone.displayName);
    console.log('Status: Active ✅');
    console.log('\nSuperadmin can now:');
    console.log('1. ✅ Create broadcasts immediately');
    console.log('2. ✅ Fetch templates');
    console.log('3. ✅ Use live chat');
    console.log('4. ✅ Add more WABAs via Settings if needed');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createSuperadminWABA();
