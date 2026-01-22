import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

async function fixEnromaticsWABA() {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find Enromatics by email
    const enromatics = await Account.findOne({ email: 'info@enromatics.com' });
    
    if (!enromatics) {
      console.log('❌ Enromatics not found');
      process.exit(1);
    }

    console.log('👤 ENROMATICS ACCOUNT INFO');
    console.log('='.repeat(60));
    console.log('Email:', enromatics.email);
    console.log('Name:', enromatics.name);
    console.log('_id (MongoDB):', enromatics._id);
    console.log('accountId (String):', enromatics.accountId);

    // Find the WABA
    const waba = await PhoneNumber.findOne({ 
      phoneNumberId: '1003427786179738'
    });

    if (!waba) {
      console.log('\n❌ WABA not found');
      process.exit(1);
    }

    console.log('\n📱 WABA INFO');
    console.log('='.repeat(60));
    console.log('Phone ID:', waba.phoneNumberId);
    console.log('Stored accountId:', waba.accountId);
    console.log('Display Name:', waba.displayName);
    console.log('Active:', waba.isActive);

    console.log('\n🔧 FIXING MISMATCH');
    console.log('='.repeat(60));
    console.log('Updating WABA accountId from:');
    console.log('  OLD:', waba.accountId);
    console.log('  NEW:', enromatics.accountId);

    // Update the WABA with correct accountId
    await PhoneNumber.updateOne(
      { _id: waba._id },
      { accountId: enromatics.accountId }
    );

    console.log('\n✅ SUCCESS - WABA accountId fixed!');
    console.log('='.repeat(60));
    console.log('\nEnromatics can now:');
    console.log('1. ✅ View connected WABA in Settings');
    console.log('2. ✅ Create broadcasts');
    console.log('3. ✅ Use live chat');
    console.log('4. ✅ Send messages');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixEnromaticsWABA();
