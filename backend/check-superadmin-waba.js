import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

async function checkSuperadminWABA() {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find superadmin
    console.log('👑 SUPERADMIN WABA STATUS');
    console.log('='.repeat(60));
    
    const superadmin = await Account.findOne({ email: 'mpiyush2727@gmail.com' });

    if (!superadmin) {
      console.log('❌ Superadmin account not found');
      process.exit(1);
    }

    console.log('✅ Found:', superadmin.email);
    console.log('  Name:', superadmin.name);
    console.log('  Account ID:', superadmin.accountId);

    // Check for connected WABAs
    console.log('\n📱 Checking connected WABA...');
    
    const phones = await PhoneNumber.find({ 
      accountId: { $in: [superadmin.accountId, superadmin._id.toString(), superadmin._id] } 
    });
    
    console.log('='.repeat(60));
    if (phones.length === 0) {
      console.log('❌ NO WABA CONNECTED');
      console.log('='.repeat(60));
      console.log('\n⚠️ Superadmin needs to add a WhatsApp Business Account!');
    } else {
      console.log('✅ WABA CONNECTED');
      console.log('='.repeat(60));
      console.log(`\n📊 ${phones.length} Phone Number(s) Connected:\n`);
      phones.forEach((phone, index) => {
        console.log(`  Phone ${index + 1}:`);
        console.log('    Display Name:', phone.displayName);
        console.log('    Phone Number:', phone.displayPhone || phone.phone || 'N/A');
        console.log('    Phone Number ID:', phone.phoneNumberId);
        console.log('    WABA ID:', phone.wabaId);
        console.log('    Active:', phone.isActive ? '✅ Yes' : '❌ No');
        console.log('');
      });
    }

    console.log('='.repeat(60) + '\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkSuperadminWABA();
