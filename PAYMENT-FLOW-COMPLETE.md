# 🔄 COMPLETE PAYMENT FLOW - CODE WALKTHROUGH

## Customer Journey: Signup → Payment → Subscription Active

---

## 1️⃣ SIGNUP FLOW

```
Customer visits /signup
    ↓
Fills form: name, email, password, company
    ↓
Clicks "Create Account"
    ↓
Frontend calls: POST /api/auth/signup
    ↓
Backend:
  ├─ Creates Account in MongoDB
  ├─ Hashes password with bcrypt
  ├─ Returns JWT token
  └─ Frontend stores in localStorage
    ↓
✉️ emailService.sendWelcomeEmail() called
    ├─ Email: name@example.com
    ├─ Subject: "Welcome to Pixels WhatsApp!"
    ├─ Template: Welcome email with login link
    └─ Sent via Zepto API
    ↓
💚 Customer sees success page
    ↓
📧 Customer receives welcome email
```

### Code for Signup Email:
```javascript
// In any controller after account creation:
import { emailService } from '../services/emailService.js';

await emailService.sendWelcomeEmail(
  account.email,      // name@example.com
  account.name        // Customer Name
);
```

---

## 2️⃣ CHECKOUT FLOW

```
Customer visits /pricing
    ↓
Sees 2 plans: Starter (₹2,499) & Pro (₹4,999)
    ↓
Clicks "Get Started" on Pro plan
    ↓
Redirects to /checkout
    ↓
Selects billing cycle: Monthly or Annual
    ↓
Clicks "Proceed to Payment"
    ↓
Frontend calls: POST /api/payment/create-order
  {
    planId: "pro",
    billingCycle: "monthly",
    organizationId: "org_123"
  }
```

---

## 3️⃣ CREATE ORDER (Backend)

```
Payment controller receives request
    ↓
Validates:
  ├─ planId exists? ✓
  ├─ billingCycle valid? ✓
  └─ organizationId valid? ✓
    ↓
Gets plan details:
  ├─ planId: "pro"
  ├─ monthlyPrice: 4999
  └─ yearlyPrice: 56988
    ↓
Calculates amount:
  amount = billingCycle === 'annual' ? 56988 : 4999
    ↓
Calls: cashfreeService.createOrder({
  orderId: "ORDER-org_123-1234567890",
  customerId: "org_123",
  email: "owner@company.com",
  phone: "9876543210",
  amount: 4999,
  description: "Pro Plan (monthly) - Company Name"
})
    ↓
Cashfree API responds with:
  {
    order_id: "ORDER-org_123-1234567890",
    payment_session_id: "session_12345",
    payment_url: "https://cashfree.com/pg/checkout?session_id=...",
    cf_order_id: "12345"
  }
    ↓
Creates Invoice in MongoDB:
  {
    invoiceNumber: "INV-1234567890",
    accountId: user_id,
    organizationId: org_123,
    planId: "pro",
    amount: 4999,
    status: "pending",
    orderId: "ORDER-org_123-1234567890",
    billingCycle: "monthly"
  }
    ↓
Returns to Frontend:
  {
    success: true,
    redirectUrl: "https://cashfree.com/pg/checkout?session_id=...",
    paymentSessionId: "session_12345",
    invoiceId: "inv_abc123"
  }
```

---

## 4️⃣ PAYMENT GATEWAY

```
Frontend redirects to: cashfreeService.redirectUrl
    ↓
Customer sees Cashfree payment page
    ↓
Enters card details:
  Card: 4111 1111 1111 1111 (test card)
  Exp: 12/25
  CVV: 123
    ↓
Clicks "Pay Now"
    ↓
Cashfree processes payment
    ↓
✅ Payment SUCCESSFUL
    ↓
Cashfree redirects to:
  /payment-success?order_id=ORDER-org_123-1234567890
```

---

## 5️⃣ VERIFY PAYMENT (Frontend)

```
Page loads: /payment-success?order_id=...
    ↓
Frontend detects order_id in URL
    ↓
Calls: POST /api/payment/verify
  {
    orderId: "ORDER-org_123-1234567890"
  }
    ↓
Backend payment controller:
  ├─ Gets order status from Cashfree API
  ├─ Checks if status === "PAID"
  ├─ Updates Invoice: status = "paid"
  ├─ Creates/Updates Subscription:
  │  {
  │    accountId: user_id,
  │    organizationId: org_123,
  │    planId: "pro",
  │    status: "active",
  │    startDate: now,
  │    renewalDate: now + 30 days,
  │    billingCycle: "monthly"
  │  }
  └─ Updates Organization: subscriptionId, plan, status
    ↓
✉️ Sends payment confirmation email:
    └─ emailService.sendPaymentConfirmationEmail(
         email,           // owner@company.com
         orderId,         // ORDER-org_123-...
         amount,          // 4999
         status,          // "success"
         planName         // "Pro"
       )
    ↓
Returns to Frontend:
  {
    success: true,
    subscriptionId: "sub_xyz789",
    invoiceId: "inv_abc123",
    planName: "Pro"
  }
    ↓
Frontend shows: ✅ Payment Successful!
    ↓
Redirects to: /dashboard
```

---

## 6️⃣ WEBHOOK (Backup Confirmation)

```
While customer on /payment-success page,
Cashfree sends webhook to:
  POST /api/payment/webhook/confirm
  
Headers:
  {
    "x-webhook-signature": "hex_signature",
    "x-webhook-timestamp": "1234567890"
  }

Body:
  {
    "order_id": "ORDER-org_123-1234567890",
    "order_status": "PAID",
    "order_amount": 4999,
    "customer_email": "owner@company.com"
  }
    ↓
Backend webhook handler:
  ├─ Verifies signature using CASHFREE_SECRET_KEY
  ├─ If status === "PAID":
  │  ├─ Updates Invoice: status = "paid"
  │  ├─ Creates/Updates Subscription
  │  └─ Sends payment email
  └─ Returns: { success: true }
    ↓
Cashfree marks webhook as delivered ✓
```

---

## 7️⃣ CUSTOMER DASHBOARD

```
After payment:
Customer visits /dashboard
    ↓
Dashboard page checks for subscription:
  GET /api/subscriptions/my-subscription
    ↓
Backend returns:
  {
    status: "active",
    planId: "pro",
    renewalDate: "2025-02-21",
    billingCycle: "monthly"
  }
    ↓
Dashboard shows:
  ✅ Your Subscription: Pro Plan - ACTIVE
  📅 Renews: February 21, 2025
  💚 All features unlocked!
    ↓
Customer can now:
  ├─ Send broadcasts
  ├─ Create chatbots
  ├─ Manage team
  ├─ View analytics
  └─ Download invoices
```

---

## 📧 EMAILS SENT DURING FLOW

### Email 1: Welcome Email
```
From: noreply@yourdomain.com
To: customer@email.com
Subject: 🎉 Welcome to Pixels WhatsApp Platform!

Body:
  Hi John!
  
  Your account has been created.
  You can now:
  • Send WhatsApp broadcasts
  • Create chatbots
  • Manage your team
  
  [Click here to login]
```

### Email 2: Payment Confirmation
```
From: noreply@yourdomain.com
To: customer@email.com
Subject: Payment Successful - ₹4,999

Body:
  Payment Successful ✅
  
  Plan: Pro
  Amount: ₹4,999
  Transaction ID: ORDER-org_123-...
  
  Your subscription is now active!
  
  [View Invoice]
```

---

## 🗄️ DATABASE CHANGES

### Before Payment:
```
Account {
  _id: "user_123",
  email: "customer@email.com",
  name: "John",
  role: "admin"
}

Organization {
  _id: "org_123",
  name: "John's Company",
  status: "pending"
  // No subscriptionId
}

Invoice {
  _id: "inv_123",
  status: "pending",
  amount: 4999
}
```

### After Payment:
```
Account {
  _id: "user_123",
  email: "customer@email.com",
  name: "John",
  role: "admin"
  // No change
}

Organization {
  _id: "org_123",
  name: "John's Company",
  status: "active",            // ✅ CHANGED
  subscriptionId: "sub_456",   // ✅ ADDED
  plan: "pro"                  // ✅ ADDED
}

Subscription {
  _id: "sub_456",
  accountId: "user_123",
  organizationId: "org_123",
  planId: "pro",
  status: "active",
  startDate: "2025-01-21",
  renewalDate: "2025-02-21"
}

Invoice {
  _id: "inv_123",
  status: "paid",              // ✅ CHANGED
  paidAmount: 4999,            // ✅ ADDED
  paymentDate: "2025-01-21"    // ✅ ADDED
}
```

---

## 🔄 RECURRING FLOWS

### Subscription Renewal (Monthly)
```
Every month on renewalDate:
  ↓
Send renewal reminder email:
  ✉️ "Your subscription renews tomorrow"
  ↓
On renewal date:
  ├─ Auto-charge via Cashfree Recurring
  ├─ Create new Invoice
  ├─ Update Subscription: renewalDate + 1 month
  └─ Send payment confirmation email
```

### Upgrade Plan (Pro → Premium)
```
Customer clicks: "Upgrade to Premium"
  ↓
System:
  ├─ Calculates proration: Days used / Days in month
  ├─ Creates new invoice for difference
  ├─ Processes payment via Cashfree
  └─ Updates Subscription: planId = "premium"
```

### Cancel Subscription
```
Customer clicks: "Cancel"
  ↓
Asks: "Why are you leaving?"
  ↓
System:
  ├─ Saves cancellation reason
  ├─ Updates Subscription: status = "cancelled"
  ├─ Sets endDate to today
  └─ Sends: "Sorry to see you go" email
  ↓
Features remain active until renewalDate
Then access automatically disabled
```

---

## 🔐 SECURITY FEATURES

```
✅ JWT Token for authentication
✅ Webhook signature verification
✅ HTTPS encryption for all APIs
✅ Password hashing with bcrypt
✅ API key stored in .env (not in code)
✅ Invoice only accessible by owner
✅ Payment data handled by PCI-compliant Cashfree
✅ Test cards used in sandbox mode
✅ Production mode requires KYC from Cashfree
```

---

## 📊 MONITORING

```
You can monitor:
✓ Payment success rate
✓ Email delivery rate
✓ Subscription churn rate
✓ Revenue per customer
✓ Renewal success rate

Check at:
  • Cashfree Dashboard
  • Zepto Dashboard
  • Your MongoDB logs
  • Application error logs
```

---

**Summary**: Customer signup → payment processing → automatic subscription activation → email confirmations → dashboard access. All automatic! 🚀
