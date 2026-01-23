#!/usr/bin/env node
/**
 * DIAGNOSTIC TEST: Check Live Chat Status & Message Reception
 * Test WITHOUT code changes - Just checking current state
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';

async function diagnoseConversations() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 LIVE CHAT DIAGNOSTIC TEST');
    console.log('='.repeat(80) + '\n');

    await mongoose.connect(process.env.MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000 
    });

    // ====================
    // PART 1: Account IDs
    // ====================
    console.log('📋 PART 1: ACCOUNT OBJECTIDS');
    console.log('─'.repeat(80));
    
    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    const enromatics = await Account.findOne({ accountId: 'eno_2600003' });

    console.log('\nSUPERADMIN:');
    console.log(`  accountId (String): "${superadmin.accountId}"`);
    console.log(`  _id (ObjectId):     ${superadmin._id}`);
    console.log(`  _id Type:           ${typeof superadmin._id}`);
    
    console.log('\nENROMATICS:');
    console.log(`  accountId (String): "${enromatics.accountId}"`);
    console.log(`  _id (ObjectId):     ${enromatics._id}`);
    console.log(`  _id Type:           ${typeof enromatics._id}`);

    // ====================
    // PART 2: Phone Config
    // ====================
    console.log('\n\n📱 PART 2: PHONE CONFIGURATION');
    console.log('─'.repeat(80));
    
    const superadminPhone = await PhoneNumber.findOne({
      accountId: superadmin._id  // Using ObjectId (single truth)
    });
    
    const enromaticsPhone = await PhoneNumber.findOne({
      accountId: enromatics._id  // Using ObjectId (single truth)
    });

    console.log('\nSUPERADMIN PHONE:');
    if (superadminPhone) {
      console.log(`  ✅ Phone Found`);
      console.log(`  phoneNumberId:  ${superadminPhone.phoneNumberId}`);
      console.log(`  wabaId:         ${superadminPhone.wabaId}`);
      console.log(`  accountId stored as:  ${superadminPhone.accountId.constructor.name}`);
      console.log(`  isActive:       ${superadminPhone.isActive}`);
      console.log(`  hasAccessToken: ${!!superadminPhone.accessToken}`);
    } else {
      console.log(`  ❌ NO PHONE FOUND`);
    }

    console.log('\nENROMATICS PHONE:');
    if (enromaticsPhone) {
      console.log(`  ✅ Phone Found`);
      console.log(`  phoneNumberId:  ${enromaticsPhone.phoneNumberId}`);
      console.log(`  wabaId:         ${enromaticsPhone.wabaId}`);
      console.log(`  accountId stored as:  ${enromaticsPhone.accountId.constructor.name}`);
      console.log(`  isActive:       ${enromaticsPhone.isActive}`);
      console.log(`  hasAccessToken: ${!!enromaticsPhone.accessToken}`);
    } else {
      console.log(`  ❌ NO PHONE FOUND`);
    }

    // ====================
    // PART 3: Live Chats/Conversations
    // ====================
    console.log('\n\n💬 PART 3: LIVE CHATS (CONVERSATIONS)');
    console.log('─'.repeat(80));
    
    const superadminConversations = await Conversation.find({
      accountId: superadmin._id  // Using ObjectId (single truth)
    }).sort({ createdAt: -1 });
    
    const enromaticsConversations = await Conversation.find({
      accountId: enromatics._id  // Using ObjectId (single truth)
    }).sort({ createdAt: -1 });

    console.log('\nSUPERADMIN CONVERSATIONS:');
    console.log(`  Total Count:  ${superadminConversations.length}`);
    
    if (superadminConversations.length > 0) {
      console.log(`  ✅ HAS LIVE CHATS\n`);
      superadminConversations.slice(0, 3).forEach((conv, i) => {
        console.log(`  Chat ${i + 1}:`);
        console.log(`    conversationId: ${conv.conversationId}`);
        console.log(`    phoneNumberId:  ${conv.phoneNumberId}`);
        console.log(`    participantPhone: ${conv.participantPhone}`);
        console.log(`    status:         ${conv.status}`);
        console.log(`    lastMessageAt:  ${conv.lastMessageAt}`);
        console.log(`    messageCount:   ${conv.messageCount || 0}`);
        console.log(`    accountId stored as: ${conv.accountId.constructor.name}`);
        console.log('');
      });
      if (superadminConversations.length > 3) {
        console.log(`  ... and ${superadminConversations.length - 3} more`);
      }
    } else {
      console.log(`  ❌ NO LIVE CHATS`);
    }

    console.log('\nENROMATICS CONVERSATIONS:');
    console.log(`  Total Count:  ${enromaticsConversations.length}`);
    
    if (enromaticsConversations.length > 0) {
      console.log(`  ✅ HAS LIVE CHATS\n`);
      enromaticsConversations.slice(0, 3).forEach((conv, i) => {
        console.log(`  Chat ${i + 1}:`);
        console.log(`    conversationId: ${conv.conversationId}`);
        console.log(`    phoneNumberId:  ${conv.phoneNumberId}`);
        console.log(`    participantPhone: ${conv.participantPhone}`);
        console.log(`    status:         ${conv.status}`);
        console.log(`    lastMessageAt:  ${conv.lastMessageAt}`);
        console.log(`    messageCount:   ${conv.messageCount || 0}`);
        console.log(`    accountId stored as: ${conv.accountId.constructor.name}`);
        console.log('');
      });
      if (enromaticsConversations.length > 3) {
        console.log(`  ... and ${enromaticsConversations.length - 3} more`);
      }
    } else {
      console.log(`  ❌ NO LIVE CHATS`);
    }

    // ====================
    // PART 4: Messages Status
    // ====================
    console.log('\n\n📨 PART 4: RECEIVED MESSAGES');
    console.log('─'.repeat(80));
    
    const superadminMessages = await Message.find({
      accountId: superadmin._id  // Using ObjectId (single truth)
    }).sort({ createdAt: -1 });
    
    const enromaticsMessages = await Message.find({
      accountId: enromatics._id  // Using ObjectId (single truth)
    }).sort({ createdAt: -1 });

    console.log('\nSUPERADMIN MESSAGES:');
    console.log(`  Total Count:  ${superadminMessages.length}`);
    
    if (superadminMessages.length > 0) {
      console.log(`  ✅ HAS MESSAGES\n`);
      
      const received = superadminMessages.filter(m => m.direction === 'inbound').length;
      const sent = superadminMessages.filter(m => m.direction === 'outbound').length;
      
      console.log(`  Breakdown:`);
      console.log(`    Received (inbound):  ${received}`);
      console.log(`    Sent (outbound):     ${sent}`);
      
      console.log(`\n  Latest Messages:`);
      superadminMessages.slice(0, 3).forEach((msg, i) => {
        const content = msg.content?.text || msg.message || JSON.stringify(msg.content).substring(0, 50);
        console.log(`  Msg ${i + 1}:`);
        console.log(`    direction:     ${msg.direction}`);
        console.log(`    status:        ${msg.status}`);
        console.log(`    content:       ${content}`);
        console.log(`    createdAt:     ${msg.createdAt}`);
        console.log(`    accountId stored as: ${msg.accountId.constructor.name}`);
        console.log('');
      });
    } else {
      console.log(`  ❌ NO MESSAGES`);
    }

    console.log('\nENROMATICS MESSAGES:');
    console.log(`  Total Count:  ${enromaticsMessages.length}`);
    
    if (enromaticsMessages.length > 0) {
      console.log(`  ✅ HAS MESSAGES\n`);
      
      const received = enromaticsMessages.filter(m => m.direction === 'inbound').length;
      const sent = enromaticsMessages.filter(m => m.direction === 'outbound').length;
      
      console.log(`  Breakdown:`);
      console.log(`    Received (inbound):  ${received}`);
      console.log(`    Sent (outbound):     ${sent}`);
      
      console.log(`\n  Latest Messages:`);
      enromaticsMessages.slice(0, 3).forEach((msg, i) => {
        const content = msg.content?.text || msg.message || JSON.stringify(msg.content).substring(0, 50);
        console.log(`  Msg ${i + 1}:`);
        console.log(`    direction:     ${msg.direction}`);
        console.log(`    status:        ${msg.status}`);
        console.log(`    content:       ${content}`);
        console.log(`    createdAt:     ${msg.createdAt}`);
        console.log(`    accountId stored as: ${msg.accountId.constructor.name}`);
        console.log('');
      });
    } else {
      console.log(`  ❌ NO MESSAGES`);
    }

    // ====================
    // PART 5: SUMMARY
    // ====================
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80) + '\n');

    console.log('SUPERADMIN:');
    console.log(`  ObjectId: ${superadmin._id}`);
    console.log(`  Phone:    ${superadminPhone ? '✅ Connected' : '❌ Missing'}`);
    console.log(`  Chats:    ${superadminConversations.length > 0 ? `✅ ${superadminConversations.length} chats` : '❌ None'}`);
    console.log(`  Messages: ${superadminMessages.length > 0 ? `✅ ${superadminMessages.length} messages` : '❌ None'}`);

    console.log('\nENROMATICS:');
    console.log(`  ObjectId: ${enromatics._id}`);
    console.log(`  Phone:    ${enromaticsPhone ? '✅ Connected' : '❌ Missing'}`);
    console.log(`  Chats:    ${enromaticsConversations.length > 0 ? `✅ ${enromaticsConversations.length} chats` : '❌ None'}`);
    console.log(`  Messages: ${enromaticsMessages.length > 0 ? `✅ ${enromaticsMessages.length} messages` : '❌ None'}`);

    console.log('\nDATA TYPE CONSISTENCY:');
    const phoneAccountIdType = superadminPhone?.accountId?.constructor?.name || 'N/A';
    const convAccountIdType = superadminConversations[0]?.accountId?.constructor?.name || 'N/A';
    const msgAccountIdType = superadminMessages[0]?.accountId?.constructor?.name || 'N/A';
    
    console.log(`  PhoneNumber.accountId:    ${phoneAccountIdType} ${phoneAccountIdType === 'ObjectId' ? '✅' : '⚠️'}`);
    console.log(`  Conversation.accountId:   ${convAccountIdType} ${convAccountIdType === 'ObjectId' ? '✅' : '⚠️'}`);
    console.log(`  Message.accountId:        ${msgAccountIdType} ${msgAccountIdType === 'ObjectId' ? '✅' : '⚠️'}`);

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Diagnostic Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

diagnoseConversations();
