import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import User from './src/models/User.js';

dotenv.config();

async function findSuperAdminAccount() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const superAdminEmail = 'mpiyush2727@gmail.com';
    
    console.log('🔍 CHECKING SUPERADMIN ACCOUNT\n');
    console.log('Email:', superAdminEmail);

    // Find user
    const user = await User.findOne({ email: superAdminEmail });
    console.log('\n1️⃣  USER FOUND:');
    if (user) {
      console.log('   Email:', user.email);
      console.log('   Account ID (from user):', user.accountId);
      console.log('   Account ID type:', typeof user.accountId);
    } else {
      console.log('   ❌ User not found!');
    }

    // Find all accounts
    console.log('\n2️⃣  ALL ACCOUNTS IN DATABASE:');
    const allAccounts = await Account.find({});
    console.log('   Total accounts:', allAccounts.length);
    allAccounts.forEach(acc => {
      console.log(`   - ${acc.accountId}: ${acc.name || 'Unnamed'}`);
    });

    // Find account for superadmin
    if (user && user.accountId) {
      console.log('\n3️⃣  SUPERADMIN ACCOUNT DETAILS:');
      const account = await Account.findOne({ accountId: user.accountId });
      if (account) {
        console.log('   ✅ Account found!');
        console.log('   Account ID:', account.accountId);
        console.log('   Name:', account.name);
        console.log('   Email:', account.email);
        console.log('   Status:', account.status);
        console.log('   Role:', account.role);
      } else {
        console.log('   ❌ Account NOT found for accountId:', user.accountId);
        console.log('\n   ⚠️  ISSUE: User points to non-existent account');
        console.log('   Fix: Update user to point to correct account (2600001)');
      }
    }

    // Check for "pixels_internal" account
    console.log('\n4️⃣  CHECKING FOR OLD "pixels_internal" ACCOUNT:');
    const pixelsInternal = await Account.findOne({ accountId: 'pixels_internal' });
    if (pixelsInternal) {
      console.log('   ⚠️  Found old account: pixels_internal');
      console.log('   Should be: 2600001');
    } else {
      console.log('   ✅ Old "pixels_internal" account correctly deleted');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findSuperAdminAccount();
