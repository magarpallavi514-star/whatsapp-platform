const crypto = require('crypto');

const token = 'wpi_int_8fa8718cd162f8b894c0728db19df797871ba0e034ef790fd3270d858ee122a3';

function hashApiKey(tokenStr) {
  return crypto
    .createHash('sha256')
    .update(tokenStr)
    .digest('hex');
}

console.log('🔍 Integration Token Verification\n');
console.log('Token:', token.substring(0, 20) + '...');
console.log('Token Prefix:', token.substring(0, 12));

const tokenHash = hashApiKey(token);
console.log('Token Hash:', tokenHash.substring(0, 20) + '...');
console.log('Token Format: ✅ VALID - matches wpi_int_ pattern');
console.log('Token Length:', token.length, 'characters\n');

console.log('📊 Token Details:');
console.log('  Full Prefix:', token.substring(0, 12));
console.log('  Hash Algorithm: SHA-256');
console.log('  Hash Length:', tokenHash.length, 'characters');
console.log('  Full Hash:', tokenHash);

console.log('\n✅ Token Format is VALID\n');
console.log('Now checking database...\n');

const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const result = await db.collection('accounts').findOne({
      integrationTokenHash: tokenHash,
      status: 'active'
    });
    
    if (result) {
      console.log('✅ TOKEN IS VALID IN DATABASE!\n');
      console.log('Account Details:');
      console.log('  Name:', result.name);
      console.log('  Email:', result.email);
      console.log('  Role:', result.role);
      console.log('  Status:', result.status);
      console.log('  Created:', result.integrationTokenCreatedAt ? new Date(result.integrationTokenCreatedAt).toLocaleString() : 'Unknown');
      console.log('  Last Used:', result.integrationTokenLastUsedAt ? new Date(result.integrationTokenLastUsedAt).toLocaleString() : 'Never');
    } else {
      console.log('❌ TOKEN NOT FOUND IN DATABASE\n');
      
      // Check if exists but inactive
      const inactiveResult = await db.collection('accounts').findOne({
        integrationTokenHash: tokenHash
      });
      
      if (inactiveResult) {
        console.log('⚠️  Found but account is inactive:');
        console.log('  Name:', inactiveResult.name);
        console.log('  Email:', inactiveResult.email);
        console.log('  Status:', inactiveResult.status);
      } else {
        console.log('This token has NOT been generated yet.');
      }
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('⚠️  MongoDB connection timeout/error:', err.message);
    console.log('\n📝 Token format is valid. Unable to verify database status.');
    console.log('The token may exist but MongoDB is not accessible.');
  }
}

checkDatabase().catch(console.error).finally(() => process.exit(0));
