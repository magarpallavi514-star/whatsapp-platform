import mongoose from 'mongoose';

/**
 * Conversation = THREAD (one per user + phone number)
 * Industry standard pattern (Twilio / Interakt / WATI)
 * 
 * CRITICAL: This does NOT store message content
 * Messages are stored separately in Message model
 */
const conversationSchema = new mongoose.Schema({
  // Multi-tenant isolation - Use ObjectId (MongoDB standard)
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true
  },
  
  // Workspace isolation (for multi-workspace accounts)
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  
  // Phone number this conversation belongs to
  phoneNumberId: {
    type: String,
    required: true,
    index: true
  },
  
  // Conversation identity (unique per account + phone + user)
  conversationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User/Contact info
  userPhone: {
    type: String,
    required: true
  },
  userName: String,
  userProfileName: String,
  
  // Last message preview (for inbox list)
  lastMessageAt: {
    type: Date,
    required: true
  },
  lastMessagePreview: {
    type: String,
    maxlength: 200
  },
  lastMessageType: String, // 'text', 'image', etc.
  
  // Status
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  
  // Unread tracking
  unreadCount: {
    type: Number,
    default: 0
  },
  
  // Assignment (Phase 2)
  assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Metadata
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [String],
  notes: String,
  
  // Last interaction tracking
  lastReadAt: Date,
  lastRepliedAt: Date
}, {
  timestamps: true
});

// Indexes for inbox queries
conversationSchema.index({ accountId: 1, workspaceId: 1, phoneNumberId: 1, lastMessageAt: -1 });
conversationSchema.index({ accountId: 1, workspaceId: 1, status: 1, lastMessageAt: -1 });
conversationSchema.index({ workspaceId: 1, phoneNumberId: 1, lastMessageAt: -1 });
conversationSchema.index({ accountId: 1, workspaceId: 1, unreadCount: 1 });
conversationSchema.index({ conversationId: 1 });
conversationSchema.index({ userPhone: 1 });

// Static method to get conversations with preview
conversationSchema.statics.getInboxList = async function(accountId, workspaceId, phoneNumberId, limit = 50) {
  return this.find({ 
    accountId, 
    workspaceId,
    ...(phoneNumberId && { phoneNumberId })
  })
  .sort({ lastMessageAt: -1 })
  .limit(limit)
  .lean();
};

export default mongoose.model('Conversation', conversationSchema);
