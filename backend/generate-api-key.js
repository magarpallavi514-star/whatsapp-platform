#!/usr/bin/env node

/**
 * Generate API Key for Account
 * Creates secure API key for authentication
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

async function generateApiKey() {
  console.log('\n🔑 ========== GENERATE API KEY ==========\n');
  
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.name);
    console.log('');

    // Get account ID from command line or use default
    const accountId = process.argv[2] || 'pixels_internal';
    
    console.log('1️⃣ FINDING ACCOUNT');
    console.log('─'.repeat(50));
    console.log('   Account ID:', accountId);
    console.log('');
    
    // Find account
    const account = await Account.findOne({ accountId }).select('+apiKey');
    
    if (!account) {
      console.log('❌ Account not found:', accountId);
      console.log('');
      console.log('Available accounts:');
      const accounts = await Account.find().select('accountId name').lean();
      accounts.forEach(acc => {
        console.log(`   - ${acc.accountId} (${acc.name})`);
      });
      console.log('');
      console.log('Usage: node generate-api-key.js <accountId>');
      return;
    }
    
    console.log('   ✅ Account found:', account.name);
    console.log('   Type:', account.type);
    console.log('   Status:', account.status);
    console.log('');

    // Check if API key already exists
    if (account.apiKey) {
      console.log('⚠️  EXISTING API KEY FOUND');
      console.log('─'.repeat(50));
      console.log('   Current API Key:', account.apiKey);
      console.log('   Created At:', account.apiKeyCreatedAt);
      console.log('   Last Used:', account.apiKeyLastUsedAt || 'Never');
      console.log('');
      console.log('⚠️  Warning: Generating new key will invalidate the old one!');
      console.log('');
    }

    console.log('2️⃣ GENERATING NEW API KEY');
    console.log('─'.repeat(50));
    
    // Generate new API key
    const apiKey = account.generateApiKey();
    await account.save();
    
    console.log('   ✅ API Key Generated Successfully!');
    console.log('');
    
    console.log('═'.repeat(50));
    console.log('🔑 YOUR API KEY');
    console.log('═'.repeat(50));
    console.log('');
    console.log('   ' + apiKey);
    console.log('');
    console.log('═'.repeat(50));
    console.log('');
    
    console.log('📋 ACCOUNT DETAILS');
    console.log('─'.repeat(50));
    console.log('   Account ID:', account.accountId);
    console.log('   Name:', account.name);
    console.log('   Email:', account.email);
    console.log('   Type:', account.type);
    console.log('   Plan:', account.plan);
    console.log('   Status:', account.status);
    console.log('   Created:', account.apiKeyCreatedAt);
    console.log('');

    console.log('🔐 USAGE EXAMPLE');
    console.log('─'.repeat(50));
    console.log('');
    console.log('   cURL:');
    console.log('   ──────');
    console.log('   curl -H "Authorization: Bearer ' + apiKey + '" \\');
    console.log('        "http://localhost:5050/api/stats"');
    console.log('');
    console.log('   JavaScript (Axios):');
    console.log('   ───────────────────');
    console.log('   axios.get("http://localhost:5050/api/stats", {');
    console.log('     headers: {');
    console.log('       "Authorization": "Bearer ' + apiKey + '"');
    console.log('     }');
    console.log('   });');
    console.log('');
    console.log('   Node.js (Fetch):');
    console.log('   ────────────────');
    console.log('   fetch("http://localhost:5050/api/stats", {');
    console.log('     headers: {');
    console.log('       "Authorization": "Bearer ' + apiKey + '"');
    console.log('     }');
    console.log('   });');
    console.log('');

    console.log('⚠️  SECURITY NOTES');
    console.log('─'.repeat(50));
    console.log('   • Store this key securely (environment variables)');
    console.log('   • Never commit this key to git');
    console.log('   • Use HTTPS in production');
    console.log('   • Regenerate if compromised');
    console.log('');

    console.log('✅ API KEY READY TO USE!');
    console.log('');

  } catch (error) {
    console.error('❌ Error generating API key:', error);
    console.error('');
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run
generateApiKey().catch(console.error);
