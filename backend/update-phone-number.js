#!/usr/bin/env node

/**
 * Update Phone Number with actual number 9766504856
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

console.log('🔧 ========== UPDATING PHONE NUMBER ==========\n');

async function updatePhoneNumber() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const phoneNumberId = '889344924259692';
    const actualNumber = '+919766504856'; // India format
    
    console.log('📱 Updating Phone Number ID:', phoneNumberId);
    console.log('📱 Setting actual number:', actualNumber);
    console.log();
    
    const updated = await PhoneNumber.findOneAndUpdate(
      { phoneNumberId },
      { 
        phoneNumber: actualNumber,
        displayPhoneNumber: actualNumber,
        $set: { 
          updatedAt: new Date() 
        }
      },
      { new: true }
    );
    
    if (updated) {
      console.log('✅ PHONE NUMBER UPDATED SUCCESSFULLY!');
      console.log('═'.repeat(60));
      console.log('Phone Number:', updated.phoneNumber);
      console.log('Display Number:', updated.displayPhoneNumber);
      console.log('Phone Number ID:', updated.phoneNumberId);
      console.log('Display Name:', updated.displayName);
      console.log('Account:', updated.accountId);
      console.log('Status:', updated.isActive ? 'Active ✅' : 'Inactive ❌');
      console.log('═'.repeat(60));
      
      console.log('\n🎉 ALL SET! NOW YOU CAN TEST:');
      console.log('═'.repeat(60));
      console.log('1. From ANY other WhatsApp number (your personal phone)');
      console.log('2. Send a message TO: +91 9766504856');
      console.log('3. Send an image/photo');
      console.log('4. Watch backend logs for webhook notification');
      console.log('5. Run: node check-latest-message.js');
      console.log('═'.repeat(60));
      
    } else {
      console.log('❌ Phone number not found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

updatePhoneNumber();
