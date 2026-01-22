import axios from 'axios';

/**
 * Test script to verify order creation with dynamic pricing
 * This tests that the backend correctly:
 * 1. Fetches plan from database
 * 2. Calculates amount dynamically
 * 3. Creates Cashfree order with correct amount
 */

const API_URL = 'http://localhost:5050';
const TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testOrderCreation() {
  try {
    console.log('🧪 Testing Order Creation with Dynamic Pricing...\n');

    // Test data
    const testCases = [
      { plan: 'starter', description: 'Starter Plan' },
      { plan: 'pro', description: 'Pro Plan' }
    ];

    for (const testCase of testCases) {
      console.log(`\n📝 Testing: ${testCase.description}`);
      console.log('━'.repeat(50));

      try {
        const response = await axios.post(
          `${API_URL}/api/subscriptions/create-order`,
          {
            plan: testCase.plan,
            paymentGateway: 'cashfree'
            // NOTE: NOT sending amount - backend calculates it
          },
          {
            headers: {
              Authorization: `Bearer ${TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Order Created Successfully!');
        console.log('Response:', {
          orderId: response.data.orderId,
          amount: response.data.amount,
          currency: response.data.currency,
          paymentSessionId: response.data.paymentSessionId ? 'Present' : 'Missing'
        });
      } catch (error) {
        console.log('❌ Order Creation Failed!');
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Error:', error.response.data);
        } else {
          console.log('Error:', error.message);
        }
      }
    }
  } catch (error) {
    console.error('Test Error:', error.message);
  }
}

// Run test
console.log('\n🚀 Starting Order Creation Tests');
console.log('═'.repeat(50));
testOrderCreation();
