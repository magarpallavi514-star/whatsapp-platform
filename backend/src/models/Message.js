import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Multi-tenant isolation
  accountId: {
    type: String,
    required: true,
    index: true
  },
  
  // CRITICAL: For multi-number analytics
  phoneNumberId: {
    type: String,
    required: true,
    index: true
  },
  
  // Message identity
  waMessageId: {
    type: String,
    index: true
  },
  
  // Recipient
  recipientPhone: {
    type: String,
    required: true
  },
  recipientName: String,
  
  // Message content
  messageType: {
    type: String,
    enum: ['text', 'template', 'media', 'interactive'],
    default: 'text'
  },
  content: {
    text: String,
    templateName: String,
    templateParams: [String],
    mediaUrl: String,
    mediaType: String
  },
  
  // Status tracking (matches Meta lifecycle)
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
    default: 'queued'
  },
  statusUpdates: [{
    status: String,
    timestamp: Date,
    errorCode: String,
    errorMessage: String
  }],
  
  // Direction
  direction: {
    type: String,
    enum: ['outbound', 'inbound'],
    default: 'outbound'
  },
  
  // Campaign tracking
  campaign: {
    type: String,
    default: 'manual'
  },
  
  // Timestamps
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  failedAt: Date,
  
  // Error info
  errorCode: String,
  errorMessage: String
}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ accountId: 1, createdAt: -1 });
messageSchema.index({ accountId: 1, phoneNumberId: 1, createdAt: -1 });
messageSchema.index({ accountId: 1, status: 1 });
messageSchema.index({ accountId: 1, recipientPhone: 1 });
messageSchema.index({ waMessageId: 1 });

export default mongoose.model('Message', messageSchema);
