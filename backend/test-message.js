const axios = require('axios');

// Test message payload - simulating incoming message from +918087131777
const testPayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '108765432109876', // WABA ID
      changes: [
        {
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '919876543210', // Your WhatsApp number
              phone_number_id: '108765432109876' // Phone Number ID
            },
            contacts: [
              {
                profile: {
                  name: 'Test Customer'
                },
                wa_id: '918087131777'
              }
            ],
            messages: [
              {
                from: '918087131777', // Incoming message from this number
                id: 'wamid.test_' + Date.now(),
                timestamp: Math.floor(Date.now() / 1000),
                type: 'text',
                text: {
                  body: '🧪 Test incoming message - Please verify this shows in live chat!'
                }
              }
            ]
          }
        }
      ]
    }
  ]
};

// Send to webhook
const webhookUrl = 'http://localhost:5050/api/webhooks/whatsapp';

console.log('\n📤 Sending test message to webhook...\n');
console.log('Webhook URL:', webhookUrl);
console.log('From Number: +918087131777');
console.log('Message: "🧪 Test incoming message - Please verify this shows in live chat!"\n');

axios.post(webhookUrl, testPayload, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('✅ Webhook called successfully!');
  console.log('Status:', response.status);
  console.log('\n📋 Next Steps:');
  console.log('1. Open the dashboard chat page');
  console.log('2. Select the conversation for +918087131777 (enromatcsi)');
  console.log('3. Check if the test message appears within 6 seconds');
  console.log('4. Check browser console for debug logs\n');
})
.catch(error => {
  console.error('❌ Error calling webhook:');
  console.error('Status:', error.response?.status);
  console.error('Message:', error.response?.data || error.message);
});
