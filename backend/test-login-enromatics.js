import axios from 'axios';

const API_URL = 'http://localhost:5050';

async function testLogin() {
  try {
    console.log('🔐 Testing Enromatics Login\n');
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'info@enromatics.com',
      password: '951695'
    });
    
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('\nResponse:');
    console.log('  Success:', response.data.success);
    console.log('  Message:', response.data.message);
    console.log('  User Email:', response.data.user.email);
    console.log('  User Name:', response.data.user.name);
    console.log('  Account ID:', response.data.user.accountId);
    console.log('  Role:', response.data.user.role);
    console.log('\n🔑 Token (first 50 chars):', response.data.token.substring(0, 50) + '...');
    
  } catch (error) {
    console.error('❌ LOGIN FAILED!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.message);
  }
}

testLogin();
