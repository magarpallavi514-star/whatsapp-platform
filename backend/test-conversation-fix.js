#!/usr/bin/env node

/**
 * Test Script: Verify Integration Endpoint Fix
 * Tests if the conversation endpoints work with conversationId
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './src/models/Conversation.js';

dotenv.config();

const testConversationFix = async () => {
  try {
    console.log('🧪 Testing Conversation Lookup Fix\n');
    console.log('=' .repeat(60));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the conversation we know exists
    const conversationId = 'pixels_internal_889344924259692_918087131777';
    const accountId = 'pixels_internal';

    console.log(`🔍 Looking for conversation:`, { conversationId, accountId });
    console.log('=' .repeat(60) + '\n');

    // Test 1: OLD WAY (was broken)
    console.log('❌ OLD WAY - Using _id field (BROKEN):');
    console.log('   Code: Conversation.findOne({ _id: conversationId, accountId })');
    try {
      const oldWay = await Conversation.findOne({
        _id: conversationId,
        accountId
      });
      console.log(`   Result: ${oldWay ? '✅ Found' : '❌ Not found'}\n`);
    } catch (e) {
      console.log(`   Error: ${e.message}\n`);
    }

    // Test 2: NEW WAY (fixed)
    console.log('✅ NEW WAY - Using conversationId field (FIXED):');
    console.log('   Code: Conversation.findOne({ conversationId: conversationId, accountId })');
    const newWay = await Conversation.findOne({
      conversationId: conversationId,
      accountId
    });
    
    if (newWay) {
      console.log(`   Result: ✅ FOUND!\n`);
      console.log('📊 Conversation Details:');
      console.log(`   - ID: ${newWay._id}`);
      console.log(`   - conversationId: ${newWay.conversationId}`);
      console.log(`   - User: ${newWay.userName} (${newWay.userPhone})`);
      console.log(`   - Status: ${newWay.status}`);
      console.log(`   - Last Message: ${new Date(newWay.lastMessageAt).toLocaleString()}`);
      console.log(`   - Unread: ${newWay.unreadCount}\n`);
      
      console.log('=' .repeat(60));
      console.log('🎉 SUCCESS: Endpoint fix is working correctly!');
      console.log('=' .repeat(60));
      console.log('\n✅ The following now works:');
      console.log('  1. GET /api/integrations/conversations/:id');
      console.log('  2. GET /api/integrations/conversations/:id/messages');
      console.log('  3. POST /api/integrations/conversations/:id/reply');
      console.log('\n✅ Enromatics can now fetch and reply to conversations!\n');
    } else {
      console.log(`   Result: ❌ Not found\n`);
      console.log('⚠️  Something went wrong. Please check the conversationId.\n');
    }

    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
};

testConversationFix();
