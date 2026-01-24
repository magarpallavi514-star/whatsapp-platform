/**
 * Check all accounts for missing passwords
 * Run: node backend/check-all-passwords.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

async function checkAllPasswords() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all accounts
    const accounts = await Account.find({}).select('+password');
    
    console.log(`\n📋 Total Accounts: ${accounts.length}\n`);
    console.log('Account Status:');
    console.log('─'.repeat(80));

    let accountsWithoutPassword = [];
    
    accounts.forEach((account, index) => {
      const hasPassword = !!account.password;
      const status = hasPassword ? '✅' : '❌';
      
      console.log(`${status} ${account.email}`);
      console.log(`   AccountId: ${account.accountId}`);
      console.log(`   Status: ${account.status}`);
      console.log(`   Type: ${account.type}`);
      console.log(`   Has Password: ${hasPassword}`);
      console.log('');
      
      if (!hasPassword) {
        accountsWithoutPassword.push({
          email: account.email,
          accountId: account.accountId,
          status: account.status,
          type: account.type
        });
      }
    });

    console.log('─'.repeat(80));
    console.log(`\n⚠️ Accounts WITHOUT password: ${accountsWithoutPassword.length}\n`);
    
    if (accountsWithoutPassword.length > 0) {
      accountsWithoutPassword.forEach(acc => {
        console.log(`❌ ${acc.email} (${acc.type} - ${acc.status})`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAllPasswords();
