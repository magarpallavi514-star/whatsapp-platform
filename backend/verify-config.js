#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';

dotenv.config();

async function verifyConfiguration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    console.log('🔍 CHECKING CONFIGURATION FOR ENROMATICS CONNECTION');
    console.log('═'.repeat(70));
    console.log('');

    // Check for the specific phone number ID and WABA ID
    const phone = await PhoneNumber.findOne({ 
      phoneNumberId: '889344924259692',
      wabaId: '1536545574042607'
    }).lean();

    if (!phone) {
      console.log('❌ PHONE NUMBER NOT FOUND!');
      console.log('   Phone Number ID: 889344924259692');
      console.log('   Business Account ID: 1536545574042607');
      console.log('');
      await mongoose.connection.close();
      return;
    }

    console.log('✅ PHONE NUMBER FOUND IN DATABASE');
    console.log('─'.repeat(70));
    console.log('Display Phone Number:', phone.displayPhone);
    console.log('Display Name:', phone.displayName);
    console.log('Phone Number ID:', phone.phoneNumberId);
    console.log('Business Account ID (WABA):', phone.wabaId);
    console.log('Account ID:', phone.accountId);
    console.log('Status:', phone.isActive ? '✅ Active' : '❌ Inactive');
    console.log('Has Access Token:', phone.accessToken ? '✅ Yes' : '❌ No');
    console.log('Created At:', phone.createdAt);
    console.log('Updated At:', phone.updatedAt);
    console.log('');

    // Check the associated account
    const account = await Account.findOne({ accountId: phone.accountId }).select('accountId name email type status plan apiKeyPrefix').lean();

    if (account) {
      console.log('👤 ASSOCIATED ACCOUNT');
      console.log('─'.repeat(70));
      console.log('Account ID:', account.accountId);
      console.log('Name:', account.name);
      console.log('Email:', account.email);
      console.log('Type:', account.type);
      console.log('Plan:', account.plan);
      console.log('Status:', account.status);
      console.log('API Key Prefix:', account.apiKeyPrefix || 'Not generated');
      console.log('');
    }

    console.log('📊 ENROMATICS CONNECTION STATUS');
    console.log('─'.repeat(70));
    
    if (phone.displayPhone === '+919766504856') {
      console.log('✅ Phone Number: MATCHES (+919766504856)');
    } else {
      console.log('❌ Phone Number: MISMATCH');
      console.log('   Expected: +919766504856');
      console.log('   Found:', phone.displayPhone);
    }

    if (phone.phoneNumberId === '889344924259692') {
      console.log('✅ Phone Number ID: MATCHES (889344924259692)');
    } else {
      console.log('❌ Phone Number ID: MISMATCH');
    }

    if (phone.wabaId === '1536545574042607') {
      console.log('✅ Business Account ID: MATCHES (1536545574042607)');
    } else {
      console.log('❌ Business Account ID: MISMATCH');
    }

    if (phone.isActive) {
      console.log('✅ Status: ACTIVE');
    } else {
      console.log('❌ Status: INACTIVE');
    }

    if (account && account.status === 'active') {
      console.log('✅ Account Status: ACTIVE');
    } else {
      console.log('❌ Account Status: NOT ACTIVE');
    }

    console.log('');
    console.log('═'.repeat(70));
    
    const allGood = 
      phone.displayPhone === '+919766504856' &&
      phone.phoneNumberId === '889344924259692' &&
      phone.wabaId === '1536545574042607' &&
      phone.isActive &&
      account && account.status === 'active';

    if (allGood) {
      console.log('🎉 ALL CHECKS PASSED!');
      console.log('   Enromatics CAN connect to this platform with these IDs');
      console.log('');
      console.log('   Use in Enromatics:');
      console.log('   - Phone Number ID: 889344924259692');
      console.log('   - Business Account ID: 1536545574042607');
      console.log('   - Phone: +919766504856');
    } else {
      console.log('⚠️  SOME CHECKS FAILED!');
      console.log('   Review the issues above and fix them.');
    }
    console.log('═'.repeat(70));

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyConfiguration();
