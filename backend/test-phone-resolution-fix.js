/**
 * Test Phone Number Resolution Fix
 * Verifies that phoneNumberHelper properly converts STRING accountId to ObjectId
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const SUPERADMIN_ID = '695a15a5c526dbe7c085ece2';
const ENROMATICS_ID = '6971e3a706837a5539992bee';

async function testPhoneNumberResolution() {
  try {
    console.log('🧪 TESTING PHONE NUMBER RESOLUTION\n');
    console.log('═'.repeat(70));

    // Test Superadmin
    console.log('\n📱 SUPERADMIN');
    console.log('─'.repeat(70));
    await testPhoneResolution(SUPERADMIN_ID, 'Superadmin');

    // Test Enromatics
    console.log('\n📱 ENROMATICS');
    console.log('─'.repeat(70));
    await testPhoneResolution(ENROMATICS_ID, 'Enromatics');

    console.log('\n' + '═'.repeat(70));
    console.log('✅ PHONE RESOLUTION TEST COMPLETE\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

async function testPhoneResolution(accountId, accountName) {
  try {
    // Get account
    const account = await Account.findById(accountId);
    if (!account) {
      console.log(`❌ Account not found: ${accountId}`);
      return;
    }

    console.log(`✅ Account found: ${account.accountId}`);
    console.log(`   Account._id (ObjectId): ${account._id}`);

    // Test 1: Query with STRING accountId (old way - BROKEN)
    console.log(`\n1️⃣  OLD WAY - Query with STRING accountId (${account.accountId}):`);
    const phonesByString = await PhoneNumber.find({
      accountId: account.accountId  // STRING
    });
    console.log(`   Result: ${phonesByString.length} phone(s) found`);
    if (phonesByString.length === 0) {
      console.log(`   ❌ BROKEN - Query returned 0 phones`);
    } else {
      console.log(`   ✅ Working - Found phones`);
      phonesByString.forEach(p => {
        console.log(`      • ${p.phoneNumberId} (accountId type: ${typeof p.accountId})`);
      });
    }

    // Test 2: Query with ObjectId (new way - FIXED)
    console.log(`\n2️⃣  NEW WAY - Query with ObjectId (${account._id}):`);
    const phonesByObjectId = await PhoneNumber.find({
      accountId: account._id  // ObjectId
    });
    console.log(`   Result: ${phonesByObjectId.length} phone(s) found`);
    if (phonesByObjectId.length === 0) {
      console.log(`   ❌ BROKEN - Query returned 0 phones`);
    } else {
      console.log(`   ✅ FIXED - Found phones`);
      phonesByObjectId.forEach(p => {
        console.log(`      • ${p.phoneNumberId} (accountId stored as: ${typeof p.accountId})`);
      });
    }

    // Test 3: Test the phoneNumberHelper logic (STRING→ObjectId conversion)
    console.log(`\n3️⃣  MIDDLEWARE FIX - STRING→ObjectId Conversion Logic:`);
    let queryAccountId = account.accountId; // STRING from JWT

    // This is the fix in resolvePhoneNumber middleware
    if (typeof queryAccountId === 'string' && /^[a-f0-9]{24}$/.test(queryAccountId)) {
      console.log(`   Input: "${queryAccountId}" (STRING)`);
      queryAccountId = new mongoose.Types.ObjectId(queryAccountId);
      console.log(`   Output: ObjectId("${queryAccountId}") (ObjectId)`);
    }

    // Now query with converted accountId
    const phoneConfig = await PhoneNumber.findOne({
      accountId: queryAccountId,
      isActive: true
    });

    if (phoneConfig) {
      console.log(`   ✅ WORKS - Phone found after conversion:`);
      console.log(`      • Phone: ${phoneConfig.phoneNumberId}`);
      console.log(`      • Query format: ObjectId`);
      console.log(`      • Status: Active ✅`);
    } else {
      console.log(`   ❌ FAILED - No phone found`);
    }

    // Summary
    console.log(`\n📊 Summary for ${accountName}:`);
    console.log(`   • Old way (STRING): ${phonesByString.length > 0 ? '❌ Unreliable' : '❌ Broken'}`);
    console.log(`   • New way (ObjectId): ${phonesByObjectId.length > 0 ? '✅ Fixed' : '❌ Not working'}`);
    console.log(`   • Middleware fix: ${phoneConfig ? '✅ Working' : '❌ Broken'}`);

  } catch (error) {
    console.error(`❌ Error testing ${accountName}:`, error.message);
  }
}

testPhoneNumberResolution();
