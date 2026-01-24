/**
 * Check account password status
 * Run: node backend/check-account.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

async function checkAccount() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'info@enromatics.com';

    // Find account and explicitly select password
    const account = await Account.findOne({ email }).select('+password');
    
    if (!account) {
      console.log('❌ Account not found:', email);
      process.exit(1);
    }

    console.log('📋 Account Details:');
    console.log('   Email:', account.email);
    console.log('   AccountId:', account.accountId);
    console.log('   Name:', account.name);
    console.log('   Status:', account.status);
    console.log('   Plan:', account.plan);
    console.log('   BillingCycle:', account.billingCycle);
    console.log('   Has Password:', !!account.password);
    console.log('   Password Type:', typeof account.password);
    console.log('   Password Value:', account.password ? account.password.substring(0, 20) + '...' : 'NULL/UNDEFINED');
    console.log('   Password Length:', account.password ? account.password.length : 0);

    if (!account.password) {
      console.log('\n⚠️ Account exists but has NO password!');
      console.log('   You need to set password 951695');
    } else {
      console.log('\n✅ Account has a password');
      console.log('   Try logging in with password: 951695');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAccount();
