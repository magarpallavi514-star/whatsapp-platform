const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

const emailsToDelete = [
  'piyushmagar4p@gmail.com',
  'pixelsadvertise@gmail.com'
];

async function deleteTestAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define Account schema inline
    const accountSchema = new mongoose.Schema({}, { strict: false });
    const Account = mongoose.model('Account', accountSchema);

    // Find accounts to delete
    const accountsToDelete = await Account.find({
      email: { $in: emailsToDelete }
    });

    if (accountsToDelete.length === 0) {
      console.log('⚠️ No accounts found with those emails');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n🔍 Found ${accountsToDelete.length} account(s) to delete:`);
    accountsToDelete.forEach(acc => {
      console.log(`  - ${acc.email} (${acc.accountId})`);
    });

    const accountIds = accountsToDelete.map(acc => acc._id);

    // Delete related data from all collections
    console.log('\n🗑️ Deleting related data...');

    const collections = [
      'payments',
      'subscriptions',
      'invoices',
      'phonenumbers',
      'messages',
      'contacts',
      'conversations',
      'leads',
      'broadcasts',
      'templates',
      'chatbots',
      'campaigns'
    ];

    for (const collectionName of collections) {
      const result = await mongoose.connection.db.collection(collectionName).deleteMany({
        accountId: { $in: accountIds }
      });
      if (result.deletedCount > 0) {
        console.log(`  ✓ ${collectionName}: ${result.deletedCount}`);
      }
    }

    // Delete accounts
    console.log('\n🔐 Deleting accounts...');
    const deleteResult = await Account.deleteMany({
      _id: { $in: accountIds }
    });
    console.log('  ✓ Accounts deleted:', deleteResult.deletedCount);

    console.log('\n✅ Cleanup completed successfully!');
    console.log(`\nDeleted:`);
    accountsToDelete.forEach(acc => {
      console.log(`  ✓ ${acc.email}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
deleteTestAccounts();
