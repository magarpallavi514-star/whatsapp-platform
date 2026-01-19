# Payment System Integration Checklist

## ✅ What's Been Built

### Backend Components
- [x] **Database Models**
  - PricingPlan.js - Plan definitions with features and limits
  - Subscription.js - User subscriptions tracking
  - Invoice.js - Invoice generation and tracking
  - Payment.js - Payment transaction records

- [x] **Controllers**
  - pricingController.js - Manage pricing plans
  - subscriptionController.js - Handle subscriptions
  - paymentController.js - Process payments
  - invoiceController.js - Generate and track invoices

- [x] **Routes**
  - pricingRoutes.js - Pricing endpoints
  - subscriptionRoutes.js - Subscription endpoints
  - paymentRoutes.js - Payment endpoints
  - invoiceRoutes.js - Invoice endpoints

- [x] **Utilities**
  - idGenerator.js - Generate unique IDs for entities

### Frontend Components
- [x] **PricingCards.tsx** - Public pricing display with monthly/annual toggle
- [x] **CheckoutPage.tsx** - Multi-step checkout form
- [x] **SuperadminPricingDashboard.tsx** - Admin pricing management
- [x] **BillingDashboard.tsx** - User subscription management
- [x] **InvoicesPage.tsx** - Invoice viewing and download

## 🔧 Integration Steps

### Step 1: Connect Routes to Backend Server
**File:** `backend/server.js` or `backend/src/app.js`

```javascript
import pricingRoutes from './src/routes/pricingRoutes.js';
import subscriptionRoutes from './src/routes/subscriptionRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import invoiceRoutes from './src/routes/invoiceRoutes.js';

// Add these before other routes
app.use('/api/pricing', pricingRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/invoice', invoiceRoutes);
```

### Step 2: Update Account Model
**File:** `backend/src/models/Account.js`

Add these fields to the schema:
```javascript
subscription: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Subscription',
  sparse: true
},
plan: {
  type: String,
  enum: ['Starter', 'Pro', 'Enterprise', 'Custom'],
  default: null
}
```

### Step 3: Seed Initial Pricing Plans
```bash
cd backend
node seed-pricing-plans.js
```

This creates three demo plans:
- **Starter** - $29/month
- **Pro** - $99/month (marked as popular)
- **Enterprise** - $299/month

### Step 4: Set Environment Variables

**Backend `.env`:**
```env
# Stripe Integration (when ready)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx

# Razorpay Integration (when ready)
RAZORPAY_KEY_ID=xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# PayPal Integration (when ready)
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_SECRET=xxxxx

# Email Service (for invoices)
SENDGRID_API_KEY=xxxxx
EMAIL_FROM=billing@yourdomain.com
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

### Step 5: Create Frontend Pages

Create these new pages in `frontend/app/`:

**1. Pricing Page** - `frontend/app/pricing/page.tsx`
```tsx
'use client';
import PricingCards from '@/components/PricingCards';
export default function PricingPage() {
  return <PricingCards />;
}
```

**2. Checkout Page** - `frontend/app/checkout/page.tsx`
```tsx
'use client';
import CheckoutPage from '@/components/CheckoutPage';
export default function Checkout() {
  return <CheckoutPage />;
}
```

**3. Billing Page** - `frontend/app/dashboard/billing/page.tsx`
```tsx
'use client';
import BillingDashboard from '@/components/BillingDashboard';
export default function Billing() {
  return <BillingDashboard />;
}
```

**4. Invoices Page** - `frontend/app/dashboard/invoices/page.tsx`
```tsx
'use client';
import InvoicesPage from '@/components/InvoicesPage';
export default function Invoices() {
  return <InvoicesPage />;
}
```

**5. Admin Pricing Dashboard** - `frontend/app/admin/pricing/page.tsx`
```tsx
'use client';
import SuperadminPricingDashboard from '@/components/SuperadminPricingDashboard';
export default function AdminPricing() {
  return <SuperadminPricingDashboard />;
}
```

### Step 6: Add Navigation Links

Update your navigation to include:
- `/pricing` - Pricing page
- `/dashboard/billing` - Billing dashboard
- `/dashboard/invoices` - Invoices page
- `/admin/pricing` - Admin pricing management

## 🚀 Payment Gateway Setup (Choose One)

### Option A: Stripe Integration

1. Sign up at https://stripe.com
2. Get API keys from dashboard
3. Add to `.env` file
4. Update `paymentController.js`:

```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// In confirmPayment function:
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(payment.amount * 100),
  currency: payment.currency.toLowerCase(),
  metadata: { paymentId: payment.paymentId }
});
```

### Option B: Razorpay Integration

1. Sign up at https://razorpay.com
2. Get API keys
3. Add to `.env` file
4. Update `paymentController.js`:

```javascript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// In confirmPayment function:
const order = await razorpay.orders.create({
  amount: Math.round(payment.amount * 100),
  currency: payment.currency,
  receipt: payment.paymentId
});
```

## 📋 Testing Workflow

### 1. Test Public Pricing Page
- [ ] Visit `/pricing`
- [ ] Toggle monthly/annual billing
- [ ] See different prices and discounts
- [ ] Click "Get Started" button

### 2. Test Checkout Flow
- [ ] Fill in billing information
- [ ] Select payment method
- [ ] Complete purchase form

### 3. Test Admin Dashboard
- [ ] Login as superadmin
- [ ] Visit `/admin/pricing`
- [ ] Create new plan
- [ ] Add features to plan
- [ ] Edit plan pricing
- [ ] Delete plan

### 4. Test Subscription Management
- [ ] Subscribe to plan via checkout
- [ ] View subscription in billing dashboard
- [ ] Change to different plan
- [ ] Pause subscription
- [ ] Resume subscription
- [ ] Cancel subscription

### 5. Test Invoices
- [ ] Create invoice via admin
- [ ] View invoices in user dashboard
- [ ] Record payment
- [ ] Download invoice

## 📊 Database Queries

### Create Test Subscription
```javascript
const subscription = await Subscription.create({
  subscriptionId: 'sub_test123',
  accountId: 'account_id_here',
  planId: 'plan_id_here',
  status: 'active',
  billingCycle: 'monthly',
  pricing: { amount: 99, discount: 0, finalAmount: 99, currency: 'USD' },
  startDate: new Date(),
  endDate: new Date(Date.now() + 30*24*60*60*1000),
  paymentGateway: 'stripe'
});
```

### Get All Plans
```javascript
const plans = await PricingPlan.find({ isActive: true }).sort({ monthlyPrice: 1 });
```

### Get User Subscription
```javascript
const subscription = await Subscription.findOne({ accountId }).populate('planId');
```

## 🔐 Security Checklist

- [ ] All payment endpoints require authentication
- [ ] Superadmin routes check `req.account.type === 'internal'`
- [ ] Payment amounts validated before processing
- [ ] Sensitive data (API keys, card numbers) not logged
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Rate limiting on payment endpoints
- [ ] Webhook signature verification implemented

## 📞 Webhook Setup

Add webhook handler for payment gateway confirmations:

```javascript
// Backend route for webhooks (no auth required)
router.post('/webhook/confirm', paymentController.confirmPayment);

// This receives payment confirmation from:
// - Stripe: POST to /payment/webhook/confirm with gateway data
// - Razorpay: Webhook configured in dashboard
// - PayPal: Webhook IPN to /payment/webhook/confirm
```

## 🎯 Next Steps After Integration

1. **Email Notifications**
   - Invoice email delivery via SendGrid
   - Renewal reminders
   - Payment confirmations

2. **Usage Tracking**
   - Monitor plan limits
   - Alert when approaching limits
   - Overage billing options

3. **Coupons & Promotions**
   - Discount code management
   - Affiliate tracking
   - Seasonal promotions

4. **Analytics**
   - Subscription metrics dashboard
   - Revenue reports
   - Churn analysis

5. **Regional Features**
   - Multi-currency support
   - Tax calculation
   - Regional payment methods

## 📚 Documentation Files

- `PAYMENT-SYSTEM-GUIDE.md` - Complete system documentation
- `seed-pricing-plans.js` - Initial data setup
- `idGenerator.js` - Utility functions

## ⚠️ Important Notes

1. **Payment Gateway**: You'll need to sign up with one of the payment providers (Stripe, Razorpay, PayPal) to accept real payments
2. **Email Service**: Implement email service for invoice delivery
3. **PDF Generation**: Add library to generate invoice PDFs
4. **Webhook Verification**: Verify webhook signatures from payment gateway
5. **Testing**: Use sandbox/test credentials during development

## 💡 Tips

- Start with one payment gateway first
- Test thoroughly in development
- Use test/sandbox credentials for initial testing
- Implement logging for payment events
- Set up monitoring for failed payments
- Plan for handling edge cases (failed payments, refunds, etc.)

---

**When ready to accept payments, provide your payment gateway credentials and we'll complete the integration!**
