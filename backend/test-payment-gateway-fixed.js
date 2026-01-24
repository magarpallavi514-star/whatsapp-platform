import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testCashfreeGateway() {
  console.log('\n🧪 CASHFREE PAYMENT GATEWAY TEST\n');
  
  // 1. Check Configuration
  console.log('📋 Configuration Check:');
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const apiUrl = process.env.CASHFREE_API_URL;
  const mode = process.env.CASHFREE_MODE;
  const webhookUrl = process.env.CASHFREE_WEBHOOK_URL;
  
  console.log(`✅ Client ID: ${clientId ? 'SET' : 'NOT SET'}`);
  console.log(`✅ Client Secret: ${clientSecret ? 'SET' : 'NOT SET'}`);
  console.log(`✅ API URL: ${apiUrl}`);
  console.log(`✅ Mode: ${mode}`);
  console.log(`✅ Webhook URL: ${webhookUrl}`);
  
  if (!clientId || !clientSecret) {
    console.error('\n❌ ERROR: Missing Cashfree credentials in .env file');
    process.exit(1);
  }

  try {
    // 2. Test Order Creation
    console.log('\n🚀 Testing Order Creation:');
    
    const orderData = {
      order_id: `TEST-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      order_amount: 1, // ₹1 test amount
      order_currency: 'INR',
      customer_details: {
        customer_id: 'test-customer-123',
        customer_email: 'test@example.com',
        customer_phone: '9876543210'
      },
      order_meta: {
        return_url: 'https://example.com/payment/success',
        notify_url: webhookUrl
      }
    };

    console.log(`Order ID: ${orderData.order_id}`);
    console.log(`Amount: ₹${orderData.order_amount}`);
    console.log(`Customer: ${orderData.customer_details.customer_email}`);

    const response = await axios.post(
      `${apiUrl}/orders`,
      orderData,
      {
        headers: {
          'X-Client-ID': clientId,
          'X-Client-Secret': clientSecret,
          'X-API-Version': '2023-08-01',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ SUCCESS: Order Created');
    console.log('\nFull Response:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('\n❌ ERROR: Order Creation Failed');
    console.log(`Status Code: ${error.response?.status || 'N/A'}`);
    console.log(`Message: ${error.response?.statusText || error.message}`);
    
    if (error.response?.data) {
      console.log('\nError Details:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }

    console.log('\n🔍 Troubleshooting:');
    console.log('1. Verify CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET in .env');
    console.log('2. Check if API endpoint is correct: ' + (process.env.CASHFREE_API_URL || 'NOT SET'));
    console.log('3. Ensure Cashfree account has API access enabled');
    console.log('4. Check if you are in production mode (CASHFREE_MODE=production)');
    console.log('5. Try the test in Cashfree dashboard: https://dashboard.cashfree.com');
  }
}

testCashfreeGateway();
