#!/usr/bin/env node

/**
 * Create Test Data for WhatsApp Platform
 * Sets up initial account and phone number with your WABA credentials
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Template from './src/models/Template.js';
import Contact from './src/models/Contact.js';
import KeywordRule from './src/models/KeywordRule.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

async function createTestData() {
  console.log('\n🔧 ========== CREATING TEST DATA ==========\n');
  
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.name);
    console.log('');

    // 1. Create Account
    console.log('1️⃣ CREATING ACCOUNT');
    console.log('─'.repeat(50));
    
    const accountId = 'pixels_internal';
    
    let account = await Account.findOne({ accountId });
    
    if (account) {
      console.log('   ⚠️  Account already exists:', accountId);
    } else {
      account = await Account.create({
        accountId: 'pixels_internal',
        type: 'internal',
        name: 'Pixels Agency',
        email: 'admin@pixels.com',
        plan: 'enterprise',
        status: 'active',
        limits: {
          phoneNumbers: 10,
          messagesPerDay: 10000,
          templates: 100,
          contacts: 10000
        }
      });
      console.log('   ✅ Account created:', accountId);
    }
    console.log('');

    // 2. Create Phone Number (using your .env credentials)
    console.log('2️⃣ CREATING PHONE NUMBER');
    console.log('─'.repeat(50));
    
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (!phoneNumberId || !wabaId || !accessToken) {
      console.log('   ❌ Missing credentials in .env file!');
      console.log('   Required:');
      console.log('      - WHATSAPP_PHONE_NUMBER_ID');
      console.log('      - WHATSAPP_BUSINESS_ACCOUNT_ID');
      console.log('      - WHATSAPP_ACCESS_TOKEN');
      console.log('');
    } else {
      let phone = await PhoneNumber.findOne({ accountId, phoneNumberId });
      
      if (phone) {
        console.log('   ⚠️  Phone number already exists:', phoneNumberId);
      } else {
        phone = await PhoneNumber.create({
          accountId: 'pixels_internal',
          phoneNumberId: phoneNumberId,
          wabaId: wabaId,
          accessToken: accessToken,
          displayName: 'Pixels WhatsApp',
          displayPhone: '+918087131777', // Update with your actual number
          isActive: true
        });
        console.log('   ✅ Phone number created:', phoneNumberId);
      }
      console.log('');
    }

    // 3. Create Sample Template
    console.log('3️⃣ CREATING SAMPLE TEMPLATE');
    console.log('─'.repeat(50));
    
    let template = await Template.findOne({ accountId, name: 'hello_world' });
    
    if (template) {
      console.log('   ⚠️  Template already exists: hello_world');
    } else {
      template = await Template.create({
        accountId: 'pixels_internal',
        name: 'hello_world',
        language: 'en',
        category: 'UTILITY',
        content: 'Hello World',
        variables: [], // No variables
        components: [],
        status: 'approved',
        approvedAt: new Date()
      });
      console.log('   ✅ Template created: hello_world');
    }
    console.log('');

    // 4. Create Sample Contact
    console.log('4️⃣ CREATING SAMPLE CONTACT');
    console.log('─'.repeat(50));
    
    const testPhone = '918087131777'; // Your test number
    
    let contact = await Contact.findOne({ accountId, whatsappNumber: testPhone });
    
    if (contact) {
      console.log('   ⚠️  Contact already exists:', testPhone);
    } else {
      contact = await Contact.create({
        accountId: 'pixels_internal',
        name: 'Test User',
        phone: '+918087131777',
        whatsappNumber: testPhone,
        email: 'test@example.com',
        type: 'customer',
        isOptedIn: true,
        optInDate: new Date()
      });
      console.log('   ✅ Contact created:', testPhone);
    }
    console.log('');

    // 5. Create Sample Keyword Rule
    console.log('5️⃣ CREATING KEYWORD RULE');
    console.log('─'.repeat(50));
    
    let rule = await KeywordRule.findOne({ accountId, name: 'Welcome Message' });
    
    if (rule) {
      console.log('   ⚠️  Keyword rule already exists: Welcome Message');
    } else {
      rule = await KeywordRule.create({
        accountId: 'pixels_internal',
        phoneNumberId: phoneNumberId,
        name: 'Welcome Message',
        description: 'Auto-reply to greetings',
        keywords: ['hi', 'hello', 'hey'],
        matchType: 'contains',
        replyType: 'text',
        replyContent: {
          text: '👋 Hello! Thanks for contacting Pixels WhatsApp Platform. How can we help you today?'
        },
        isActive: true
      });
      console.log('   ✅ Keyword rule created: Welcome Message');
    }
    console.log('');

    // Summary
    console.log('═'.repeat(50));
    console.log('✅ TEST DATA SETUP COMPLETE');
    console.log('═'.repeat(50));
    console.log('');
    console.log('Created:');
    console.log('   ✅ Account: pixels_internal');
    console.log('   ✅ Phone Number:', phoneNumberId || 'N/A');
    console.log('   ✅ Template: hello_world');
    console.log('   ✅ Contact:', testPhone);
    console.log('   ✅ Keyword Rule: Welcome Message');
    console.log('');
    console.log('🚀 Next Step: Test sending a message');
    console.log('   Run: node test-send-message.js');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
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
createTestData().catch(console.error);
