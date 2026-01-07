#!/usr/bin/env node

/**
 * Test Enromatics Integration Token Connection
 * 
 * Usage:
 *   node test-enromatics-token.js <integration_token>
 * 
 * Example:
 *   node test-enromatics-token.js wpi_int_abc123def456...
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:5050';
const integrationToken = process.argv[2];

if (!integrationToken) {
  console.error('❌ Error: Integration token required');
  console.log('\nUsage: node test-enromatics-token.js <integration_token>');
  console.log('\nExample: node test-enromatics-token.js wpi_int_abc123def456...');
  process.exit(1);
}

async function testConnection() {
  console.log('\n🧪 Testing Enromatics Integration Token Connection\n');
  console.log(`📍 API URL: ${API_URL}`);
  console.log(`🔑 Token: ${integrationToken.substring(0, 15)}...`);
  console.log(`\n${'='.repeat(60)}\n`);

  try {
    // Test 1: Get conversations
    console.log('Test 1️⃣  Getting conversations...\n');
    
    const conversationResponse = await fetch(`${API_URL}/api/integrations/conversations?limit=5`, {
      headers: {
        'Authorization': `Bearer ${integrationToken}`,
        'Content-Type': 'application/json'
      }
    });

    const conversationData = await conversationResponse.json();

    console.log(`Status: ${conversationResponse.status} ${conversationResponse.statusText}`);
    console.log(`Response:`);
    console.log(JSON.stringify(conversationData, null, 2));

    if (conversationResponse.ok) {
      console.log('\n✅ Token is valid and working!\n');
    } else {
      console.log('\n❌ Token test failed.\n');
      console.log('Troubleshooting:');
      console.log('  1. Verify the token starts with "wpi_int_"');
      console.log('  2. Make sure the token was recently generated');
      console.log('  3. Check if the account is active');
      console.log('  4. Ensure the backend is running on the correct port');
    }

  } catch (error) {
    console.error('\n❌ Connection error:', error.message);
    console.log('\nTroubleshooting:');
    console.log(`  1. Check if API is running at ${API_URL}`);
    console.log('  2. Verify network connectivity');
    console.log('  3. Check backend logs for errors');
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

testConnection();
