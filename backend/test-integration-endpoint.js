#!/usr/bin/env node

/**
 * Test Script: Integration API Endpoint Test
 * Tests if the integration endpoint can fetch conversation messages
 * for the phone number 8087131777 (conversationId: pixels_internal_889344924259692_918087131777)
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const testIntegrationEndpoint = async () => {
  try {
    const conversationId = 'pixels_internal_889344924259692_918087131777';
    const accountId = 'pixels_internal';
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const apiKey = process.env.INTEGRATION_API_KEY || 'test-api-key';

    console.log('🧪 Testing Integration API Endpoint\n');
    console.log('=' .repeat(60));
    console.log('📋 Test Parameters:');
    console.log('=' .repeat(60));
    console.log(`Conversation ID: ${conversationId}`);
    console.log(`Account ID: ${accountId}`);
    console.log(`Base URL: ${baseUrl}`);
    console.log(`API Key: ${apiKey}\n`);

    const url = `${baseUrl}/api/integrations/conversations/${conversationId}/messages?limit=20&offset=0`;

    console.log(`🔗 Endpoint: ${url}\n`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-account-id': accountId,
        'x-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log('❌ Response is not valid JSON:');
      console.log(responseText);
      return;
    }

    console.log('=' .repeat(60));
    console.log('📊 Response:');
    console.log('=' .repeat(60));
    console.log(`Status Code: ${response.status}`);
    console.log(`Success: ${data.success}\n`);

    if (data.success) {
      console.log('✅ API Call SUCCEEDED\n');
      console.log(`Total Messages: ${data.data.messages?.length || 0}`);
      console.log(`Pagination Total: ${data.data.pagination?.total || 0}\n`);
      
      if (data.data.messages && data.data.messages.length > 0) {
        console.log('📨 Sample Messages:');
        data.data.messages.slice(0, 3).forEach((msg, i) => {
          console.log(`  ${i + 1}. ${msg.messageType} - ${msg.content?.text?.substring(0, 50) || '(no text)'}`);
        });
      } else {
        console.log('⚠️  No messages returned');
      }
    } else {
      console.log('❌ API Call FAILED\n');
      console.log(`Error: ${data.message}`);
      console.log(`Details: ${JSON.stringify(data, null, 2)}`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🔍 Diagnosis:');
    console.log('=' .repeat(60));
    
    if (!data.success && data.message === 'Conversation not found') {
      console.log('\n🐛 BUG CONFIRMED: Conversation not found!');
      console.log('\nThe issue is on line 180 of integrationsController.js:');
      console.log('  ❌ Current: { _id: conversationId }');
      console.log('  ✅ Should be: { conversationId: conversationId }');
      console.log('\nReason: The endpoint receives conversationId as "pixels_internal_889344924259692_918087131777"');
      console.log('but the code tries to match it against MongoDB\'s _id field (which is an ObjectId)');
    } else if (data.success) {
      console.log('\n✅ No bug detected - the endpoint is working correctly!');
      console.log('The conversation was found and messages were returned.');
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Backend server is running on http://localhost:3001');
    console.error('  2. Environment variables are set in .env');
    console.error('  3. MongoDB is connected');
  }
};

testIntegrationEndpoint();
