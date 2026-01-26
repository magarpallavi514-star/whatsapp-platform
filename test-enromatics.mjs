import fetch from 'node-fetch';

const testMessage = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            messages: [
              {
                from: '918087131777',
                id: 'wamid_test_' + Date.now(),
                timestamp: Math.floor(Date.now() / 1000),
                type: 'text',
                text: {
                  body: 'Test message from enromatics - ' + new Date().toLocaleString()
                }
              }
            ],
            contacts: [
              {
                profile: {
                  name: 'Enromatics Test'
                },
                wa_id: '918087131777'
              }
            ],
            metadata: {
              display_phone_number: '918087131777',
              phone_number_id: '108342778617973'
            }
          }
        }
      ]
    }
  ]
};

console.log('📤 Sending test message from enromatics...');
console.log('Phone: +91 8087131777');
console.log('Message:', testMessage.entry[0].changes[0].value.messages[0].text.body);

try {
  const response = await fetch('http://localhost:5050/api/webhooks/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testMessage)
  });

  const responseText = await response.text();
  
  if (response.ok) {
    console.log('✅ Webhook received successfully! Status:', response.status);
    console.log('Response:', responseText);
  } else {
    console.log('❌ Webhook error! Status:', response.status);
    console.log('Response:', responseText);
  }
} catch (error) {
  console.log('❌ Connection error:', error.message);
}
