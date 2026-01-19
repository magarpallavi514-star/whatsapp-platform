/**
 * Test superadmin login credentials
 * Run: node test-superadmin-login.js
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5050/api';
const TEST_EMAIL = 'mpiyush2727@gmail.com';
const TEST_PASSWORD = 'Pm@22442232';

async function testLogin() {
  console.log('🧪 Testing Superadmin Login');
  console.log('━'.repeat(50));
  console.log('Email:', TEST_EMAIL);
  console.log('Password:', TEST_PASSWORD);
  console.log('API URL:', API_URL);
  console.log('━'.repeat(50));
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    const data = await response.json();
    
    console.log('\n✅ Response Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('Token:', data.token.substring(0, 50) + '...');
      console.log('User:', data.user);
    } else {
      console.log('\n❌ LOGIN FAILED!');
      console.log('Message:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('Make sure backend is running on port 5050');
  }
}

testLogin();
