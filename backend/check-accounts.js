#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';

dotenv.config();

async function checkAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    console.log('📱 PHONE NUMBERS IN DATABASE:');
    console.log('═'.repeat(60));
    const phones = await PhoneNumber.find().lean();
    
    if (phones.length === 0) {
      console.log('❌ No phone numbers found in database!');
    } else {
      phones.forEach(phone => {
        console.log(`\nAccount ID: ${phone.accountId}`);
        console.log(`Display Name: ${phone.displayName}`);
        console.log(`Phone: ${phone.displayPhone}`);
        console.log(`Phone Number ID: ${phone.phoneNumberId}`);
        console.log(`WABA ID: ${phone.wabaId}`);
        console.log(`Status: ${phone.isActive ? '✅ Active' : '❌ Inactive'}`);
        console.log('-'.repeat(60));
      });
    }

    console.log('\n👥 ACCOUNTS IN DATABASE:');
    console.log('═'.repeat(60));
    const accounts = await Account.find().select('accountId name email type plan status apiKeyPrefix').lean();
    
    if (accounts.length === 0) {
      console.log('❌ No accounts found in database!');
    } else {
      accounts.forEach(acc => {
        console.log(`\nAccount ID: ${acc.accountId}`);
        console.log(`Name: ${acc.name}`);
        console.log(`Email: ${acc.email}`);
        console.log(`Type: ${acc.type}`);
        console.log(`Plan: ${acc.plan}`);
        console.log(`Status: ${acc.status}`);
        console.log(`API Key: ${acc.apiKeyPrefix || 'Not generated'}`);
        console.log('-'.repeat(60));
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAccounts();
