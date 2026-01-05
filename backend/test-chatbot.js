import axios from 'axios';

const API_URL = 'http://localhost:5050';

// Simulate a WhatsApp webhook incoming message
const simulateIncomingMessage = async (messageText) => {
  const webhookPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: '1536545574042607',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15550536969',
            phone_number_id: '889344924259692'
          },
          contacts: [{
            profile: {
              name: 'Test User'
            },
            wa_id: '919876543210'
          }],
          messages: [{
            from: '919876543210',
            id: `wamid.test${Date.now()}`,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'text',
            text: {
              body: messageText
            }
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    console.log('📤 Sending webhook payload...');
    console.log('💬 Message text:', messageText);
    
    const response = await axios.post(
      `${API_URL}/api/webhooks/whatsapp`,
      webhookPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Webhook processed successfully');
    console.log('📥 Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

// Test different messages
const testMessages = [
  'hello',           // Should trigger if you have 'hello' keyword
  'hi',              // Should trigger if you have 'hi' keyword  
  'support',         // Should trigger if you have 'support' keyword
  'help me',         // Should trigger if you have 'help' keyword with 'contains' match
  'random text'      // Should not trigger anything
];

console.log('🧪 Testing chatbot with different messages...\n');

// Test one message at a time
const messageToTest = process.argv[2] || testMessages[0];

console.log(`Testing with message: "${messageToTest}"\n`);
simulateIncomingMessage(messageToTest);
