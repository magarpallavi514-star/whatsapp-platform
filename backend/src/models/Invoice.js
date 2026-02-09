import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Invoice Number (for display: INV-2024-001)
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Account Reference (7-digit universal identifier: YYXXXXX)
  accountId: {
    type: String,
    required: true,
    index: true
  },
  
  // Subscription Reference
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  
  // Invoice Dates
  invoiceDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  periodStart: Date,
  periodEnd: Date,
  
  // Billing Details
  billTo: {
    name: String,
    email: String,
    phone: String,
    company: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    taxId: String // VAT/GST ID
  },
  
  // Line Items
  lineItems: [{
    description: String,
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: Number,
    amount: Number
  }],
  
  // Totals
  subtotal: {
    type: Number,
    required: true
  },
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  dueAmount: {
    type: Number,
    required: true
  },
  
  // ✅ CLIENT ONBOARDING: Payment Tracking (NEW FIELDS)
  paidDate: {
    type: Date,
    default: null
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  
  // Currency
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Payment Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  // Payment Records
  payments: [{
    paymentId: String,
    amount: Number,
    date: Date,
    method: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['success', 'pending', 'failed'],
      default: 'pending'
    }
  }],
  
  // Notes & References
  notes: String,
  paymentTerms: String,
  paymentInstructions: String,
  
  // Documents
  pdfUrl: String,
  emailSentAt: Date,
  
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

export default mongoose.model('Invoice', invoiceSchema);
