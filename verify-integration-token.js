#!/usr/bin/env node

import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://pixels:Pixels%402025@pixelsagency.664wxw1.mongodb.net/whatsapp-platform?retryWrites=true&w=majority';

console.log('🔍 Integration Token Verification Tool');
console.log('=====================================\n');

const tokenToVerify = 'wpi_int_ee0057633f91fe57135811beaf14ce934b55556e34185b601bd0595ffc81bcb4';

// Hash function (same as backend)
function hashApiKey(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

async function verifyToken() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get the Account model
    const accountSchema = new mongoose.Schema({}, { collection: 'accounts' });
    const Account = mongoose.model('Account', accountSchema);

    // Calculate the hash
    const tokenHash = hashApiKey(tokenToVerify);
    console.log('Token provided:', tokenToVerify);
    console.log('Token prefix:', tokenToVerify.substring(0, 12));
    console.log('Token hash:', tokenHash);
    console.log('');

    // Query MongoDB
    const account = await Account.findOne({
      integrationTokenHash: tokenHash,
      status: 'active'
    }).select(
      'name email role status integrationTokenCreatedAt integrationTokenLastUsedAt integrationTokenPrefix'
    );

    if (account) {
      console.log('✅ TOKEN IS VALID!\n');
      console.log('Account Details:');
      console.log('  - Name:', account.name);
      console.log('  - Email:', account.email);
      console.log('  - Role:', account.role);
      console.log('  - Status:', account.status);
      console.log('  - Token Created:', new Date(account.integrationTokenCreatedAt).toLocaleString());
      console.log('  - Token Last Used:', account.integrationTokenLastUsedAt ? new Date(account.integrationTokenLastUsedAt).toLocaleString() : 'Never');
      console.log('  - Token Prefix:', account.integrationTokenPrefix);
    } else {
      console.log('❌ TOKEN IS INVALID!\n');
      console.log('No active account found with this token.');
      
      // Try to find if token exists but account is inactive
      const anyAccount = await Account.findOne({
        integrationTokenHash: tokenHash
      }).select('name email role status');

      if (anyAccount) {
        console.log('\n⚠️  Found account but it is not active:');
        console.log('  - Name:', anyAccount.name);
        console.log('  - Email:', anyAccount.email);
        console.log('  - Status:', anyAccount.status);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Verification complete');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    process.exit(1);
  }
}

verifyToken();
