const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

const token1 = 'wpi_int_ee0057633f91fe57135811beaf14ce934b55556e34185b601bd0595ffc81bcb4';

function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

const tokenHash = hashToken(token1);

async function checkAccount() {
  try {
    console.log('\n🔍 CHECKING ACCOUNT STATUS IN MONGODB\n');
    console.log('═'.repeat(80) + '\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Find account by token hash
    const account = await db.collection('accounts').findOne({
      integrationTokenHash: tokenHash
    });
    
    if (!account) {
      console.log('❌ NO ACCOUNT FOUND WITH THIS TOKEN HASH\n');
      console.log('Token Hash:', tokenHash);
      console.log('\n📊 Checking all accounts with integration tokens:\n');
      
      const allAccounts = await db.collection('accounts')
        .find({ integrationTokenHash: { $exists: true, $ne: null } })
        .project({ name: 1, email: 1, status: 1, integrationTokenPrefix: 1 })
        .limit(10)
        .toArray();
      
      console.log(`Found ${allAccounts.length} accounts with integration tokens:\n`);
      allAccounts.forEach((acc, i) => {
        console.log(`${i+1}. ${acc.name || 'No Name'}`);
        console.log(`   Email: ${acc.email}`);
        console.log(`   Status: ${acc.status}`);
        console.log(`   Token Prefix: ${acc.integrationTokenPrefix}`);
        console.log('');
      });
      
    } else {
      console.log('✅ ACCOUNT FOUND!\n');
      console.log('Account Details:');
      console.log('  Name:', account.name);
      console.log('  Email:', account.email);
      console.log('  Status:', account.status);
      console.log('  Role:', account.role);
      console.log('  Token Prefix:', account.integrationTokenPrefix);
      console.log('  Token Created:', account.integrationTokenCreatedAt);
      console.log('  Token Hash Exists:', !!account.integrationTokenHash);
      
      console.log('\n🔍 STATUS ANALYSIS:\n');
      
      if (account.status === 'active') {
        console.log('✅ Account status: ACTIVE');
      } else {
        console.log(`❌ Account status: ${account.status} (Problem!))`);
      }
    }
    
    await mongoose.connection.close();
    console.log('\n═'.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkAccount();
