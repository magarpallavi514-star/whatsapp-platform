import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Broadcast from './src/models/Broadcast.js';

dotenv.config();

async function checkSuperadminSetup() {
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

    console.log('👑 SUPERADMIN DETAILED CHECK');
    console.log('='.repeat(60));
    console.log('Account:', superadmin.email);
    console.log('Account ID:', superadmin.accountId);

    // Check phone numbers
    const phones = await PhoneNumber.find({ 
      accountId: { $in: [superadmin.accountId, superadmin._id.toString()] } 
    });
    
    console.log('\n📱 Phone Numbers (WABA):', phones.length);
    phones.forEach((p, i) => {
      console.log(`  ${i+1}. ${p.displayName} (${p.phoneNumberId}) - Active: ${p.isActive}`);
    });

    // Check broadcasts
    const broadcasts = await Broadcast.find({ 
      accountId: superadmin.accountId 
    }).limit(5);
    
    console.log('\n📢 Broadcasts Created:', broadcasts.length);
    broadcasts.forEach((b, i) => {
      console.log(`  ${i+1}. ${b.name} (Status: ${b.status})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n❓ KEY QUESTION:');
    if (broadcasts.length > 0 && phones.length === 0) {
      console.log('⚠️ Broadcasts exist BUT no WABA connected!');
      console.log('\nThis means either:');
      console.log('1. Default WABA from .env was used to create them');
      console.log('2. WABA was deleted but broadcasts remain');
      console.log('3. Broadcasts use shared/default credentials\n');
    } else if (phones.length > 0 && broadcasts.length > 0) {
      console.log('✅ Both WABA and Broadcasts exist - Normal setup');
    } else if (phones.length === 0 && broadcasts.length === 0) {
      console.log('⚠️ No WABA and no Broadcasts - Clean state');
    }

    console.log('='.repeat(60) + '\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkSuperadminSetup();
