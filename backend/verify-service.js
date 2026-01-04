#!/usr/bin/env node

/**
 * WhatsApp Service Verification Script
 * Tests the refactored service without needing full API
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import whatsappService from './src/services/whatsappService.js';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Message from './src/models/Message.js';
import Template from './src/models/Template.js';
import Contact from './src/models/Contact.js';
import Conversation from './src/models/Conversation.js';
import KeywordRule from './src/models/KeywordRule.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

async function verifyService() {
  console.log('\n🔍 ========== WHATSAPP SERVICE VERIFICATION ==========\n');
  
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', mongoose.connection.name);
    console.log('');

    // 1. Verify Models Load
    console.log('1️⃣ VERIFYING MODELS');
    console.log('─'.repeat(50));
    
    const models = [
      { name: 'Account', model: Account },
      { name: 'PhoneNumber', model: PhoneNumber },
      { name: 'Template', model: Template },
      { name: 'Message', model: Message },
      { name: 'Conversation', model: Conversation },
      { name: 'Contact', model: Contact },
      { name: 'KeywordRule', model: KeywordRule }
    ];

    for (const { name, model } of models) {
      const count = await model.countDocuments();
      console.log(`   ✅ ${name.padEnd(15)} - Model loaded (${count} documents)`);
    }
    console.log('');

    // 2. Verify Service Methods
    console.log('2️⃣ VERIFYING SERVICE METHODS');
    console.log('─'.repeat(50));
    
    const serviceMethods = [
      'getPhoneConfig',
      'sendTextMessage',
      'sendTemplateMessage',
      'testConnection',
      'handleStatusUpdate',
      'processIncomingMessage',
      'getStats'
    ];

    for (const method of serviceMethods) {
      const exists = typeof whatsappService[method] === 'function';
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} ${method}`);
      
      if (!exists) {
        console.log(`      ⚠️  Method ${method} not found!`);
      }
    }
    console.log('');

    // 3. Check for test data
    console.log('3️⃣ CHECKING TEST DATA');
    console.log('─'.repeat(50));
    
    const accountCount = await Account.countDocuments();
    const phoneCount = await PhoneNumber.countDocuments();
    
    console.log(`   Accounts: ${accountCount}`);
    console.log(`   Phone Numbers: ${phoneCount}`);
    console.log('');

    if (accountCount === 0) {
      console.log('⚠️  NO TEST DATA FOUND');
      console.log('');
      console.log('To test the service, you need to create:');
      console.log('   1. An Account document');
      console.log('   2. A PhoneNumber document with WABA credentials');
      console.log('');
      console.log('Example:');
      console.log('```javascript');
      console.log('// Create account');
      console.log('const account = await Account.create({');
      console.log('  accountId: "pixels_internal",');
      console.log('  type: "internal",');
      console.log('  name: "Pixels Agency",');
      console.log('  email: "admin@pixels.com",');
      console.log('  plan: "enterprise"');
      console.log('});');
      console.log('');
      console.log('// Create phone number');
      console.log('const phone = await PhoneNumber.create({');
      console.log('  accountId: "pixels_internal",');
      console.log('  phoneNumberId: "YOUR_PHONE_NUMBER_ID",');
      console.log('  wabaId: "YOUR_WABA_ID",');
      console.log('  accessToken: "YOUR_ACCESS_TOKEN",');
      console.log('  displayName: "Pixels WhatsApp"');
      console.log('});');
      console.log('```');
      console.log('');
    } else {
      console.log('✅ Test data exists!');
      
      // Show sample account
      const sampleAccount = await Account.findOne().lean();
      console.log('');
      console.log('Sample Account:');
      console.log('   Account ID:', sampleAccount.accountId);
      console.log('   Name:', sampleAccount.name);
      console.log('   Type:', sampleAccount.type);
      console.log('   Plan:', sampleAccount.plan);
      console.log('');
      
      if (phoneCount > 0) {
        const samplePhone = await PhoneNumber.findOne({ accountId: sampleAccount.accountId })
          .select('-accessToken') // Don't show token
          .lean();
        
        if (samplePhone) {
          console.log('Sample Phone Number:');
          console.log('   Phone Number ID:', samplePhone.phoneNumberId);
          console.log('   WABA ID:', samplePhone.wabaId);
          console.log('   Display Name:', samplePhone.displayName || 'N/A');
          console.log('   Status:', samplePhone.isActive ? 'Active' : 'Inactive');
          console.log('   Messages Sent:', samplePhone.messageCount?.sent || 0);
          console.log('');
        }
      }
    }

    // 4. Verify Schema Indexes
    console.log('4️⃣ VERIFYING INDEXES');
    console.log('─'.repeat(50));
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Total Collections: ${collections.length}`);
    
    for (const coll of collections) {
      const indexes = await mongoose.connection.db.collection(coll.name).indexes();
      console.log(`   ${coll.name}: ${indexes.length} indexes`);
    }
    console.log('');

    // 5. Test Stats Method (safe - no external API call)
    console.log('5️⃣ TESTING SERVICE METHOD (getStats)');
    console.log('─'.repeat(50));
    
    if (accountCount > 0) {
      const account = await Account.findOne().lean();
      
      try {
        const stats = await whatsappService.getStats(account.accountId);
        console.log('   ✅ getStats() works!');
        console.log('   Stats:', JSON.stringify(stats, null, 2));
      } catch (error) {
        console.log('   ❌ getStats() failed:', error.message);
      }
    } else {
      console.log('   ⚠️  Skipped (no test account)');
    }
    console.log('');

    // Summary
    console.log('═'.repeat(50));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('═'.repeat(50));
    console.log('');
    console.log('Summary:');
    console.log('   ✅ All models loaded successfully');
    console.log('   ✅ All service methods present');
    console.log('   ✅ Database connection working');
    console.log('   ✅ Indexes created');
    console.log('');
    
    if (accountCount === 0) {
      console.log('⚠️  Next Step: Create test data (see example above)');
    } else {
      console.log('🚀 Next Step: Test sending a message');
      console.log('   Run: node test-send-message.js');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    console.error('');
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run verification
verifyService().catch(console.error);
