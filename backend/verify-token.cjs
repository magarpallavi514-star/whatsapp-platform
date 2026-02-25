const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

const token = 'wpi_int_ee0057633f91fe57135811beaf14ce934b55556e34185b601bd0595ffc81bcb4';

function hashApiKey(tokenStr) {
  return crypto
    .createHash('sha256')
    .update(tokenStr)
    .digest('hex');
}

async function verify() {
  try {
    console.log('🔍 Token Verification\n');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('Token Prefix:', token.substring(0, 12));
    
    const tokenHash = hashApiKey(token);
    console.log('Token Hash:', tokenHash.substring(0, 20) + '...');
    console.log('\n📡 Connecting to MongoDB...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const result = await db.collection('accounts').findOne({
      integrationTokenHash: tokenHash,
      status: 'active'
    });
    
    if (result) {
      console.log('✅ TOKEN IS VALID!\n');
      console.log('Account Details:');
      console.log('  Name:', result.name);
      console.log('  Email:', result.email);
      console.log('  Role:', result.role);
      console.log('  Status:', result.status);
      console.log('  Created:', result.integrationTokenCreatedAt ? new Date(result.integrationTokenCreatedAt).toLocaleString() : 'Unknown');
      console.log('  Last Used:', result.integrationTokenLastUsedAt ? new Date(result.integrationTokenLastUsedAt).toLocaleString() : 'Never');
    } else {
      console.log('❌ TOKEN IS INVALID!\n');
      console.log('No active account found with this token.');
      
      // Check if token exists but account is inactive
      const inactiveResult = await db.collection('accounts').findOne({
        integrationTokenHash: tokenHash
      });
      
      if (inactiveResult) {
        console.log('\n⚠️  Found account but it is not active:');
        console.log('  Name:', inactiveResult.name);
        console.log('  Email:', inactiveResult.email);
        console.log('  Status:', inactiveResult.status);
      }
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verify();
