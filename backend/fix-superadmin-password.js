/**
 * Fix superadmin password
 * Run: node backend/fix-superadmin-password.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

async function fixSuperadminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'mpiyush2727@gmail.com';
    const password = 'Pm@22442232'; // From ADMIN_USER hardcoded config

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Password hashed');

    const account = await Account.findOne({ email });
    
    if (!account) {
      console.log('❌ Superadmin account not found:', email);
      process.exit(1);
    }

    console.log('📝 Updating superadmin account:', {
      accountId: account.accountId,
      email: account.email,
      type: account.type
    });

    account.password = hashedPassword;
    await account.save();

    console.log('✅ Superadmin password updated successfully');
    console.log('   Email:', email);
    console.log('   Password: Pm@22442232');
    console.log('   AccountId:', account.accountId);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixSuperadminPassword();
