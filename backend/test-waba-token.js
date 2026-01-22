import dotenv from 'dotenv';
dotenv.config();

const token = process.env.WHATSAPP_ACCESS_TOKEN;

console.log('🔐 Testing WhatsApp Token for both WABAs\n');

// Phone numbers and their IDs
const phones = [
  {
    name: 'SUPERADMIN',
    phoneNumber: '+919766504856',
    phoneNumberId: '889344924259692',
    accountId: 'pixels_internal'
  },
  {
    name: 'ENROMATICS',
    phoneNumber: '+918087131777',
    phoneNumberId: '1003427786179738',
    accountId: '2600003'
  }
];

async function testPhone(phone) {
  console.log(`\n📱 Testing ${phone.name}`);
  console.log(`   Phone: ${phone.phoneNumber}`);
  console.log(`   Phone ID: ${phone.phoneNumberId}`);
  
  try {
    // Test getting phone info - USE FACEBOOK GRAPH API FOR WHATSAPP
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${phone.phoneNumberId}?fields=display_phone_number,status`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log(`   ✅ Token is VALID for ${phone.name}`);
      console.log(`   Display Name: ${data.display_phone_number || 'N/A'}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
    } else {
      console.log(`   ❌ Token INVALID or NO ACCESS`);
      console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
}

async function testSendMessage(phone) {
  console.log(`\n📤 Testing Message Send for ${phone.name}`);
  
  try {
    const response = await fetch(
      `https://graph.instagram.com/v20.0/${phone.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone.phoneNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: 'Test message from ReplysSys'
          }
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log(`   ✅ Send TEST - Success`);
      console.log(`   Message ID: ${data.messages?.[0]?.id}`);
    } else {
      console.log(`   ❌ Send TEST - Failed`);
      console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
}

async function main() {
  if (!token) {
    console.log('❌ WHATSAPP_ACCESS_TOKEN not found in .env');
    process.exit(1);
  }

  console.log(`Token (first 50 chars): ${token.substring(0, 50)}...`);
  console.log(`Token length: ${token.length}`);

  // Test both phones
  for (const phone of phones) {
    await testPhone(phone);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Token validation complete!');
}

main().catch(console.error);
