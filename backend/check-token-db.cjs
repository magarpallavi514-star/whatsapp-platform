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

async function checkTokenInDB() {
  try {
    console.log('\n🔍 CHECKING TOKEN IN MONGODB\n');
    console.log('═'.repeat(80) + '\n');

    const tokenHash = hashToken(token1);
    console.log('Token Hash to Find:', tokenHash);
    console.log('Token Prefix:', token1.substring(0, 12));
    console.log('');

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000
    });
    
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Find by integration token hash
    console.log('🔎 Searching by integrationTokenHash...\n');
    const result = await db.collection('accounts').findOne({
      integrationTokenHash: tokenHash
    });

    if (result) {
      console.log('✅ FOUND ACCOUNT WITH THIS TOKEN!\n');
      console.log('Account Details:');
      console.log('  _id:', result._id);
      console.log('  name:', result.name);
      console.log('  email:', result.email);
      console.log('  role:', result.role);
      console.log('  status:', result.status);
      console.log('  type:', result.type);
      console.log('  plan:', result.plan);
      console.log('');
      console.log('Token Info:');
      console.log('  integrationTokenHash:', result.integrationTokenHash);
      console.log('  integrationTokenPrefix:', result.integrationTokenPrefix);
      console.log('  integrationTokenCreatedAt:', result.integrationTokenCreatedAt);
      console.log('  integrationTokenLastUsedAt:', result.integrationTokenLastUsedAt);
      console.log('');

      // Diagnose the issue
      console.log('📊 DIAGNOSIS:\n');
      
      if (result.status !== 'active') {
        console.log(`❌ ISSUE FOUND: Account status is "${result.status}" (should be "active")`);
        console.log(`   → Account needs to be activated\n`);
      } else {
        console.log(`✅ Account status is "active"`);
      }

      if (!result.integrationTokenHash) {
        console.log('❌ ISSUE FOUND: integrationTokenHash is missing');
        console.log('   → Token not properly saved\n');
      } else {
        console.log('✅ integrationTokenHash is set');
      }

      if (result.integrationTokenPrefix !== token1.substring(0, 12)) {
        console.log(`❌ ISSUE FOUND: Token prefix mismatch`);
        console.log(`   Expected: ${token1.substring(0, 12)}`);
        console.log(`   Found: ${result.integrationTokenPrefix}\n`);
      } else {
        console.log('✅ Token prefix matches');
      }

    } else {
      console.log('❌ TOKEN NOT FOUND IN DATABASE\n');
      console.log('Searching for any accounts with integration tokens...\n');

      const allTokenAccounts = await db.collection('accounts')
        .find({ integrationTokenHash: { $exists: true, $ne: null } })
        .limit(5)
        .toArray();

      if (allTokenAccounts.length > 0) {
        console.log(`Found ${allTokenAccounts.length} accounts with integration tokens:\n`);
        allTokenAccounts.forEach((acc, idx) => {
          console.log(`${idx + 1}. ${acc.name} (${acc.email})`);
          console.log(`   Prefix: ${acc.integrationTokenPrefix}`);
          console.log(`   Status: ${acc.status}`);
        });
      } else {
        console.log('No accounts with integration tokens found in database');
      }
    }

    await mongoose.connection.close();
    console.log('\n' + '═'.repeat(80) + '\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
  }
  process.exit(0);
}

checkTokenInDB();
