const crypto = require('crypto');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const token = 'wpi_int_ee0057633f91fe57135811beaf14ce934b55556e34185b601bd0595ffc81bcb4';

function hashApiKey(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

async function verify() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://pixels:Pixels%402025@pixelsagency.664wxw1.mongodb.net/whatsapp-platform?retryWrites=true&w=majority';
    
    console.log('🔍 Token Verification\n');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('Token Prefix:', token.substring(0, 12));
    
    const tokenHash = hashApiKey(token);
    console.log('Token Hash:', tokenHash);
    console.log('\n📡 Connecting to MongoDB...\n');
    
    await mongoose.connect(mongoUri);
    
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
      console.log('  Created:', result.integrationTokenCreatedAt);
      console.log('  Last Used:', result.integrationTokenLastUsedAt || 'Never');
    } else {
      console.log('❌ TOKEN IS INVALID!\n');
      console.log('No active account found with this token.');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

verify();
