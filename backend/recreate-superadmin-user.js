import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Account from './src/models/Account.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function recreateSuperAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const superAdminEmail = 'mpiyush2727@gmail.com';
    const accountId = '2600001';

    console.log('🔧 RECREATING SUPERADMIN USER RECORD\n');

    // Verify account exists
    const account = await Account.findOne({ accountId });
    if (!account) {
      console.log('❌ Account not found:', accountId);
      process.exit(1);
    }

    console.log('✅ Account found:', account.name);

    // Check if user already exists
    const existingUser = await User.findOne({ email: superAdminEmail });
    if (existingUser) {
      console.log('⚠️  User already exists');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create new user record
    const user = new User({
      email: superAdminEmail,
      name: 'Piyush Magar',
      accountId: accountId,
      role: 'superadmin',
      status: 'active',
      isEmailVerified: true,
      // Password is optional for SSO/OAuth users
      // but we can set a temporary one
      lastLogin: new Date()
    });

    await user.save();

    console.log('\n✅ SUPERADMIN USER CREATED\n');
    console.log('User Details:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Account ID:', user.accountId);
    console.log('  Role:', user.role);
    console.log('  Status:', user.status);
    console.log('  Verified:', user.isEmailVerified);

    console.log('\nNext time you login with:', superAdminEmail);
    console.log('You will be linked to account:', accountId);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

recreateSuperAdminUser();
