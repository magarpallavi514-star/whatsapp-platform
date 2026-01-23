#!/usr/bin/env node
/**
 * Quick Test: Check if WABA Accounts Exist
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';

async function testWABAs() {
  try {
    console.log('\n🔍 CHECKING WABA EXISTENCE\n');
    
    // Check Superadmin WABA
    console.log('1️⃣  SUPERADMIN WABA');
    console.log('─'.repeat(60));
    const superadminPhone = await PhoneNumber.findOne({
      phoneNumberId: '889344924259692'
    });
    if (superadminPhone) {
      console.log('✅ FOUND');
      console.log('   Phone ID: 889344924259692');
      console.log('   AccountId: ' + superadminPhone.accountId);
      console.log('   AccountId Type: ' + (superadminPhone.accountId instanceof mongoose.Types.ObjectId ? 'ObjectId' : 'String'));
      console.log('   WABA ID: ' + superadminPhone.wabaId);
      console.log('   Active: ' + superadminPhone.isActive);
      
      // Verify account exists
      const acc = await Account.findOne({
        $or: [
          { _id: superadminPhone.accountId },
          { accountId: 'pixels_internal' }
        ]
      });
      if (acc) {
        console.log('   Account: ✅ ' + acc.accountId + ' (' + acc.name + ')');
      } else {
        console.log('   Account: ❌ NOT FOUND');
      }
    } else {
      console.log('❌ NOT FOUND');
    }
    
    // Check Enromatics WABA
    console.log('\n2️⃣  ENROMATICS WABA');
    console.log('─'.repeat(60));
    const enromaticsPhone = await PhoneNumber.findOne({
      phoneNumberId: '1003427786179738'
    });
    if (enromaticsPhone) {
      console.log('✅ FOUND');
      console.log('   Phone ID: 1003427786179738');
      console.log('   AccountId: ' + enromaticsPhone.accountId);
      console.log('   AccountId Type: ' + (enromaticsPhone.accountId instanceof mongoose.Types.ObjectId ? 'ObjectId' : 'String'));
      console.log('   WABA ID: ' + enromaticsPhone.wabaId);
      console.log('   Active: ' + enromaticsPhone.isActive);
      
      // Verify account exists
      const acc = await Account.findOne({
        $or: [
          { _id: enromaticsPhone.accountId },
          { accountId: 'eno_2600003' }
        ]
      });
      if (acc) {
        console.log('   Account: ✅ ' + acc.accountId + ' (' + acc.name + ')');
      } else {
        console.log('   Account: ❌ NOT FOUND');
      }
    } else {
      console.log('❌ NOT FOUND');
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('SUMMARY:');
    if (superadminPhone && enromaticsPhone) {
      console.log('✅ Both WABAs exist in database');
      console.log('✅ Ready to proceed with message sending');
    } else if (superadminPhone) {
      console.log('⚠️  Only Superadmin WABA exists');
      console.log('❌ Enromatics WABA is MISSING');
    } else if (enromaticsPhone) {
      console.log('⚠️  Only Enromatics WABA exists');
      console.log('❌ Superadmin WABA is MISSING');
    } else {
      console.log('❌ BOTH WABAs are MISSING!');
      console.log('⚠️  Need to re-add phone numbers');
    }
    console.log('═'.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testWABAs();
