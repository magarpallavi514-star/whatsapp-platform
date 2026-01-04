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
    enum: ['text', 'template', 'media', 'interactive', 'image', 'video', 'audio', 'document'],
    default: 'text'
  },
  content: {
    text: String,
    templateName: String,
    templateParams: [String],
    
    // Media fields (S3 storage)
    mediaUrl: String,           // S3 public URL
    mediaType: String,          // image/video/audio/document
    mediaId: String,            // Original WhatsApp media ID
    s3Key: String,              // S3 object key
    filename: String,           // Original filename
    mimeType: String,           // MIME type (image/jpeg, etc.)
    fileSize: Number,           // File size in bytes
    sha256: String,             // File hash from WhatsApp
    
    // Interactive message fields
    caption: String,            // Media caption
    buttonText: String,
    listTitle: String
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
