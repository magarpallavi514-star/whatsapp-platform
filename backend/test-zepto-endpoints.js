#!/usr/bin/env node

/**
 * Test different Zepto API formats
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const ZEPTO_API_KEY = process.env.ZEPTOMAIL_API_TOKEN;
const FROM_EMAIL = 'support@replysys.com';
const TEST_EMAIL = 'info@enromatics.com';

console.log('\n🔍 TESTING DIFFERENT ZEPTO ENDPOINT FORMATS\n');

async function testEndpoint(url, description) {
  try {
    console.log(`\n📡 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await axios.post(url, {
      from: { address: FROM_EMAIL, name: 'Pixels WhatsApp' },
      to: [{ email_address: { address: TEST_EMAIL } }],
      subject: '🎉 Test Email',
      htmlbody: '<p>Test</p>'
    }, {
      headers: {
        'Authorization': ZEPTO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ SUCCESS!`);
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.response?.status} - ${error.response?.data?.error?.message}`);
    return false;
  }
}

async function run() {
  const endpoints = [
    'https://api.zeptomail.in/v1.1/email/send',
    'https://api.zeptomail.in/v1.1/email',
    'https://api.zeptomail.in/v1/email/send',
    'https://zeptomail.in/api/v1.1/email/send',
    'https://api.zeptomail.com/v1.1/email/send',
  ];

  for (const endpoint of endpoints) {
    const description = endpoint.includes('.in') ? '(India)' : '(Fallback)';
    await testEndpoint(endpoint, description);
  }
}

run();
