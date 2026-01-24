import mongoose from 'mongoose';
import Account from './backend/src/models/Account.js';
import Payment from './backend/src/models/Payment.js';
import Subscription from './backend/src/models/Subscription.js';
import Invoice from './backend/src/models/Invoice.js';
import PhoneNumber from './backend/src/models/PhoneNumber.js';
import Message from './backend/src/models/Message.js';
import Contact from './backend/src/models/Contact.js';
import Conversation from './backend/src/models/Conversation.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

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

    // Delete related data
    console.log('\n🗑️ Deleting related data...');

    const deletionResults = {
      payments: await Payment.deleteMany({ accountId: { $in: accountIds } }),
      subscriptions: await Subscription.deleteMany({ accountId: { $in: accountIds } }),
      invoices: await Invoice.deleteMany({ accountId: { $in: accountIds } }),
      phoneNumbers: await PhoneNumber.deleteMany({ accountId: { $in: accountIds } }),
      messages: await Message.deleteMany({ accountId: { $in: accountIds } }),
      contacts: await Contact.deleteMany({ accountId: { $in: accountIds } }),
      conversations: await Conversation.deleteMany({ accountId: { $in: accountIds } })
    };

    console.log('  ✓ Payments:', deletionResults.payments.deletedCount);
    console.log('  ✓ Subscriptions:', deletionResults.subscriptions.deletedCount);
    console.log('  ✓ Invoices:', deletionResults.invoices.deletedCount);
    console.log('  ✓ Phone Numbers:', deletionResults.phoneNumbers.deletedCount);
    console.log('  ✓ Messages:', deletionResults.messages.deletedCount);
    console.log('  ✓ Contacts:', deletionResults.contacts.deletedCount);
    console.log('  ✓ Conversations:', deletionResults.conversations.deletedCount);

    // Delete accounts
    console.log('\n🔐 Deleting accounts...');
    const accountDeletion = await Account.deleteMany({
      _id: { $in: accountIds }
    });
    console.log('  ✓ Accounts deleted:', accountDeletion.deletedCount);

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
