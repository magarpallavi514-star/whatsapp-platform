#!/usr/bin/env node

/**
 * Verify Zepto API Key
 * Tests if the API key can authenticate with Zepto
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const apiToken = process.env.ZEPTOMAIL_API_TOKEN;
const ZEPTO_BASE_URL = 'https://api.zeptomail.com';

console.log('\n🔍 TESTING ZEPTO API KEY\n');

if (!apiToken) {
  console.log('❌ NO API TOKEN');
  process.exit(1);
}

console.log('Token info:');
console.log('  Starts with:', apiToken.substring(0, 25) + '...');
console.log('  Length:', apiToken.length);

// Test 1: Try to get account info (should work if key is valid)
async function testApiKey() {
  try {
    console.log('\n📡 Testing API key with GET request...');
    
    const response = await axios.get(
      `${ZEPTO_BASE_URL}/v1.1/account`,
      {
        headers: {
          'Authorization': apiToken,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ API KEY VALID!');
    console.log('Account info:', response.data);
    return true;
  } catch (error) {
    console.log('❌ API Key test failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    return false;
  }
}

// Test 2: Try different header format
async function testWithDifferentFormat() {
  try {
    console.log('\n📡 Testing with different header format (Bearer)...');
    
    const response = await axios.get(
      `${ZEPTO_BASE_URL}/v1.1/account`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Bearer format worked!');
    console.log('Account info:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Bearer format failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.error?.message);
    return false;
  }
}

async function run() {
  const test1 = await testApiKey();
  if (test1) {
    console.log('\n✅ Use current format in code');
    process.exit(0);
  }
  
  const test2 = await testWithDifferentFormat();
  if (test2) {
    console.log('\n⚠️  Need to update code to use Bearer format');
    process.exit(1);
  }
  
  console.log('\n❌ Neither format worked - API key might be invalid or revoked');
  process.exit(1);
}

run();
