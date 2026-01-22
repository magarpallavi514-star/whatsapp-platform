import dotenv from 'dotenv';

dotenv.config();

// Test the phone numbers API
async function testPhoneAPI() {
  console.log('🧪 Testing Phone Numbers API\n');

  // Get token from env or use a test token
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1waXl1c2gyNzI3QGdtYWlsLmNvbSIsImFjY291bnRJZCI6InBpeGVsc19pbnRlcm5hbCIsInJvbGUiOiJzdXBlcmFkbWluIn0.signature';

  try {
    // Local test
    console.log('Testing locally...');
    const response = await fetch('http://localhost:5050/api/settings/phone-numbers', {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.phoneNumbers) {
      console.log(`\n✅ Found ${data.phoneNumbers.length} phones`);
      data.phoneNumbers.forEach(p => {
        console.log(`  - ${p.displayPhoneNumber || p.phoneNumber} (${p.accountId})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPhoneAPI();
