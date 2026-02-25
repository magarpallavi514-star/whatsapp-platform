const mongoose = require('mongoose');
require('dotenv').config();

async function debugCampaigns() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Check Enromatics account
    const account = await db.collection('accounts').findOne({
      email: 'info@enromatics.com'
    });
    
    if (!account) {
      console.log('❌ Account not found');
      process.exit(1);
    }
    
    console.log('\n📊 ACCOUNT & SUBSCRIPTION STATUS\n');
    console.log('Account ID:', account.accountId);
    console.log('Account Type:', account.type);
    console.log('Account Status:', account.status);
    console.log('Account Plan:', account.plan);
    
    // Check if subscription exists
    const subscription = await db.collection('subscriptions').findOne({
      accountId: account.accountId
    });
    
    if (subscription) {
      console.log('\n✅ Subscription found:');
      console.log('Status:', subscription.status);
      console.log('Plan:', subscription.plan);
      console.log('Valid Reason:', subscription.status === 'active' ? '✅ ACTIVE' : '❌ NOT ACTIVE');
    } else {
      console.log('\n❌ NO SUBSCRIPTION FOUND');
      console.log('This is why campaigns API returns 403 (subscription required)');
    }
    
    // Check contacts count
    const contactCount = await db.collection('contacts').countDocuments({
      accountId: account.accountId
    });
    
    console.log('\n📋 CONTACTS:');
    console.log('Total contacts:', contactCount);
    
    // Check contacts with tags
    const contactsWithTags = await db.collection('contacts')
      .find({
        accountId: account.accountId,
        tags: { $exists: true, $ne: [] }
      })
      .toArray();
    
    console.log('Contacts with tags:', contactsWithTags.length);
    if (contactsWithTags.length > 0) {
      console.log('Sample tags:', contactsWithTags[0].tags);
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

debugCampaigns();
