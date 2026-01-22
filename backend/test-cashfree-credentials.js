import dotenv from 'dotenv'

dotenv.config()

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET
const CASHFREE_API_URL = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg'

console.log('\n�� === TESTING CASHFREE CREDENTIALS ===\n')

console.log('Configuration:')
console.log(`  Client ID: ${CASHFREE_CLIENT_ID?.substring(0, 10)}...`)
console.log(`  Client Secret: ${CASHFREE_CLIENT_SECRET?.substring(0, 20)}...`)
console.log(`  API URL: ${CASHFREE_API_URL}\n`)

// Test with a simple order creation
const testPayload = {
  orderId: `TEST_${Date.now()}`,
  orderAmount: 100,
  orderCurrency: 'INR',
  customerDetails: {
    customerId: 'test_customer_123',
    customerEmail: 'test@example.com',
    customerPhone: '9999999999'
  },
  orderMeta: {
    returnUrl: 'http://localhost:3000/checkout?status=success',
    notifyUrl: 'http://localhost:5050/api/webhooks/cashfree'
  },
  orderNote: 'Test Order'
}

console.log('Sending test request to Cashfree...\n')

fetch(`${CASHFREE_API_URL}/orders`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-version': '2023-08-01',
    'x-client-id': CASHFREE_CLIENT_ID,
    'x-client-secret': CASHFREE_CLIENT_SECRET
  },
  body: JSON.stringify(testPayload)
})
  .then(res => {
    console.log(`Response Status: ${res.status}`)
    return res.json()
  })
  .then(data => {
    if (data.paymentSessionId) {
      console.log('✅ SUCCESS! Credentials are valid!\n')
      console.log('Response:')
      console.log(JSON.stringify(data, null, 2))
    } else if (data.message && data.message.includes('authentication')) {
      console.log('❌ AUTHENTICATION FAILED!')
      console.log('Your credentials are invalid or expired.')
      console.log('Please check your Cashfree dashboard for the correct credentials.\n')
      console.log('Error:', JSON.stringify(data, null, 2))
    } else {
      console.log('Response:', JSON.stringify(data, null, 2))
    }
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Network error:', error.message)
    process.exit(1)
  })

setTimeout(() => {
  console.log('Timeout - no response from Cashfree')
  process.exit(1)
}, 10000)
