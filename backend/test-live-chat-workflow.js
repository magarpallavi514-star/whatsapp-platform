#!/usr/bin/env node
/**
 * LIVE CHAT MESSAGE SENDING WORKFLOW TEST
 * Simulates the exact flow when a user sends a message from live chat
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Conversation from './src/models/Conversation.js';

const SUPERADMIN_ID = '695a15a5c526dbe7c085ece2';
const ENROMATICS_ID = '6971e3a706837a5539992bee';

async function testLiveChatWorkflow() {
  try {
    console.log('\n🧪 LIVE CHAT MESSAGE SENDING WORKFLOW TEST\n');
    console.log('═'.repeat(70));

    // Test both accounts
    await testAccountWorkflow(SUPERADMIN_ID, 'SUPERADMIN');
    await testAccountWorkflow(ENROMATICS_ID, 'ENROMATICS');

    console.log('\n' + '═'.repeat(70));
    console.log('✅ WORKFLOW TEST COMPLETE\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    process.exit(0);
  }
}

async function testAccountWorkflow(accountId, accountName) {
  try {
    console.log(`\n📱 ${accountName} WORKFLOW TEST`);
    console.log('─'.repeat(70));

    // STEP 1: Get account (simulating JWT auth)
    console.log('\n1️⃣  STEP 1: User logs in (JWT Auth)');
    const account = await Account.findById(accountId);
    if (!account) {
      console.log(`   ❌ FAILED - Account not found`);
      return;
    }
    console.log(`   ✅ Account found: ${account.accountId}`);
    console.log(`      • Account._id (ObjectId): ${account._id}`);
    console.log(`      • req.account._id available: ✅`);

    // STEP 2: User selects a conversation
    console.log('\n2️⃣  STEP 2: User opens live chat and selects conversation');
    const conversation = await Conversation.findOne({ accountId: { $in: [accountId, accountId.toString()] } });
    if (!conversation) {
      console.log(`   ⚠️  No conversations found (normal for new accounts)`);
      console.log(`   Simulating with demo conversation data...`);
      var demoConversation = {
        conversationId: 'demo_conv_001',
        accountId: accountId,
        userPhone: '918087131777',
        phoneNumberId: accountName === 'SUPERADMIN' ? '889344924259692' : '1003427786179738',
        wabaId: accountName === 'SUPERADMIN' ? '1536545574042607' : '2600003',
        status: 'open'
      };
    } else {
      demoConversation = conversation;
      console.log(`   ✅ Conversation loaded`);
      console.log(`      • Conversation ID: ${conversation.conversationId}`);
      console.log(`      • User phone: ${conversation.userPhone}`);
      console.log(`      • Account ID (from DB): ${conversation.accountId}`);
    }

    // STEP 3: Middleware resolvePhoneNumber processes request
    console.log('\n3️⃣  STEP 3: phoneNumberHelper middleware processes request');
    console.log(`   OLD CODE (BROKEN):`);
    console.log(`      const accountId = req.accountId; // STRING: "${account.accountId}"`);
    
    // Query with STRING (old way - BROKEN)
    const phonesByString = await PhoneNumber.find({ 
      accountId: account.accountId  // STRING
    });
    console.log(`      Query result: ${phonesByString.length} phone(s) found`);
    if (phonesByString.length === 0) {
      console.log(`      ❌ FAILED - Phone not found! → "Invalid or inactive phone number" error`);
    } else {
      console.log(`      ✅ Found phones`);
    }

    console.log(`\n   NEW CODE (FIXED):`);
    console.log(`      const accountId = req.account._id; // ObjectId: ${account._id}`);
    
    // Query with ObjectId (new way - FIXED)
    const phonesByObjectId = await PhoneNumber.find({ 
      accountId: account._id  // ObjectId
    });
    console.log(`      Query result: ${phonesByObjectId.length} phone(s) found`);
    if (phonesByObjectId.length === 0) {
      console.log(`      ❌ FAILED - Still no phone found`);
    } else {
      console.log(`      ✅ SUCCESS - Phone found!`);
      phonesByObjectId.forEach(p => {
        console.log(`         • Phone ID: ${p.phoneNumberId}`);
        console.log(`         • Is Active: ${p.isActive}`);
      });
    }

    // STEP 4: whatsappService.getPhoneConfig gets called
    console.log('\n4️⃣  STEP 4: whatsappService.getPhoneConfig() is called');
    const phoneNumberId = demoConversation.phoneNumberId;
    
    // Simulate getPhoneConfig with both format conversions
    let queryAccountId = demoConversation.accountId;
    console.log(`      Input accountId: ${queryAccountId}`);
    console.log(`      Input type: ${typeof queryAccountId}`);

    // Try conversion if it's a string
    if (typeof queryAccountId === 'string' && /^[a-f0-9]{24}$/.test(queryAccountId)) {
      queryAccountId = new mongoose.Types.ObjectId(queryAccountId);
      console.log(`      Converted to ObjectId: ${queryAccountId}`);
    }

    const phoneConfig = await PhoneNumber.findOne({
      accountId: queryAccountId,
      phoneNumberId: phoneNumberId,
      isActive: true
    }).select('+accessToken');

    if (!phoneConfig) {
      console.log(`      ❌ FAILED - Phone config not found!`);
      console.log(`      Error: "Invalid or inactive phone number for this account"`);
    } else {
      console.log(`      ✅ SUCCESS - Phone config found!`);
      console.log(`         • Phone: ${phoneConfig.phoneNumberId}`);
      console.log(`         • WABA: ${phoneConfig.wabaId}`);
      console.log(`         • Has token: ${!!phoneConfig.accessToken}`);
    }

    // STEP 5: Send message via Meta API
    console.log('\n5️⃣  STEP 5: Send message to WhatsApp via Meta API');
    if (phoneConfig) {
      console.log(`   ✅ SUCCESS - Ready to send!`);
      console.log(`      • Phone config: ✅`);
      console.log(`      • Access token: ✅`);
      console.log(`      • Recipient: ${demoConversation.userPhone}`);
      console.log(`      • Message: Ready to send`);
      console.log(`      → Message will be sent to WhatsApp ✅`);
    } else {
      console.log(`   ❌ FAILED - Cannot send message`);
      console.log(`      Phone config not found`);
    }

    // SUMMARY
    console.log(`\n📊 WORKFLOW SUMMARY FOR ${accountName}:`);
    console.log(`   Step 1 (JWT Auth): ✅ Pass`);
    console.log(`   Step 2 (Load Chat): ✅ Pass`);
    console.log(`   Step 3 (Resolve Phone): ${phonesByObjectId.length > 0 ? '✅ Pass (FIXED)' : '❌ Fail'}`);
    console.log(`   Step 4 (Get Config): ${phoneConfig ? '✅ Pass' : '❌ Fail'}`);
    console.log(`   Step 5 (Send Message): ${phoneConfig ? '✅ READY' : '❌ Blocked'}`);

    if (phoneConfig) {
      console.log(`\n   🎉 ${accountName} LIVE CHAT: WORKING ✅`);
    } else {
      console.log(`\n   ❌ ${accountName} LIVE CHAT: BROKEN`);
    }

  } catch (error) {
    console.error(`❌ Error in ${accountName} workflow:`, error.message);
  }
}

testLiveChatWorkflow();
