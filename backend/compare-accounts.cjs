const mongoose = require('mongoose');
require('dotenv').config();

async function compareAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Get superadmin account
    const superadmin = await db.collection('accounts').findOne({
      type: 'internal'
    });
    
    // Get Enromatics account
    const enromatics = await db.collection('accounts').findOne({
      email: 'info@enromatics.com'
    });
    
    console.log('\n📊 ACCOUNT COMPARISON\n');
    console.log('═'.repeat(80));
    
    console.log('\n👤 SUPERADMIN ACCOUNT:');
    console.log('   Account ID:', superadmin?.accountId);
    console.log('   Type:', superadmin?.type);
    console.log('   Business ID:', superadmin?.businessId);
    console.log('   WABA ID:', superadmin?.wabaId);
    console.log('   Meta Sync Status:', superadmin?.metaSync?.status);
    
    console.log('\n👤 ENROMATICS ACCOUNT:');
    console.log('   Account ID:', enromatics?.accountId);
    console.log('   Type:', enromatics?.type);
    console.log('   Business ID:', enromatics?.businessId);
    console.log('   WABA ID:', enromatics?.wabaId);
    console.log('   Meta Sync Status:', enromatics?.metaSync?.status);
    
    // Check phone numbers
    const superadminPhones = await db.collection('phonenumbers').countDocuments({
      accountId: superadmin?.accountId
    });
    
    const enromaticsPhones = await db.collection('phonenumbers').countDocuments({
      accountId: enromatics?.accountId
    });
    
    console.log('\n📱 PHONE NUMBERS:');
    console.log('   Superadmin:', superadminPhones);
    console.log('   Enromatics:', enromaticsPhones);
    
    // Check if they share the same business ID
    console.log('\n🔗 BUSINESS ACCOUNT SHARING:');
    if (superadmin?.businessId && enromatics?.businessId) {
      if (superadmin.businessId === enromatics.businessId) {
        console.log('   ✅ Both use SAME business account:', superadmin.businessId);
      } else {
        console.log('   ❌ Different business accounts:');
        console.log('      Superadmin:', superadmin.businessId);
        console.log('      Enromatics:', enromatics.businessId);
      }
    } else {
      console.log('   ⚠️  Missing business IDs:');
      console.log('      Superadmin:', superadmin?.businessId || 'MISSING');
      console.log('      Enromatics:', enromatics?.businessId || 'MISSING');
    }
    
    console.log('\n═'.repeat(80) + '\n');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

compareAccounts();
