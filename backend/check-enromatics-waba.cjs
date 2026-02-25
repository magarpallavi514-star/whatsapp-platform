const mongoose = require('mongoose');
require('dotenv').config();

async function checkWABA() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Get Enromatics account
    const account = await db.collection('accounts').findOne({
      email: 'info@enromatics.com'
    });
    
    console.log('\n📱 ENROMATICS WABA & WHATSAPP STATUS\n');
    console.log('Account Name:', account.name);
    console.log('Account ID:', account.accountId);
    console.log('Account Status:', account.status);
    
    // Check phone numbers
    const phoneNumbers = await db.collection('phonenumbers').find({
      accountId: account.accountId
    }).toArray();
    
    console.log('\n📞 PHONE NUMBERS:');
    console.log('Total:', phoneNumbers.length);
    
    if (phoneNumbers.length > 0) {
      phoneNumbers.forEach((ph, i) => {
        console.log(`\n${i+1}. ${ph.phoneNumber || 'No number'}`);
        console.log('   Business ID:', ph.businessAccountId || 'MISSING ❌');
        console.log('   Phone ID:', ph.phoneNumberId || 'MISSING ❌');
        console.log('   Status:', ph.status || 'unknown');
        console.log('   Connected:', ph.connected !== false ? 'Yes ✅' : 'No ❌');
        console.log('   Meta Token:', ph.metaAccessToken ? 'Yes ✅' : 'No ❌');
      });
    } else {
      console.log('❌ NO PHONE NUMBERS CONFIGURED');
    }
    
    // Check business accounts
    const businessAccounts = await db.collection('businessaccounts').find({
      accountId: account.accountId
    }).toArray();
    
    console.log('\n🏢 BUSINESS ACCOUNTS:');
    console.log('Total:', businessAccounts.length);
    
    if (businessAccounts.length > 0) {
      businessAccounts.forEach((ba, i) => {
        console.log(`\n${i+1}. Business ID: ${ba.businessAccountId || 'MISSING'}`);
        console.log('   Meta Token:', ba.metaAccessToken ? 'Yes ✅' : 'No ❌');
        console.log('   Status:', ba.status || 'unknown');
      });
    } else {
      console.log('❌ NO BUSINESS ACCOUNTS');
    }
    
    // Check OAuth connections
    const connections = await db.collection('integrations').find({
      accountId: account.accountId,
      type: 'meta'
    }).toArray();
    
    console.log('\n🔗 META/FACEBOOK CONNECTIONS:');
    console.log('Total:', connections.length);
    
    if (connections.length > 0) {
      connections.forEach((conn, i) => {
        console.log(`\n${i+1}. Type: ${conn.type}`);
        console.log('   Status:', conn.status || 'unknown');
        console.log('   Access Token:', conn.accessToken ? 'Yes ✅' : 'No ❌');
        console.log('   Connected At:', conn.connectedAt || 'N/A');
      });
    } else {
      console.log('❌ NO META CONNECTIONS');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkWABA();
