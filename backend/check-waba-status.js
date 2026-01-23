#!/usr/bin/env node
/**
 * Check WABA Connection Status
 * Verify if phones are still configured for both accounts
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const SUPERADMIN_ID = '695a15a5c526dbe7c085ece2';
const ENROMATICS_ID = '6971e3a706837a5539992bee';

async function checkWABAConnections() {
  try {
    console.log('\n🔍 CHECKING WABA CONNECTIONS\n');
    console.log('═'.repeat(70));

    // Check Superadmin
    console.log('\n📱 SUPERADMIN');
    console.log('─'.repeat(70));
    await checkAccountWABA(SUPERADMIN_ID, 'Superadmin');

    // Check Enromatics
    console.log('\n📱 ENROMATICS');
    console.log('─'.repeat(70));
    await checkAccountWABA(ENROMATICS_ID, 'Enromatics');

    console.log('\n' + '═'.repeat(70));
    console.log('✅ CHECK COMPLETE\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

async function checkAccountWABA(accountId, accountName) {
  try {
    // Get account
    const account = await Account.findById(accountId);
    if (!account) {
      console.log(`❌ Account not found: ${accountId}`);
      return;
    }
    console.log(`✅ Account found: ${account.accountId}`);
    console.log(`   Account._id: ${account._id}`);

    // Query 1: By ObjectId
    console.log(`\n1️⃣  Query by ObjectId (_id):`);
    const phonesByObjectId = await PhoneNumber.find({ 
      accountId: account._id
    });
    console.log(`   Found: ${phonesByObjectId.length} phone(s)`);
    phonesByObjectId.forEach(p => {
      console.log(`   • ${p.phoneNumberId} (accountId stored as: ${typeof p.accountId})`);
      console.log(`     WABA: ${p.wabaId}, Active: ${p.isActive}`);
    });

    // Query 2: By STRING accountId
    console.log(`\n2️⃣  Query by STRING accountId:`);
    const phonesByString = await PhoneNumber.find({ 
      accountId: account.accountId
    });
    console.log(`   Found: ${phonesByString.length} phone(s)`);
    phonesByString.forEach(p => {
      console.log(`   • ${p.phoneNumberId} (accountId stored as: ${typeof p.accountId})`);
      console.log(`     WABA: ${p.wabaId}, Active: ${p.isActive}`);
    });

    // Query 3: Mixed query (both)
    console.log(`\n3️⃣  Query by both formats ($or):`);
    const phonesMixed = await PhoneNumber.find({ 
      $or: [
        { accountId: account._id },
        { accountId: account.accountId }
      ]
    });
    console.log(`   Found: ${phonesMixed.length} phone(s)`);
    phonesMixed.forEach(p => {
      console.log(`   • ${p.phoneNumberId} (accountId: ${p.accountId})`);
      console.log(`     WABA: ${p.wabaId}, Active: ${p.isActive}`);
      console.log(`     Stored type: ${p.accountId instanceof mongoose.Types.ObjectId ? 'ObjectId' : 'String'}`);
    });

    // Summary
    console.log(`\n📊 WABA Status for ${accountName}:`);
    if (phonesMixed.length === 0) {
      console.log(`   ❌ NO PHONES FOUND - WABA DISCONNECTED`);
    } else {
      const activePhones = phonesMixed.filter(p => p.isActive);
      console.log(`   ✅ Phones found: ${phonesMixed.length}`);
      console.log(`   ✅ Active phones: ${activePhones.length}`);
      activePhones.forEach(p => {
        console.log(`      • ${p.phoneNumberId} - ACTIVE ✅`);
      });
    }

  } catch (error) {
    console.error(`❌ Error checking ${accountName}:`, error.message);
  }
}

checkWABAConnections();
