# 🚀 Production Launch Guide - Complete Checklist

**Status**: Ready for Production Launch  
**Date**: January 21, 2026  
**Target**: Launch complete client onboarding platform with payments and emails

---

## 📋 Step-by-Step Implementation

### ✅ Step 1: Buy Domain (Manual Task)
**Status**: 🟡 IN PROGRESS

**Where to buy:**
- Namecheap.com (cheapest)
- GoDaddy.com (popular)
- Google Domains (easiest)

**Suggested domain names:**
- pixels-whatsapp.com
- pixelwhatsapp.io
- whatsappbusiness.pixels.com
- yourbrandname-whatsapp.io

**Cost:** ₹500-1500/year

**Next steps after buying:**
1. Note down the domain nameservers
2. Get API access credentials (for DNS management)
3. Add to environment variables

---

### 🔧 Step 2: Integrate Zepto Email Service
**Status**: 🔴 NOT STARTED

#### 2a. Install Zepto Package
```bash
cd backend
npm install zepto-sdk
# or
npm install nodemailer  # Alternative: free SMTP service
```

#### 2b. Create Email Service File

Create `backend/src/services/emailService.js`:

```javascript
import axios from 'axios';

const ZEPTO_API_KEY = process.env.ZEPTO_API_KEY;
const ZEPTO_BASE_URL = 'https://api.zeptomail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

export const emailService = {
  // Send welcome email on signup
  sendWelcomeEmail: async (email, name) => {
    try {
      const response = await axios.post(
        `${ZEPTO_BASE_URL}/v1.1/email/send`,
        {
          from: { address: FROM_EMAIL, name: 'Pixels WhatsApp' },
          to: [{ email_address: { address: email } }],
          subject: '🎉 Welcome to Pixels WhatsApp Platform!',
          htmlbody: `
            <h2>Welcome ${name}!</h2>
            <p>Your account has been created successfully.</p>
            <p><a href="${process.env.FRONTEND_URL}/login">Click here to login</a></p>
          `
        },
        {
          headers: {
            'Authorization': ZEPTO_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Welcome email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Email failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send invoice email
  sendInvoiceEmail: async (email, invoiceNumber, pdfUrl, amount) => {
    try {
      const response = await axios.post(
        `${ZEPTO_BASE_URL}/v1.1/email/send`,
        {
          from: { address: FROM_EMAIL, name: 'Pixels WhatsApp Billing' },
          to: [{ email_address: { address: email } }],
          subject: `Invoice #${invoiceNumber} - Pixels WhatsApp`,
          htmlbody: `
            <h2>Invoice #${invoiceNumber}</h2>
            <p>Amount Due: ₹${amount}</p>
            <p><a href="${pdfUrl}">Download Invoice</a></p>
          `
        },
        {
          headers: {
            'Authorization': ZEPTO_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Invoice email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Invoice email failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (email, resetToken) => {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
      const response = await axios.post(
        `${ZEPTO_BASE_URL}/v1.1/email/send`,
        {
          from: { address: FROM_EMAIL, name: 'Pixels WhatsApp' },
          to: [{ email_address: { address: email } }],
          subject: '🔐 Password Reset Request',
          htmlbody: `
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your password:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>This link expires in 1 hour.</p>
          `
        },
        {
          headers: {
            'Authorization': ZEPTO_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Password reset email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Password reset email failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send payment confirmation email
  sendPaymentConfirmationEmail: async (email, transactionId, amount, status) => {
    try {
      const response = await axios.post(
        `${ZEPTO_BASE_URL}/v1.1/email/send`,
        {
          from: { address: FROM_EMAIL, name: 'Pixels WhatsApp Payments' },
          to: [{ email_address: { address: email } }],
          subject: `Payment Confirmation - ₹${amount}`,
          htmlbody: `
            <h2>Payment ${status === 'success' ? 'Successful ✅' : 'Failed ❌'}</h2>
            <p>Transaction ID: ${transactionId}</p>
            <p>Amount: ₹${amount}</p>
            <p>Status: ${status}</p>
            <p><a href="${process.env.FRONTEND_URL}/dashboard/invoices">View Invoice</a></p>
          `
        },
        {
          headers: {
            'Authorization': ZEPTO_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Payment confirmation email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Payment email failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};
```

#### 2c. Update .env file
```bash
# Email Configuration
ZEPTO_API_KEY=your_zepto_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

#### 2d. Get Zepto API Key
1. Go to [Zepto Mail](https://www.zeptomail.com/)
2. Sign up for free account
3. Get API key from dashboard
4. Verify your sender email domain

---

### 💳 Step 3: Integrate Cashfree Payments
**Status**: 🔴 NOT STARTED

#### 3a. Install Cashfree SDK
```bash
cd backend
npm install cashfree-pg
```

#### 3b. Create Payment Service File

Create `backend/src/services/cashfreeService.js`:

```javascript
import Cashfree from 'cashfree-pg';

// Initialize Cashfree
const cashfree = new Cashfree({
  version: '2023-08-01',
  publicKey: process.env.CASHFREE_PUBLIC_KEY,
  secretKey: process.env.CASHFREE_SECRET_KEY
});

export const cashfreeService = {
  // Create payment order
  createOrder: async (orderData) => {
    try {
      const response = await cashfree.PgCreateOrder({
        order_id: orderData.orderId,
        order_amount: orderData.amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: orderData.customerId,
          customer_email: orderData.email,
          customer_phone: orderData.phone
        },
        order_meta: {
          notify_url: `${process.env.BACKEND_URL}/api/payment/webhook/confirm`,
          return_url: `${process.env.FRONTEND_URL}/payment-success?order_id=${orderData.orderId}`
        },
        order_note: orderData.description || 'WhatsApp Platform Subscription'
      });

      console.log('✅ Cashfree order created:', response.order_id);
      return {
        success: true,
        orderId: response.order_id,
        paymentSessionId: response.payment_session_id,
        redirectUrl: response.redirect_url
      };
    } catch (error) {
      console.error('❌ Cashfree order creation failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Get order status
  getOrderStatus: async (orderId) => {
    try {
      const response = await cashfree.PgOrderFetchPayments({
        order_id: orderId
      });

      const payment = response.payments?.[0];
      return {
        success: true,
        status: payment?.payment_status || 'PENDING',
        paymentId: payment?.cf_payment_id,
        amount: payment?.payment_amount
      };
    } catch (error) {
      console.error('❌ Order status fetch failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Verify payment webhook
  verifyWebhookSignature: (signature, body, timestamp) => {
    try {
      // Cashfree provides verification method
      const isValid = cashfree.PgVerifyWebhookSignature(
        signature,
        body,
        timestamp
      );
      return isValid;
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error);
      return false;
    }
  }
};
```

#### 3c. Create Payment Controller

Create `backend/src/controllers/cashfreePaymentController.js`:

```javascript
import { cashfreeService } from '../services/cashfreeService.js';
import { Invoice } from '../models/Invoice.js';
import { Subscription } from '../models/Subscription.js';
import { emailService } from '../services/emailService.js';

export const createPaymentOrder = async (req, res) => {
  try {
    const { planId, billingCycle, accountId } = req.body;
    
    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Calculate amount
    const amount = billingCycle === 'annual' ? plan.yearlyPrice : plan.monthlyPrice;
    
    // Create order in Cashfree
    const orderData = {
      orderId: `ORDER-${Date.now()}`,
      customerId: accountId,
      email: req.user.email,
      phone: req.user.phoneNumber,
      amount: amount,
      description: `${plan.name} Plan - ${billingCycle}`
    };

    const result = await cashfreeService.createOrder(orderData);
    
    if (result.success) {
      // Create invoice
      const invoice = await Invoice.create({
        invoiceNumber: `INV-${Date.now()}`,
        accountId: accountId,
        planId: planId,
        amount: amount,
        status: 'pending',
        description: orderData.description,
        orderId: orderData.orderId
      });

      res.json({
        success: true,
        paymentSessionId: result.paymentSessionId,
        redirectUrl: result.redirectUrl,
        invoiceId: invoice._id
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Payment creation failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentSessionId } = req.body;

    // Get order status from Cashfree
    const orderStatus = await cashfreeService.getOrderStatus(orderId);

    if (!orderStatus.success || orderStatus.status !== 'SETTLED') {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update invoice
    const invoice = await Invoice.findOneAndUpdate(
      { orderId: orderId },
      { status: 'paid', paidAmount: orderStatus.amount },
      { new: true }
    );

    // Create or update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { accountId: invoice.accountId },
      {
        planId: invoice.planId,
        status: 'active',
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    // Send confirmation email
    await emailService.sendPaymentConfirmationEmail(
      req.user.email,
      orderId,
      orderStatus.amount,
      'success'
    );

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscriptionId: subscription._id
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const { body } = req;
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];

    // Verify webhook signature
    const isValid = cashfreeService.verifyWebhookSignature(signature, body, timestamp);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const { order_id, payment_status, payment_amount, customer_email } = body;

    if (payment_status === 'SETTLED') {
      // Update invoice
      await Invoice.findOneAndUpdate(
        { orderId: order_id },
        { status: 'paid', paidAmount: payment_amount }
      );

      // Send email
      await emailService.sendPaymentConfirmationEmail(
        customer_email,
        order_id,
        payment_amount,
        'success'
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook handling failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

#### 3d. Add Payment Routes

Create/Update `backend/src/routes/paymentRoutes.js`:

```javascript
import express from 'express';
import { requireJWT } from '../middlewares/authMiddleware.js';
import {
  createPaymentOrder,
  verifyPayment,
  handleWebhook
} from '../controllers/cashfreePaymentController.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/create-order', requireJWT, createPaymentOrder);
router.post('/verify', requireJWT, verifyPayment);

// Webhook (no auth required)
router.post('/webhook/confirm', handleWebhook);

export default router;
```

#### 3e. Update app.js

Add to `backend/src/app.js`:

```javascript
import paymentRoutes from './routes/paymentRoutes.js';

// Add this line with other route mounts
app.use('/api/payment', paymentRoutes);
```

#### 3f. Update .env file
```bash
# Cashfree Configuration
CASHFREE_PUBLIC_KEY=your_public_key_here
CASHFREE_SECRET_KEY=your_secret_key_here
BACKEND_URL=https://api.yourdomain.com
```

#### 3g. Get Cashfree Credentials
1. Go to [Cashfree Dashboard](https://dashboard.cashfree.com/)
2. Sign up or login
3. Go to Settings → API Keys
4. Copy Public Key and Secret Key
5. Add to .env file

---

### 🌐 Step 4: Build Public Marketing Site
**Status**: 🔴 NOT STARTED

The landing page already exists at `/` but needs to be updated to showcase all features.

#### 4a. Create Features Page

Create `frontend/app/features/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Megaphone, Bot, Send, Users, BarChart3, Target, FileText, 
  CreditCard, Clock, Shield, HeadphonesIcon, Zap, Lock, Globe
} from "lucide-react"

const features = [
  {
    icon: Megaphone,
    title: "Broadcast Messages",
    description: "Send promotional messages to thousands of customers with 98% open rates"
  },
  {
    icon: Bot,
    title: "AI Chatbot",
    description: "No-code chatbot builder with drag-and-drop flows"
  },
  {
    icon: Send,
    title: "Message Templates",
    description: "Pre-approved marketing templates for instant delivery"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Manage multiple agents on same WhatsApp number"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track delivery, open rates, clicks, and ROI"
  },
  {
    icon: Target,
    title: "Click-to-WhatsApp Ads",
    description: "Run Meta ads directly to WhatsApp"
  },
  {
    icon: FileText,
    title: "Lead Capture Forms",
    description: "Collect leads directly in WhatsApp chat"
  },
  {
    icon: CreditCard,
    title: "Payment Links",
    description: "Accept payments through WhatsApp"
  },
  {
    icon: Clock,
    title: "Campaign Scheduler",
    description: "Schedule campaigns weeks or months in advance"
  },
  {
    icon: Shield,
    title: "Official Green Tick",
    description: "Get verified badge on WhatsApp business account"
  },
  {
    icon: HeadphonesIcon,
    title: "Customer Support",
    description: "Live chat dashboard for instant customer support"
  },
  {
    icon: Zap,
    title: "Webhook Integration",
    description: "Connect to your existing systems via webhooks"
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Powerful WhatsApp Marketing Features
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to run successful WhatsApp marketing campaigns
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition">
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-blue-50 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of businesses using Pixels WhatsApp
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

#### 4b. Update Frontend App Layout

Update `frontend/app/layout.tsx` to include proper meta tags:

```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pixels WhatsApp - WhatsApp Marketing Platform",
  description: "Send broadcasts, chatbots, and automation on WhatsApp. Start free today.",
  keywords: "WhatsApp marketing, chatbot, broadcasting, CRM",
  openGraph: {
    title: "Pixels WhatsApp",
    description: "WhatsApp marketing platform for businesses",
    type: "website",
    url: "https://yourdomain.com",
    images: [{ url: "https://yourdomain.com/og-image.png" }]
  }
}

export default function RootLayout({ children }) {
  // ... rest of layout
}
```

#### 4c. Create Signup Page

Create `frontend/app/signup/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    const result = await authService.signup(
      formData.name,
      formData.email,
      formData.password,
      formData.company,
      formData.phone
    )

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Signup failed")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600 mb-6">Start your free WhatsApp marketing journey</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-gray-600 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### 🌍 Step 5: Setup Domain & SSL
**Status**: 🔴 NOT STARTED

#### 5a. Configure DNS

After buying domain, point it to your server:

1. **If using Railway (current hosting):**
   - Get your Railway domain from dashboard
   - Add CNAME record: `yourdomain.com → your-railway-app.up.railway.app`

2. **If using custom VPS:**
   - Point A record to your server IP
   - Setup nginx/Apache

#### 5b. Setup SSL Certificate

**If using Railway:** SSL is automatic ✅

**If using custom server:**
```bash
# Install Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

#### 5c. Update Environment Variables

Update `.env` files with new domain:

**Backend (.env):**
```bash
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
NODE_ENV=production
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
```

---

## 📊 Implementation Checklist

- [ ] 1. Buy domain
- [ ] 2. Zepto email setup (API key, templates)
- [ ] 3. Cashfree payment setup (API keys, webhook)
- [ ] 4. Backend email service file created
- [ ] 5. Backend payment controller created
- [ ] 6. Payment routes added to app.js
- [ ] 7. Public features page created
- [ ] 8. Public signup page created
- [ ] 9. Meta tags updated for SEO
- [ ] 10. DNS configured for domain
- [ ] 11. SSL certificate installed
- [ ] 12. Environment variables updated
- [ ] 13. Test signup flow end-to-end
- [ ] 14. Test payment flow with test credentials
- [ ] 15. Test email sending (welcome, invoice, reset)

---

## 🧪 Testing Before Launch

### Email Testing
```bash
# Test Zepto connection
curl -X POST https://api.zeptomail.com/v1.1/email/send \
  -H "Authorization: Zoho-enczapikey YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":{"address":"test@yourdomain.com"},"to":[{"email_address":{"address":"your-email@gmail.com"}}],"subject":"Test","htmlbody":"<h1>Test Email</h1>"}'
```

### Payment Testing
1. Use Cashfree test credentials (provided in sandbox)
2. Test card: 4111 1111 1111 1111
3. Expiry: Any future date
4. CVV: Any 3 digits
5. Verify webhook is being triggered

### Signup Flow
1. Go to /signup
2. Create test account
3. Should receive welcome email
4. Login and go to /checkout
5. Select plan and complete payment
6. Should receive invoice email
7. Check dashboard for active subscription

---

## 🚀 Launch Day Checklist

- [ ] All .env variables are set correctly
- [ ] Backend deployment completed
- [ ] Frontend deployment completed
- [ ] Domain DNS propagated (wait 24 hours if needed)
- [ ] SSL certificate is valid
- [ ] Payment webhook is working
- [ ] Email service is sending
- [ ] Monitor logs for any errors
- [ ] Test on mobile device
- [ ] Announce on social media

---

## 📞 Support & Troubleshooting

**Email not sending?**
- Check Zepto API key
- Verify sender email is approved
- Check spam folder
- Monitor logs

**Payment not processing?**
- Verify Cashfree API keys
- Check webhook is registered
- Test with sandbox credentials first
- Monitor transaction logs

**Domain issues?**
- Wait 24 hours for DNS propagation
- Check with `nslookup yourdomain.com`
- Verify SSL certificate with `ssl-test.com`

---

**Created**: January 21, 2026  
**Next Review**: After first customer signup  
**Questions?** Check the main README.md or PROJECT-STATUS.md
