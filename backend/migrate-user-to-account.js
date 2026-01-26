/**
 * Migration Script: Copy User collection to Account collection
 * This consolidates User and Account into a single Account collection
 * 
 * Usage: node migrate-user-to-account.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

// Simple schema definitions for migration
const userSchema = new mongoose.Schema({}, { strict: false });
const accountSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);

async function migrateUserToAccount() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate`);

    if (users.length === 0) {
      console.log('ℹ️  No users to migrate');
      await mongoose.connection.close();
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Check if account with this email already exists
        const existingAccount = await Account.findOne({ email: user.email });

        if (existingAccount) {
          console.log(`⏭️  Skipping ${user.email} - Account already exists (ID: ${existingAccount._id})`);
          skippedCount++;
          continue;
        }

        // Create account from user data
        const accountData = {
          accountId: user.accountId || `user_${user._id}`,
          type: user.role === 'superadmin' ? 'internal' : 'client',
          name: user.name,
          email: user.email,
          phone: user.phone,
          password: user.password, // Keep hashed password
          role: user.role,
          status: user.status || 'active',
          plan: user.plan || 'free',
          phoneNumber: user.phoneNumber,
          countryCode: user.countryCode || '+91',
          billingCycle: user.billingCycle || 'monthly',
          nextBillingDate: user.nextBillingDate,
          totalPayments: user.totalPayments || 0,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount || 0,
          createdAt: user.createdAt,
          updatedAt: new Date()
        };

        const newAccount = new Account(accountData);
        await newAccount.save();

        console.log(`✅ Migrated: ${user.email} (ID: ${newAccount._id})`);
        migratedCount++;
      } catch (err) {
        console.error(`❌ Error migrating ${user.email}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    await mongoose.connection.close();
    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateUserToAccount();
