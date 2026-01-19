# Payment System API Examples

## 🌐 Public Endpoints (No Authentication Required)

### Get All Public Pricing Plans

```bash
curl -X GET http://localhost:5000/api/pricing/plans/public
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "planId": "plan_abc123",
      "name": "Starter",
      "description": "Perfect for getting started",
      "monthlyPrice": 29,
      "yearlyPrice": 290,
      "currency": "USD",
      "monthlyDiscount": 0,
      "yearlyDiscount": 16,
      "limits": {
        "messages": 5000,
        "contacts": 1000,
        "campaigns": 10,
        "phoneNumbers": 1,
        "users": 1,
        "storageGB": 5
      },
      "features": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Basic Message Sending",
          "description": "Send text messages via WhatsApp",
          "included": true,
          "limit": null
        }
      ],
      "isActive": true,
      "isPopular": false
    }
  ]
}
```

---

## 👤 User Authenticated Endpoints

### Get My Current Subscription

```bash
curl -X GET http://localhost:5000/api/subscription/my-subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "subscriptionId": "sub_xyz789",
    "accountId": "507f1f77bcf86cd799439001",
    "planId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Pro",
      "monthlyPrice": 99,
      "yearlyPrice": 990
    },
    "status": "active",
    "billingCycle": "annual",
    "pricing": {
      "amount": 990,
      "discount": 160,
      "discountReason": "16% annual discount",
      "finalAmount": 830,
      "currency": "USD"
    },
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2025-01-01T00:00:00Z",
    "renewalDate": "2025-01-01T00:00:00Z",
    "autoRenew": true
  }
}
```

### Create a Subscription

```bash
curl -X POST http://localhost:5000/api/subscription/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "507f1f77bcf86cd799439011",
    "billingCycle": "monthly",
    "paymentGateway": "stripe",
    "transactionId": "ch_stripe_123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "subscriptionId": "sub_new789",
    "accountId": "507f1f77bcf86cd799439001",
    "planId": "507f1f77bcf86cd799439011",
    "status": "active",
    "billingCycle": "monthly",
    "pricing": {
      "amount": 29,
      "discount": 0,
      "finalAmount": 29,
      "currency": "USD"
    },
    "startDate": "2024-01-15T10:30:00Z",
    "endDate": "2024-02-15T10:30:00Z"
  }
}
```

### Change Subscription Plan

```bash
curl -X POST http://localhost:5000/api/subscription/change-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPlanId": "507f1f77bcf86cd799439012",
    "billingCycle": "annual"
  }'
```

### Pause Subscription

```bash
curl -X POST http://localhost:5000/api/subscription/pause \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Resume Subscription

```bash
curl -X POST http://localhost:5000/api/subscription/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Cancel Subscription

```bash
curl -X POST http://localhost:5000/api/subscription/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Too expensive for our current usage"
  }'
```

### Get My Invoices

```bash
curl -X GET "http://localhost:5000/api/invoice/my-invoices?status=paid&limit=10&skip=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "invoiceId": "inv_abc123",
      "invoiceNumber": "INV-2024-000001",
      "accountId": "507f1f77bcf86cd799439001",
      "subscriptionId": "507f1f77bcf86cd799439014",
      "invoiceDate": "2024-01-15T00:00:00Z",
      "dueDate": "2024-02-15T00:00:00Z",
      "totalAmount": 29,
      "paidAmount": 29,
      "dueAmount": 0,
      "currency": "USD",
      "status": "paid"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "skip": 0
  }
}
```

### Get Invoice Details

```bash
curl -X GET http://localhost:5000/api/invoice/inv_abc123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 👨‍💼 Superadmin Endpoints

### Create Pricing Plan

```bash
curl -X POST http://localhost:5000/api/pricing/plans \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pro",
    "description": "For growing businesses",
    "monthlyPrice": 99,
    "yearlyPrice": 990,
    "currency": "USD",
    "monthlyDiscount": 5,
    "yearlyDiscount": 16,
    "isPopular": true,
    "limits": {
      "messages": 50000,
      "contacts": 10000,
      "campaigns": 100,
      "apiCalls": 100000,
      "templates": 100,
      "phoneNumbers": 3,
      "users": 5,
      "storageGB": 50
    },
    "features": [
      {
        "name": "All Starter Features",
        "description": "Everything from Starter plan",
        "included": true
      },
      {
        "name": "Media Messages",
        "description": "Send images, documents, videos",
        "included": true
      },
      {
        "name": "API Access",
        "description": "Full API access with webhooks",
        "included": true,
        "limit": 100000
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Pricing plan created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "planId": "plan_new456",
    "name": "Pro",
    "monthlyPrice": 99,
    "yearlyPrice": 990,
    "isPopular": true
  }
}
```

### Add Feature to Plan

```bash
curl -X POST http://localhost:5000/api/pricing/plans/plan_abc123/features \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dedicated Support",
    "description": "24/7 dedicated account manager",
    "included": true,
    "limit": null
  }'
```

### Update Pricing Plan

```bash
curl -X PUT http://localhost:5000/api/pricing/plans/plan_abc123 \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyPrice": 49,
    "yearlyPrice": 490,
    "monthlyDiscount": 10,
    "isPopular": false
  }'
```

### Delete (Deactivate) Pricing Plan

```bash
curl -X DELETE http://localhost:5000/api/pricing/plans/plan_abc123 \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN"
```

### Get All Subscriptions (Admin)

```bash
curl -X GET "http://localhost:5000/api/subscription?status=active" \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "subscriptionId": "sub_xyz789",
      "accountId": {
        "_id": "507f1f77bcf86cd799439001",
        "name": "Acme Corp",
        "email": "admin@acme.com",
        "company": "Acme Corporation"
      },
      "planId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Pro",
        "monthlyPrice": 99,
        "yearlyPrice": 990
      },
      "status": "active",
      "billingCycle": "monthly"
    }
  ],
  "total": 42
}
```

### Get All Invoices (Admin)

```bash
curl -X GET "http://localhost:5000/api/invoice?status=unpaid&limit=20" \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN"
```

### Create Invoice (Admin)

```bash
curl -X POST http://localhost:5000/api/invoice/create \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "507f1f77bcf86cd799439001",
    "subscriptionId": "507f1f77bcf86cd799439014",
    "billTo": {
      "name": "John Doe",
      "email": "john@acme.com",
      "company": "Acme Corp",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001",
      "taxId": "12-3456789"
    },
    "lineItems": [
      {
        "description": "Pro Plan - Monthly Subscription",
        "quantity": 1,
        "unitPrice": 99,
        "amount": 99
      }
    ],
    "subtotal": 99,
    "taxRate": 0,
    "discountAmount": 0,
    "totalAmount": 99
  }'
```

### Get Payment Statistics (Admin)

```bash
curl -X GET "http://localhost:5000/api/payment/stats/overview?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "USD",
      "totalAmount": 15420.50,
      "totalRefunded": 240.00,
      "count": 234
    }
  ]
}
```

### Refund Payment (Admin)

```bash
curl -X POST http://localhost:5000/api/payment/pay_abc123/refund \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer requested refund - service cancellation",
    "refundAmount": 99
  }'
```

---

## 🔄 Webhook Endpoints (Public)

### Payment Confirmation Webhook

```bash
curl -X POST http://localhost:5000/api/payment/webhook/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pay_xyz789",
    "gatewayTransactionId": "ch_stripe_123456",
    "status": "completed",
    "amount": 99,
    "failureReason": null,
    "errorCode": null
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "paymentId": "pay_xyz789",
    "status": "completed",
    "amount": 99,
    "completedAt": "2024-01-15T10:35:00Z"
  }
}
```

---

## 📊 JavaScript/Fetch Examples

### Get Pricing Plans (Frontend)

```javascript
const response = await fetch('/api/pricing/plans/public');
const data = await response.json();
console.log(data.data); // Array of plans
```

### Create Subscription (Frontend)

```javascript
const response = await fetch('/api/subscription/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    planId: '507f1f77bcf86cd799439011',
    billingCycle: 'monthly',
    paymentGateway: 'stripe',
    transactionId: 'ch_123'
  })
});
const subscription = await response.json();
```

### Change Plan (Frontend)

```javascript
const response = await fetch('/api/subscription/change-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    newPlanId: '507f1f77bcf86cd799439012',
    billingCycle: 'annual'
  })
});
const result = await response.json();
```

### Cancel Subscription (Frontend)

```javascript
const response = await fetch('/api/subscription/cancel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    reason: 'Too expensive'
  })
});
const result = await response.json();
```

---

## ✅ Testing Quick Commands

```bash
# Seed pricing plans
node backend/seed-pricing-plans.js

# Test get public plans
curl http://localhost:5000/api/pricing/plans/public

# Test subscription (replace token and IDs)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/subscription/my-subscription

# Test invoices (replace token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/invoice/my-invoices"
```

---

## 🔐 Authentication

All endpoints except public pricing and webhook endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

Get token from login endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## 🐛 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description here",
  "code": "ERROR_CODE"
}
```

Examples:
- 400: Missing required fields
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Resource not found
- 409: Conflict (duplicate record)
- 500: Server error
