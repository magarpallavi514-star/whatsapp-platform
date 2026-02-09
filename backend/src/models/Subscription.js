import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Account Reference
  accountId: {
    type: String,
    required: true,
    index: true
  },
  
  // Plan Reference
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PricingPlan',
    required: true
  },
  
  // Subscription Status
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired', 'pending_payment'],
    default: 'pending_payment',
    index: true
  },
  
  // Billing Cycle
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    required: true
  },
  
  // Pricing (snapshot at time of subscription)
  pricing: {
    amount: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    discountReason: String,
    finalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  renewalDate: {
    type: Date
  },
  cancelledDate: Date,
  cancellationReason: String,
  
  // Payment Info
  paymentGateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal', 'manual', 'cashfree'],
    required: true
  },
  paymentMethodId: String,
  transactionId: String,
  
  // ✅ CLIENT ONBOARDING: Payment Tracking (NEW FIELDS)
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  
  paymentAmount: {
    type: Number,
    default: 0
  },
  
  orderId: {
    type: String,
    index: true
  },
  
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  
  paidDate: Date,
  
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'upi', 'bank_transfer', 'wallet', 'manual']
    },
    last4: String,
    brand: String
  },
  
  // Auto Renewal
  autoRenew: {
    type: Boolean,
    default: true
  },
  nextRenewalDate: Date,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Subscription', subscriptionSchema);
