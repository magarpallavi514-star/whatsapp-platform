#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

async function updatePhoneNumber() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Find the phone number entry
    const phone = await PhoneNumber.findOne({ 
      wabaId: '1536545574042607',
      phoneNumberId: '889344924259692'
    });

    if (!phone) {
      console.log('❌ Phone number not found in database!');
      await mongoose.connection.close();
      return;
    }

    console.log('📱 CURRENT PHONE NUMBER:');
    console.log('═'.repeat(60));
    console.log('Display Phone:', phone.displayPhone);
    console.log('Display Name:', phone.displayName);
    console.log('Phone Number ID:', phone.phoneNumberId);
    console.log('WABA ID:', phone.wabaId);
    console.log('');

    console.log('🔄 UPDATING TO CORRECT NUMBER...');
    console.log('═'.repeat(60));
    
    phone.displayPhone = '+919766504856';
    phone.displayName = 'Pixels WhatsApp Business';
    await phone.save();

    console.log('✅ Updated successfully!');
    console.log('');
    console.log('📱 NEW PHONE NUMBER:');
    console.log('═'.repeat(60));
    console.log('Display Phone:', phone.displayPhone);
    console.log('Display Name:', phone.displayName);
    console.log('Phone Number ID:', phone.phoneNumberId);
    console.log('WABA ID:', phone.wabaId);
    console.log('');

    await mongoose.connection.close();
    console.log('✅ Done! Database updated.');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updatePhoneNumber();
