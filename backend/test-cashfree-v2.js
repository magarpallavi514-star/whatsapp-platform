import dotenv from 'dotenv'

dotenv.config()

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET
const CASHFREE_API_URL = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg'

console.log('Testing Cashfree API...\n')

const payload = {
  orderId: `ORDER_TEST_${Date.now()}`,
  orderAmount: 100.00,
  orderCurrency: 'INR',
  customerDetails: {
    customerId: 'cust_123',
    customerEmail: 'test@example.com',
    customerPhone: '9999999999'
  }
}

console.log('Payload:', JSON.stringify(payload, null, 2))
console.log('\nSending request...\n')

fetch(`${CASHFREE_API_URL}/orders`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-version': '2023-08-01',
    'x-client-id': CASHFREE_CLIENT_ID,
    'x-client-secret': CASHFREE_CLIENT_SECRET
  },
  body: JSON.stringify(payload)
})
  .then(res => {
    console.log(`✅ Status: ${res.status}`)
    if (res.status === 401) {
      console.log('❌ AUTHENTICATION FAILED - Invalid credentials')
    } else if (res.status === 400) {
      console.log('⚠️  Bad request - Check payload format')
    } else if (res.status === 200 || res.status === 201) {
      console.log('✅ ORDER CREATED SUCCESSFULLY')
    }
    return res.json()
  })
  .then(data => {
    console.log('\nResponse:', JSON.stringify(data, null, 2))
    process.exit(0)
  })
  .catch(error => {
    console.error('Network error:', error.message)
    process.exit(1)
  })

setTimeout(() => {
  console.log('Timeout')
  process.exit(1)
}, 10000)
