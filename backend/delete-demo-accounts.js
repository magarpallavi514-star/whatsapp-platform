import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function deleteAllDemoAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Email addresses to KEEP
    const emailsToKeep = [
      'info@enromatics.com',
      'mpiyush2727@gmail.com'
    ];

    console.log('\n🔍 Scanning accounts...');
    console.log('📌 Keeping:', emailsToKeep.join(', '));

    // Get all accounts
    const allAccounts = await Account.find({});
    console.log(`\n📊 Total accounts in database: ${allAccounts.length}`);

    // Get all users
    const allUsers = await User.find({});
    console.log(`📊 Total users in database: ${allUsers.length}`);

    // Find accounts to delete
    const accountsToDelete = allAccounts.filter(
      acc => !emailsToKeep.includes(acc.email)
    );

    console.log(`\n⚠️  Will delete: ${accountsToDelete.length} accounts`);
    console.log('Accounts to be deleted:');
    accountsToDelete.forEach(acc => {
      console.log(`   - ${acc.email} (${acc.name}) [${acc.accountId}]`);
    });

    // Find users to delete
    const usersToDelete = allUsers.filter(
      user => !emailsToKeep.includes(user.email)
    );

    console.log(`\n⚠️  Will delete: ${usersToDelete.length} users (legacy)`);
    console.log('Users to be deleted:');
    usersToDelete.forEach(user => {
      console.log(`   - ${user.email}`);
    });

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This action cannot be undone!');
    console.log('Keeping accounts:');
    emailsToKeep.forEach(email => {
      const acc = allAccounts.find(a => a.email === email);
      if (acc) {
        console.log(`   ✅ ${email} (${acc.name}) [${acc.accountId}]`);
      }
    });

    // Proceed with deletion (auto-confirm for script)
    console.log('\n🗑️  Deleting demo accounts...\n');

    // Delete from Account collection
    if (accountsToDelete.length > 0) {
      const accountDeleteResult = await Account.deleteMany({
        email: { $nin: emailsToKeep }
      });
      console.log(`✅ Deleted ${accountDeleteResult.deletedCount} accounts from Account collection`);
    }

    // Delete from User collection (legacy)
    if (usersToDelete.length > 0) {
      const userDeleteResult = await User.deleteMany({
        email: { $nin: emailsToKeep }
      });
      console.log(`✅ Deleted ${userDeleteResult.deletedCount} users from User collection (legacy)`);
    }

    // Verify
    console.log('\n📊 Final count:');
    const remainingAccounts = await Account.find({});
    const remainingUsers = await User.find({});
    
    console.log(`   Accounts: ${remainingAccounts.length}`);
    console.log(`   Users: ${remainingUsers.length}`);

    console.log('\n✅ Remaining accounts:');
    remainingAccounts.forEach(acc => {
      console.log(`   ✅ ${acc.email} (${acc.name}) [${acc.accountId}] - Status: ${acc.status}`);
    });

    console.log('\n✅ Done! All demo accounts deleted. Only production accounts remain.');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteAllDemoAccounts();
