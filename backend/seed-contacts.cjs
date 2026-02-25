const mongoose = require('mongoose');
require('dotenv').config();

async function seedContacts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Get account
    const account = await db.collection('accounts').findOne({
      email: 'info@enromatics.com'
    });
    
    if (!account) {
      console.log('❌ Account not found');
      process.exit(1);
    }
    
    console.log('\n📝 SEEDING TEST CONTACTS FOR CAMPAIGNS\n');
    console.log('Account:', account.name);
    console.log('Account ID:', account.accountId);
    
    // Sample contacts with tags
    const testContacts = [
      {
        accountId: account.accountId,
        name: 'John Doe',
        phone: '+911234567890',
        whatsappNumber: '+911234567890',
        email: 'john@example.com',
        tags: ['premium', 'active', 'vip'],
        type: 'customer',
        isOptedIn: true,
        isActive: true,
        createdAt: new Date()
      },
      {
        accountId: account.accountId,
        name: 'Jane Smith',
        phone: '+911234567891',
        whatsappNumber: '+911234567891',
        email: 'jane@example.com',
        tags: ['premium', 'inactive'],
        type: 'customer',
        isOptedIn: true,
        isActive: true,
        createdAt: new Date()
      },
      {
        accountId: account.accountId,
        name: 'Bob Wilson',
        phone: '+911234567892',
        whatsappNumber: '+911234567892',
        email: 'bob@example.com',
        tags: ['lead', 'active'],
        type: 'lead',
        isOptedIn: true,
        isActive: true,
        createdAt: new Date()
      },
      {
        accountId: account.accountId,
        name: 'Alice Johnson',
        phone: '+911234567893',
        whatsappNumber: '+911234567893',
        email: 'alice@example.com',
        tags: ['vip', 'active'],
        type: 'customer',
        isOptedIn: true,
        isActive: true,
        createdAt: new Date()
      },
      {
        accountId: account.accountId,
        name: 'Charlie Brown',
        phone: '+911234567894',
        whatsappNumber: '+911234567894',
        email: 'charlie@example.com',
        tags: ['lead', 'new'],
        type: 'lead',
        isOptedIn: true,
        isActive: true,
        createdAt: new Date()
      }
    ];
    
    // Insert contacts
    const result = await db.collection('contacts').insertMany(testContacts);
    
    console.log(`✅ Created ${result.insertedIds.length} test contacts\n`);
    
    // Show what segments are now available
    const segments = await db.collection('contacts').distinct('tags', {
      accountId: account.accountId
    });
    
    console.log('📊 Available segments:');
    segments.sort().forEach(tag => {
      console.log(`  • ${tag}`);
    });
    
    console.log('\n✅ Contacts ready for campaign creation!\n');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

seedContacts();
