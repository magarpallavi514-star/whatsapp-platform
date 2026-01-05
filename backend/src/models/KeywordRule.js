import mongoose from 'mongoose';

/**
 * KeywordRule - Simple auto-reply engine (MVP scope)
 * Perfect for Phase-1, extendable to workflows later
 * This alone is VERY sellable to SMBs
 */
const keywordRuleSchema = new mongoose.Schema({
  // Multi-tenant isolation
  accountId: {
    type: String,
    required: true,
    index: true
  },
  
  // Phone number this rule applies to (optional - null = all numbers)
  phoneNumberId: {
    type: String,
    index: true,
    default: null
  },
  
  // Rule info
  name: {
    type: String,
    required: true
  },
  description: String,
  
  // Trigger keywords
  keywords: {
    type: [String], // ['hi', 'hello', 'hey']
    required: true
  },
  matchType: {
    type: String,
    enum: ['exact', 'contains', 'starts_with'],
    default: 'contains'
  },
  
  // Action/Reply
  replyType: {
    type: String,
    enum: ['text', 'template', 'workflow'],
    default: 'text'
  },
  replyContent: {
    text: String,
    templateName: String,
    templateParams: [String],
    // Workflow support - array of response steps
    workflow: [{
      id: String,
      type: {
        type: String,
        enum: ['text', 'buttons', 'list']
      },
      text: String,
      buttons: [{
        id: String,
        title: String
      }],
      listItems: [{
        id: String,
        title: String,
        description: String
      }],
      delay: Number // seconds
    }]
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Stats (monetizable - show ROI to clients)
  triggerCount: {
    type: Number,
    default: 0
  },
  lastTriggeredAt: Date
}, {
  timestamps: true
});

// Indexes
keywordRuleSchema.index({ accountId: 1, isActive: 1 });
keywordRuleSchema.index({ accountId: 1, phoneNumberId: 1, isActive: 1 });

// Helper method to check if message matches rule
keywordRuleSchema.methods.matches = function(messageText) {
  const text = messageText.toLowerCase().trim();
  
  return this.keywords.some(keyword => {
    const kw = keyword.toLowerCase().trim();
    
    switch (this.matchType) {
      case 'exact':
        return text === kw;
      case 'starts_with':
        return text.startsWith(kw);
      case 'contains':
      default:
        return text.includes(kw);
    }
  });
};

export default mongoose.model('KeywordRule', keywordRuleSchema);
