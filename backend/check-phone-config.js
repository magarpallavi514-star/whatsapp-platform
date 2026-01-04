#!/usr/bin/env node

/**
 * Check if WhatsApp Business Number is configured
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

console.log('🔍 ========== CHECKING WHATSAPP CONFIGURATION ==========\n');

async function checkPhoneNumber() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check for 9766504856
    const testNumber = '9766504856';
    const phoneConfig = await PhoneNumber.findOne({ 
      $or: [
        { phoneNumber: testNumber },
        { phoneNumber: '+91' + testNumber },
        { phoneNumber: '+' + testNumber },
        { displayPhoneNumber: testNumber }
      ]
    });
    
    console.log('📱 Searching for number:', testNumber);
    console.log('═'.repeat(60));
    
    if (phoneConfig) {
      console.log('✅ PHONE NUMBER FOUND IN DATABASE!');
      console.log('═'.repeat(60));
      console.log('Phone Number:', phoneConfig.phoneNumber);
      console.log('Phone Number ID:', phoneConfig.phoneNumberId);
      console.log('WABA ID:', phoneConfig.wabaId);
      console.log('Display Name:', phoneConfig.displayName);
      console.log('Status:', phoneConfig.isActive ? '✅ Active' : '❌ Inactive');
      console.log('Account ID:', phoneConfig.accountId);
      console.log('═'.repeat(60));
      
      console.log('\n✅ YOUR NUMBER IS CONFIGURED!');
      console.log('\n📲 TO TEST:');
      console.log('1. From ANY other WhatsApp number');
      console.log('2. Send a message TO: +91 9766504856');
      console.log('3. Watch backend logs for webhook');
      console.log('4. Run: node check-latest-message.js');
      
    } else {
      console.log('❌ NUMBER NOT FOUND IN DATABASE');
      console.log('\n🔧 Let me check what numbers ARE configured...\n');
      
      const allNumbers = await PhoneNumber.find({});
      
      if (allNumbers.length === 0) {
        console.log('⚠️  NO PHONE NUMBERS CONFIGURED YET!');
        console.log('\n💡 You need to add your WhatsApp Business number first.');
        console.log('\n📋 Quick Setup:');
        console.log('1. Get your Phone Number ID from Meta dashboard');
        console.log('2. Run the setup script to add it to database');
        console.log('3. Or use the API: POST /api/phone-numbers/connect');
      } else {
        console.log('📱 CONFIGURED NUMBERS:');
        console.log('═'.repeat(60));
        allNumbers.forEach((phone, index) => {
          console.log(`${index + 1}. ${phone.phoneNumber || 'N/A'}`);
          console.log(`   Phone Number ID: ${phone.phoneNumberId}`);
          console.log(`   Display Name: ${phone.displayName || 'N/A'}`);
          console.log(`   Account: ${phone.accountId}`);
          console.log(`   Status: ${phone.isActive ? 'Active' : 'Inactive'}`);
          console.log();
        });
        console.log('═'.repeat(60));
      }
    }
    
    // Also check .env configuration
    console.log('\n📋 .ENV CONFIGURATION:');
    console.log('═'.repeat(60));
    console.log('Phone Number ID:', process.env.WHATSAPP_PHONE_NUMBER_ID || '❌ Not set');
    console.log('WABA ID:', process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '❌ Not set');
    console.log('Access Token:', process.env.WHATSAPP_ACCESS_TOKEN ? '✅ Set' : '❌ Not set');
    console.log('Verify Token:', process.env.META_VERIFY_TOKEN || '❌ Not set');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkPhoneNumber();
