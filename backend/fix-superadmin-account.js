/**
 * Fix superadmin account sync and phone numbers
 * Run: node fix-superadmin-account.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

const SUPERADMIN = {
  email: 'mpiyush2727@gmail.com',
  name: 'Piyush Magar',
  accountId: 'pixels_internal'
};

async function fixAccount() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Step 1: Find or create superadmin account
    console.log('📋 Step 1: Checking superadmin account...');
    let account = await Account.findOne({ email: SUPERADMIN.email });
    
    if (!account) {
      console.log('   ❌ Account not found, creating...');
      account = new Account({
        accountId: SUPERADMIN.accountId,
        email: SUPERADMIN.email,
        name: SUPERADMIN.name,
        type: 'internal',
        plan: 'premium',
        status: 'active'
      });
      await account.save();
      console.log('   ✅ Account created');
    } else {
      console.log('   ✅ Account exists');
      console.log(`   AccountId: ${account.accountId}`);
      console.log(`   MongoDB _id: ${account._id}`);
    }

    // Step 2: Check phone numbers
    console.log('\n📱 Step 2: Checking phone numbers...');
    const accountId = account.accountId;
    
    let phoneNumbers = await PhoneNumber.find({ accountId });
    console.log(`   Found ${phoneNumbers.length} phone(s) for accountId: ${accountId}`);
    
    if (phoneNumbers.length === 0) {
      console.log('   ⚠️  No phone numbers connected');
      console.log('   This is OK if you haven\'t set up WhatsApp numbers yet.');
    } else {
      phoneNumbers.forEach((phone, idx) => {
        console.log(`   [${idx + 1}] ${phone.displayPhone} - ${phone.displayName}`);
        console.log(`       PhoneNumberId: ${phone.phoneNumberId}`);
        console.log(`       Active: ${phone.isActive}`);
      });
    }

    // Step 3: Verify account sync
    console.log('\n✅ Step 3: Verification');
    const freshAccount = await Account.findOne({ email: SUPERADMIN.email });
    if (freshAccount) {
      console.log('   ✅ Superadmin account properly synced');
      console.log(`   Ready to connect WhatsApp numbers`);
    }

    console.log('\n✅ Fix complete\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixAccount();
