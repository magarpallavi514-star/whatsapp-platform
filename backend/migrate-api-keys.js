/**
 * Migrate existing pixels_internal account to use hashed API key
 * Run once: node migrate-api-keys.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Account from './src/models/Account.js';

dotenv.config();

// The existing plaintext API key
const EXISTING_API_KEY = 'wpk_live_6f6213f0ff23229160f13d819c1167c4ccaf099e34d8971d38bb2ca817776a29';

async function migrateApiKeys() {
  try {
    console.log('\n🔄 ========== MIGRATE API KEYS ==========\n');
    
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.name, '\n');
    
    // Find pixels_internal account
    console.log('1️⃣ FINDING PIXELS_INTERNAL ACCOUNT');
    console.log('──────────────────────────────────────────────────');
    
    const account = await Account.findOne({ accountId: 'pixels_internal' });
    
    if (!account) {
      console.log('❌ pixels_internal account not found!');
      process.exit(1);
    }
    
    console.log(`   ✅ Found: ${account.name}`);
    console.log(`   Status: ${account.status}\n`);
    
    // Hash the existing API key
    console.log('2️⃣ HASHING EXISTING API KEY');
    console.log('──────────────────────────────────────────────────');
    
    const hash = Account.hashApiKey(EXISTING_API_KEY);
    const prefix = EXISTING_API_KEY.substring(0, 12);
    
    console.log(`   API Key: ${EXISTING_API_KEY}`);
    console.log(`   Hash: ${hash.substring(0, 16)}...`);
    console.log(`   Prefix: ${prefix}\n`);
    
    // Update account with hashed key
    console.log('3️⃣ UPDATING ACCOUNT');
    console.log('──────────────────────────────────────────────────');
    
    account.apiKeyHash = hash;
    account.apiKeyPrefix = prefix;
    
    // Remove old plaintext field if it exists
    account.set('apiKey', undefined, { strict: false });
    
    await account.save();
    
    console.log('   ✅ Account updated with hashed API key\n');
    
    // Verify it works
    console.log('4️⃣ VERIFYING AUTHENTICATION');
    console.log('──────────────────────────────────────────────────');
    
    const foundAccount = await Account.findByApiKey(EXISTING_API_KEY);
    
    if (foundAccount) {
      console.log('   ✅ Authentication works!');
      console.log(`   Found account: ${foundAccount.accountId}\n`);
    } else {
      console.log('   ❌ Authentication failed!\n');
      process.exit(1);
    }
    
    console.log('══════════════════════════════════════════════════');
    console.log('✅ MIGRATION COMPLETE');
    console.log('══════════════════════════════════════════════════\n');
    
    console.log('📋 SUMMARY');
    console.log('──────────────────────────────────────────────────');
    console.log(`   Account: ${account.accountId}`);
    console.log(`   API Key (unchanged): ${EXISTING_API_KEY}`);
    console.log(`   Hash stored in DB: ${hash.substring(0, 20)}...`);
    console.log(`   Prefix: ${prefix}`);
    console.log('──────────────────────────────────────────────────\n');
    
    console.log('✅ Your existing API key still works!');
    console.log('✅ It is now securely hashed in the database\n');
    
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateApiKeys();
