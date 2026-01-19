# Payment System Implementation Guide

## Overview

A complete payment system has been implemented with:
- **Pricing Plans Management** - Superadmin can create and manage pricing plans
- **Subscription Management** - Users can subscribe to plans
- **Payment Processing** - Secure payment initiation and confirmation
- **Invoicing System** - Automatic invoice generation and tracking
- **Billing Dashboard** - User-friendly billing interface

## Architecture

### Database Models

#### 1. **PricingPlan**
```javascript
{
  planId: String (unique),
  name: 'Starter' | 'Pro' | 'Enterprise' | 'Custom',
  description: String,
  monthlyPrice: Number,
  yearlyPrice: Number,
  currency: 'USD' | 'INR' | 'EUR',
  monthlyDiscount: Number (0-100),
  yearlyDiscount: Number (0-100),
  limits: {
    messages: Number,
    contacts: Number,
    campaigns: Number,
    apiCalls: Number,
    templates: Number,
    phoneNumbers: Number,
    users: Number,
    storageGB: Number
  },
  features: [
    {
      name: String,
      description: String,
      included: Boolean,
      limit: Number | null
    }
  ],
  isActive: Boolean,
  isPopular: Boolean,
  updatedBy: ObjectId (reference to Account)
}
```

#### 2. **Subscription**
```javascript
{
  subscriptionId: String (unique),
  accountId: ObjectId (reference to Account),
  planId: ObjectId (reference to PricingPlan),
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'pending_payment',
  billingCycle: 'monthly' | 'annual',
  pricing: {
    amount: Number,
    discount: Number,
    discountReason: String,
    finalAmount: Number,
    currency: String
  },
  startDate: Date,
  endDate: Date,
  renewalDate: Date,
  autoRenew: Boolean,
  paymentGateway: String,
  transactionId: String,
  paymentMethodId: String
}
```

#### 3. **Invoice**
```javascript
{
  invoiceId: String (unique),
  invoiceNumber: String (unique, format: INV-YYYY-XXXXXX),
  accountId: ObjectId,
  subscriptionId: ObjectId,
  invoiceDate: Date,
  dueDate: Date,
  periodStart: Date,
  periodEnd: Date,
  billTo: {
    name: String,
    email: String,
    company: String,
    address: String,
    taxId: String
  },
  lineItems: [
    {
      description: String,
      quantity: Number,
      unitPrice: Number,
      amount: Number
    }
  ],
  subtotal: Number,
  taxRate: Number,
  taxAmount: Number,
  discountAmount: Number,
  totalAmount: Number,
  paidAmount: Number,
  dueAmount: Number,
  currency: String,
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled',
  payments: [
    {
      paymentId: String,
      amount: Number,
      date: Date,
      method: String,
      status: 'success' | 'pending' | 'failed'
    }
  ],
  pdfUrl: String,
  emailSentAt: Date
}
```

#### 4. **Payment**
```javascript
{
  paymentId: String (unique),
  accountId: ObjectId,
  subscriptionId: ObjectId,
  invoiceId: ObjectId,
  amount: Number,
  currency: String,
  paymentGateway: 'stripe' | 'razorpay' | 'paypal' | 'manual_transfer',
  gatewayTransactionId: String,
  paymentMethod: {
    type: 'card' | 'upi' | 'bank_transfer' | 'wallet' | 'manual',
    last4: String,
    brand: String
  },
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded',
  initiatedAt: Date,
  completedAt: Date,
  failureReason: String,
  refundStatus: 'none' | 'partial' | 'full',
  refundAmount: Number,
  retryCount: Number
}
```

## API Endpoints

### Pricing Plans (Public)

#### Get Public Pricing Plans
```
GET /pricing/plans/public
Response: { success: true, data: [...] }
```

#### Get Plan Details
```
GET /pricing/plans/public/:planId
Response: { success: true, data: {...} }
```

### Pricing Plans (Superadmin)

#### Create Plan
```
POST /pricing/plans
Auth: Required (Superadmin only)
Body: {
  name: String (required),
  description: String,
  monthlyPrice: Number (required),
  yearlyPrice: Number (required),
  currency: String,
  monthlyDiscount: Number,
  yearlyDiscount: Number,
  limits: Object,
  features: Array,
  isPopular: Boolean
}
```

#### Update Plan
```
PUT /pricing/plans/:planId
Auth: Required (Superadmin only)
Body: { ...updateFields }
```

#### Delete Plan (soft delete)
```
DELETE /pricing/plans/:planId
Auth: Required (Superadmin only)
```

#### Add Feature to Plan
```
POST /pricing/plans/:planId/features
Auth: Required (Superadmin only)
Body: {
  name: String (required),
  description: String,
  included: Boolean,
  limit: Number
}
```

#### Remove Feature from Plan
```
DELETE /pricing/plans/:planId/features/:featureId
Auth: Required (Superadmin only)
```

### Subscriptions

#### Get My Subscription
```
GET /subscription/my-subscription
Auth: Required
Response: { success: true, data: {...} }
```

#### Create Subscription
```
POST /subscription/create
Auth: Required
Body: {
  planId: String (required),
  billingCycle: 'monthly' | 'annual' (required),
  paymentGateway: String (required),
  transactionId: String,
  paymentMethodId: String
}
```

#### Change Plan
```
POST /subscription/change-plan
Auth: Required
Body: {
  newPlanId: String (required),
  billingCycle: 'monthly' | 'annual'
}
```

#### Cancel Subscription
```
POST /subscription/cancel
Auth: Required
Body: {
  reason: String
}
```

#### Pause Subscription
```
POST /subscription/pause
Auth: Required
```

#### Resume Subscription
```
POST /subscription/resume
Auth: Required
```

### Payments

#### Initiate Payment
```
POST /payment/initiate
Auth: Required
Body: {
  planId: String (required),
  billingCycle: String (required),
  paymentGateway: String (required)
}
```

#### Get My Payments
```
GET /payment/my-payments?status=&limit=20&skip=0
Auth: Required
```

#### Get Payment Details
```
GET /payment/:paymentId
Auth: Required
```

#### Confirm Payment (Webhook)
```
POST /payment/webhook/confirm
Auth: Not required
Body: {
  paymentId: String,
  gatewayTransactionId: String,
  status: 'completed' | 'failed',
  amount: Number,
  failureReason: String
}
```

#### Refund Payment
```
POST /payment/:paymentId/refund
Auth: Required (Superadmin only)
Body: {
  reason: String,
  refundAmount: Number
}
```

### Invoices

#### Get My Invoices
```
GET /invoice/my-invoices?status=&limit=20&skip=0
Auth: Required
```

#### Get Invoice
```
GET /invoice/:invoiceId
Auth: Required (Own or Superadmin)
```

#### Create Invoice
```
POST /invoice/create
Auth: Required (Superadmin only)
Body: {
  accountId: String (required),
  subscriptionId: String (required),
  billTo: Object,
  lineItems: Array,
  subtotal: Number,
  taxRate: Number,
  discountAmount: Number,
  totalAmount: Number
}
```

#### Update Invoice
```
PUT /invoice/:invoiceId
Auth: Required (Superadmin only)
```

#### Send Invoice Email
```
POST /invoice/:invoiceId/send-email
Auth: Required
Body: {
  recipientEmail: String
}
```

#### Record Payment
```
POST /invoice/:invoiceId/record-payment
Auth: Required
Body: {
  amount: Number,
  paymentMethod: String,
  transactionId: String
}
```

## Frontend Components

### 1. **PricingCards** (`/components/PricingCards.tsx`)
Public pricing cards display with:
- Plan listing
- Feature comparison
- Monthly/Annual toggle
- Pricing with discounts
- CTA buttons to checkout

**Usage:**
```tsx
import PricingCards from '@/components/PricingCards';

export default function PricingPage() {
  return <PricingCards />;
}
```

### 2. **CheckoutPage** (`/components/CheckoutPage.tsx`)
Multi-step checkout form:
- Step 1: Order summary
- Step 2: Billing information
- Step 3: Payment method selection

**Usage:**
```tsx
import CheckoutPage from '@/components/CheckoutPage';
```

### 3. **SuperadminPricingDashboard** (`/components/SuperadminPricingDashboard.tsx`)
Superadmin panel for managing plans:
- Create/Edit/Delete plans
- Add/Remove features
- Mark plans as popular
- Manage pricing and discounts

**Usage:**
```tsx
import SuperadminPricingDashboard from '@/components/SuperadminPricingDashboard';
```

### 4. **BillingDashboard** (`/components/BillingDashboard.tsx`)
User's billing dashboard:
- Current subscription details
- Plan change
- Pause/Resume/Cancel options
- Pricing breakdown

**Usage:**
```tsx
import BillingDashboard from '@/components/BillingDashboard';
```

### 5. **InvoicesPage** (`/components/InvoicesPage.tsx`)
Invoice management:
- View all invoices
- Filter by status
- Download invoices
- Track payments

**Usage:**
```tsx
import InvoicesPage from '@/components/InvoicesPage';
```

## Payment Gateway Integration

### Stripe Integration (Example)
Add this to your payment processing:

```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const paymentIntent = await stripe.paymentIntents.create({
  amount: subscription.pricing.finalAmount * 100, // in cents
  currency: subscription.pricing.currency.toLowerCase(),
  metadata: {
    subscriptionId: subscription.subscriptionId,
    accountId: accountId
  }
});
```

### Razorpay Integration (Example)
```javascript
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const order = await instance.orders.create({
  amount: subscription.pricing.finalAmount * 100, // in paise
  currency: subscription.pricing.currency,
  receipt: subscription.subscriptionId,
  notes: {
    accountId: accountId
  }
});
```

## Setup Instructions

### 1. Add Routes to Backend

In your `server.js` or `app.js`:

```javascript
import pricingRoutes from './src/routes/pricingRoutes.js';
import subscriptionRoutes from './src/routes/subscriptionRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import invoiceRoutes from './src/routes/invoiceRoutes.js';

app.use('/api/pricing', pricingRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/invoice', invoiceRoutes);
```

### 2. Update Account Model

Add subscription reference in Account model:
```javascript
subscription: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Subscription'
},
plan: String
```

### 3. Set Environment Variables

Backend `.env`:
```
STRIPE_SECRET_KEY=your_key
STRIPE_PUBLIC_KEY=your_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_key
PAYPAL_CLIENT_ID=your_key
PAYPAL_SECRET=your_key
```

Frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_key
```

### 4. Create Seed Data

Create initial pricing plans:
```javascript
const starterPlan = await PricingPlan.create({
  planId: 'plan_starter',
  name: 'Starter',
  monthlyPrice: 29,
  yearlyPrice: 290,
  features: [
    { name: '100 Contacts', included: true },
    { name: 'Basic Analytics', included: true },
    { name: 'Email Support', included: false }
  ]
});
```

## Workflow

### Subscription Flow

1. **User views pricing** → `PricingCards` component
2. **User selects plan** → Navigate to checkout
3. **User fills billing info** → `CheckoutPage`
4. **Payment processed** → Payment gateway
5. **Webhook confirmation** → `POST /payment/webhook/confirm`
6. **Subscription created** → `Subscription` model
7. **Invoice generated** → `Invoice` model
8. **User dashboard updated** → `BillingDashboard`

### Superadmin Workflow

1. **Manage pricing plans** → `SuperadminPricingDashboard`
2. **Create/Edit/Delete plans** → API endpoints
3. **View all subscriptions** → `GET /subscription`
4. **View all invoices** → `GET /invoice`
5. **View payment statistics** → `GET /payment/stats/overview`

## Testing Checklist

- [ ] Create pricing plans via admin dashboard
- [ ] View pricing cards on public website
- [ ] Toggle between monthly/annual billing
- [ ] Complete checkout flow
- [ ] Test different payment methods
- [ ] Verify subscription creation
- [ ] Test plan upgrades/downgrades
- [ ] Test subscription pause/resume
- [ ] Test subscription cancellation
- [ ] Verify invoices are generated
- [ ] Test invoice payment recording
- [ ] Test payment refunds

## Future Enhancements

1. **Email Notifications**
   - Invoice email delivery
   - Renewal reminders
   - Payment confirmations

2. **Usage Tracking**
   - Monitor plan limits
   - Alert when approaching limits
   - Overage billing

3. **Dunning Management**
   - Retry failed payments
   - Notify about payment failures
   - Automated suspension after failed payments

4. **Analytics**
   - Subscription metrics
   - Revenue reports
   - Churn analysis

5. **Coupons & Promotions**
   - Discount code management
   - Affiliate tracking
   - Seasonal promotions

6. **Multi-Currency**
   - Automatic currency conversion
   - Tax calculation by country
   - Regional payment methods

7. **Advanced Billing**
   - Usage-based billing
   - Seat-based pricing
   - Custom billing cycles
