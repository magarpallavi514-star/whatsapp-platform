#!/usr/bin/env node

/**
 * Test Send Message Script
 * Tests the WhatsApp service end-to-end with real Meta API
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import whatsappService from './src/services/whatsappService.js';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Message from './src/models/Message.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

async function testSendMessage() {
  console.log('\n🧪 ========== TEST SEND MESSAGE ==========\n');
  
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.name);
    console.log('');

    // Get test account
    console.log('1️⃣ FETCHING TEST ACCOUNT');
    console.log('─'.repeat(50));
    
    const account = await Account.findOne({ accountId: 'pixels_internal' });
    
    if (!account) {
      console.log('❌ Test account not found!');
      console.log('   Run: node create-test-data.js first');
      return;
    }
    
    console.log('   ✅ Account found:', account.accountId);
    console.log('   Name:', account.name);
    console.log('   Plan:', account.plan);
    console.log('');

    // Get phone number
    console.log('2️⃣ FETCHING PHONE NUMBER');
    console.log('─'.repeat(50));
    
    const phone = await PhoneNumber.findOne({ 
      accountId: account.accountId,
      isActive: true 
    });
    
    if (!phone) {
      console.log('❌ Phone number not found!');
      console.log('   Run: node create-test-data.js first');
      return;
    }
    
    console.log('   ✅ Phone number found:', phone.phoneNumberId);
    console.log('   Display Name:', phone.displayName);
    console.log('   Status:', phone.isActive ? 'Active' : 'Inactive');
    console.log('');

    // Test recipient (your WhatsApp number)
    const testRecipient = '918087131777'; // Change this to your number
    
    console.log('3️⃣ SENDING TEST MESSAGE');
    console.log('─'.repeat(50));
    console.log('   Account ID:', account.accountId);
    console.log('   Phone Number ID:', phone.phoneNumberId);
    console.log('   Recipient:', testRecipient);
    console.log('   Message: "🚀 Test from WhatsApp Platform!"');
    console.log('');
    console.log('   Sending...');
    console.log('');

    // Send the message
    try {
      const result = await whatsappService.sendTextMessage(
        account.accountId,
        phone.phoneNumberId,
        testRecipient,
        '🚀 Test from WhatsApp Platform!\n\nThis message confirms that:\n✅ Database is connected\n✅ Models are working\n✅ Service is functional\n✅ Meta API is integrated\n\nYour platform is ready! 🎉',
        { campaign: 'test' }
      );

      console.log('');
      console.log('═'.repeat(50));
      console.log('✅ MESSAGE SENT SUCCESSFULLY!');
      console.log('═'.repeat(50));
      console.log('');
      console.log('Result:');
      console.log('   Message ID:', result.messageId);
      console.log('   WhatsApp ID:', result.waMessageId);
      console.log('   Status:', result.success ? '✅ Success' : '❌ Failed');
      console.log('');

      // Fetch the message from DB
      const savedMessage = await Message.findById(result.messageId);
      
      if (savedMessage) {
        console.log('Database Record:');
        console.log('   Account ID:', savedMessage.accountId);
        console.log('   Phone Number ID:', savedMessage.phoneNumberId);
        console.log('   Recipient:', savedMessage.recipientPhone);
        console.log('   Type:', savedMessage.messageType);
        console.log('   Status:', savedMessage.status);
        console.log('   Sent At:', savedMessage.sentAt);
        console.log('   Campaign:', savedMessage.campaign);
        console.log('');
      }

      console.log('🎉 PLATFORM IS FULLY FUNCTIONAL!');
      console.log('');
      console.log('Check your WhatsApp for the test message.');
      console.log('');

    } catch (sendError) {
      console.log('');
      console.log('═'.repeat(50));
      console.log('❌ MESSAGE SEND FAILED');
      console.log('═'.repeat(50));
      console.log('');
      console.log('Error:', sendError.message);
      console.log('');
      
      if (sendError.message.includes('not configured')) {
        console.log('Possible Issues:');
        console.log('   1. Phone number not configured');
        console.log('   2. Access token expired');
        console.log('   3. Run: node create-test-data.js');
      } else if (sendError.message.includes('Invalid access token')) {
        console.log('Possible Issues:');
        console.log('   1. Access token in .env is expired');
        console.log('   2. Get new token from Meta Business Suite');
        console.log('   3. Update WHATSAPP_ACCESS_TOKEN in .env');
      } else {
        console.log('Possible Issues:');
        console.log('   1. Invalid phone number format');
        console.log('   2. Recipient not on WhatsApp');
        console.log('   3. Meta API error');
        console.log('   4. Check Meta Business Suite for restrictions');
      }
      console.log('');
    }

    // Show stats
    console.log('4️⃣ PLATFORM STATS');
    console.log('─'.repeat(50));
    
    const stats = await whatsappService.getStats(account.accountId);
    console.log('   Total Messages:', stats.totalMessages);
    console.log('   Sent:', stats.sentMessages);
    console.log('   Delivered:', stats.deliveredMessages);
    console.log('   Failed:', stats.failedMessages);
    console.log('   Today:', stats.todayMessages);
    console.log('   Delivery Rate:', stats.deliveryRate);
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('');
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run test
testSendMessage().catch(console.error);
