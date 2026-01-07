#!/usr/bin/env node

/**
 * Generate API Key for Production Account
 * Run this script to generate a new API key for production
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

async function generateProductionApiKey() {
  console.log('\n🔑 ========== GENERATE PRODUCTION API KEY ==========\n');
  
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    console.log('');

    // Get account ID from command line or use default
    const accountId = process.argv[2] || 'pixels_internal';
    
    console.log('1️⃣ FINDING ACCOUNT');
    console.log('─'.repeat(50));
    console.log('   Account ID:', accountId);
    console.log('');
    
    // Find account and select the apiKeyHash field explicitly
    const account = await Account.findOne({ accountId }).select('+apiKeyHash');
    
    if (!account) {
      console.log('❌ Account not found:', accountId);
      console.log('');
      console.log('Available accounts:');
      const accounts = await Account.find().select('accountId name type status').lean();
      
      if (accounts.length === 0) {
        console.log('   ⚠️  No accounts found! Creating default account...');
        console.log('');
        
        // Create default account
        const newAccount = await Account.create({
          accountId: 'pixels_internal',
          name: 'Pixels Internal',
          email: 'tech@pixels.com',
          type: 'internal',
          status: 'active',
          plan: 'enterprise'
        });
        
        console.log('   ✅ Created account:', newAccount.accountId);
        console.log('');
        
        // Generate API key for new account
        const apiKey = newAccount.generateApiKey();
        await newAccount.save();
        
        console.log('═'.repeat(60));
        console.log('🔑 NEW API KEY GENERATED');
        console.log('═'.repeat(60));
        console.log('');
        console.log('   ' + apiKey);
        console.log('');
        console.log('═'.repeat(60));
        console.log('');
        console.log('📋 Save this key securely! It will only be shown once.');
        console.log('');
        
        await mongoose.connection.close();
        return;
      }
      
      accounts.forEach(acc => {
        console.log(`   - ${acc.accountId} (${acc.name}) - ${acc.status}`);
      });
      console.log('');
      console.log('Usage: node generate-production-key.js <accountId>');
      await mongoose.connection.close();
      return;
    }
    
    console.log('   ✅ Account found:', account.name);
    console.log('   Type:', account.type);
    console.log('   Status:', account.status);
    console.log('   Plan:', account.plan);
    console.log('');

    // Check if API key already exists
    if (account.apiKeyHash) {
      console.log('⚠️  EXISTING API KEY FOUND');
      console.log('─'.repeat(50));
      console.log('   Key Prefix:', account.apiKeyPrefix || 'N/A');
      console.log('   Created At:', account.apiKeyCreatedAt || 'Unknown');
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
    
    console.log('═'.repeat(60));
    console.log('🔑 YOUR PRODUCTION API KEY');
    console.log('═'.repeat(60));
    console.log('');
    console.log('   ' + apiKey);
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
    
    console.log('📋 ACCOUNT DETAILS');
    console.log('─'.repeat(50));
    console.log('   Account ID:', account.accountId);
    console.log('   Name:', account.name);
    console.log('   Email:', account.email);
    console.log('   Type:', account.type);
    console.log('   Plan:', account.plan);
    console.log('   Status:', account.status);
    console.log('   Key Prefix:', account.apiKeyPrefix);
    console.log('   Created:', account.apiKeyCreatedAt);
    console.log('');

    console.log('🔐 USAGE EXAMPLE');
    console.log('─'.repeat(50));
    console.log('');
    console.log('curl -X POST https://whatsapp-platform-production-e48b.up.railway.app/api/messages/send \\');
    console.log(`  -H "Authorization: Bearer ${apiKey}" \\`);
    console.log('  -H "Content-Type: application/json" \\');
    console.log("  -d '{\"to\":\"+1234567890\",\"message\":\"Test message\"}'");
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
    console.log('⚠️  IMPORTANT: Save this key securely!');
    console.log('   - Store in password manager');
    console.log('   - Use environment variables in production');
    console.log('   - Never commit to git');
    console.log('   - This is the only time you will see the full key');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
  }
}

// Run the script
generateProductionApiKey();
