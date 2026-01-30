#!/usr/bin/env node

/**
 * Check all accounts to see if new one was created
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const mongoUri = process.env.MONGODB_URI;

async function checkAllAccounts() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('👥 ALL ACCOUNTS WITH NEW PHONE NUMBER');
    console.log('='.repeat(70) + '\n');
    
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    
    // Search for the new phone number in ALL accounts
    const phoneWithNewNumber = await db.collection('phonenumbers')
      .findOne({ displayPhone: /919766504856/ });
    
    if (phoneWithNewNumber) {
      console.log('✅ NEW PHONE NUMBER FOUND!\n');
      console.log(`Phone: ${phoneWithNewNumber.displayPhone}`);
      console.log(`Phone ID: ${phoneWithNewNumber.phoneNumberId}`);
      console.log(`Account ID: ${phoneWithNewNumber.accountId}`);
      console.log(`WABA ID: ${phoneWithNewNumber.wabaId}`);
      console.log(`Created: ${phoneWithNewNumber.createdAt}`);
      
      // Find the account
      const account = await db.collection('accounts').findOne({
        accountId: phoneWithNewNumber.accountId
      });
      
      if (account) {
        console.log(`\nAccount Details:`);
        console.log(`  Name: ${account.name}`);
        console.log(`  Email: ${account.email}`);
        console.log(`  WABA ID: ${account.wabaId}`);
        console.log(`  Business ID: ${account.businessId || '⏳ WAITING'}`);
      }
      
      console.log('\n' + '='.repeat(70) + '\n');
      process.exit(0);
    }
    
    console.log('❌ Phone number +919766504856 NOT FOUND in ANY account\n');
    
    // Show all accounts with recent phone numbers
    console.log('📋 All accounts with phone numbers:\n');
    
    const allPhones = await db.collection('phonenumbers')
      .aggregate([
        {
          $group: {
            _id: '$accountId',
            phoneNumbers: { $push: '$displayPhone' },
            wabaId: { $first: '$wabaId' }
          }
        },
        { $sort: { _id: -1 } }
      ])
      .toArray();
    
    for (const phoneGroup of allPhones) {
      const account = await db.collection('accounts').findOne({
        accountId: phoneGroup._id
      });
      
      if (account) {
        console.log(`${account.name} (${account.email})`);
        console.log(`  Account ID: ${phoneGroup._id}`);
        console.log(`  WABA ID: ${phoneGroup.wabaId}`);
        console.log(`  Phones: ${phoneGroup.phoneNumbers.join(', ')}`);
        console.log('');
      }
    }
    
    console.log('='.repeat(70) + '\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAllAccounts();
