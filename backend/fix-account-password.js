/**
 * Fix account password
 * Run: node backend/fix-account-password.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

async function fixPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Email and password to set
    const email = 'info@enromatics.com';
    const password = '951695';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Password hashed');

    // Find and update account
    const account = await Account.findOne({ email });
    
    if (!account) {
      console.log('❌ Account not found:', email);
      process.exit(1);
    }

    console.log('📝 Updating account:', {
      accountId: account.accountId,
      email: account.email,
      currentPasswordSet: !!account.password
    });

    // Update password
    account.password = hashedPassword;
    await account.save();

    console.log('✅ Account password updated successfully');
    console.log('   Email:', email);
    console.log('   Password: [hashed]');
    console.log('   AccountId:', account.accountId);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixPassword();
