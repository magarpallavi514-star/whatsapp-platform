#!/usr/bin/env node

/**
 * Test Dashboard Token Generation
 * 
 * Debug script to test if integration token generation works
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:5050';
const email = process.argv[2] || 'superadmin@test.com';
const password = process.argv[3] || '22442232';

async function testTokenGeneration() {
  console.log('\n🧪 Testing Integration Token Generation\n');
  console.log(`📍 API URL: ${API_URL}`);
  console.log(`📧 Email: ${email}`);
  console.log(`\n${'='.repeat(60)}\n`);

  try {
    // Step 1: Login
    console.log('Step 1️⃣  Logging in...\n');
    
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const loginData = await loginResponse.json();
    console.log(`Status: ${loginResponse.status}`);
    console.log(`Response:`, JSON.stringify(loginData, null, 2));

    if (!loginResponse.ok || !loginData.token) {
      console.error('\n❌ Login failed. Cannot proceed.');
      return;
    }

    const jwtToken = loginData.token;
    console.log(`\n✅ Login successful!`);
    console.log(`🔑 JWT Token: ${jwtToken.substring(0, 20)}...`);

    // Step 2: Generate Integration Token
    console.log(`\n\nStep 2️⃣  Generating integration token...\n`);
    
    const tokenResponse = await fetch(`${API_URL}/api/account/integration-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    const tokenData = await tokenResponse.json();
    console.log(`Status: ${tokenResponse.status}`);
    console.log(`Response:`, JSON.stringify(tokenData, null, 2));

    if (tokenResponse.ok && tokenData.integrationToken) {
      console.log(`\n✅ Integration Token Generated!`);
      console.log(`🔑 Token: ${tokenData.integrationToken}`);
      console.log(`\n⚠️  Save this token! It won't be shown again.`);
    } else {
      console.log(`\n❌ Token generation failed.`);
      console.log(`Error: ${tokenData.message || tokenData.error}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

testTokenGeneration();
