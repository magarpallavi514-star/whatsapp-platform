import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  // Multi-tenant isolation
  accountId: {
    type: String,
    required: true,
    index: true
  },
  
  // Template identity
  name: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  
  // Meta template data
  category: {
    type: String,
    enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'],
    default: 'UTILITY'
  },
  content: {
    type: String,
    required: true
  },
  variables: {
    type: [String], // ["1", "2"]
    default: []
  },
  components: {
    type: Array, // Full Meta components
    default: []
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  metaTemplateId: String,
  
  // Usage tracking (monetizable)
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: Date,
  lastSyncedAt: Date,
  
  // Approval info
  approvedAt: Date,
  rejectedAt: Date,
  rejectedReason: String,
  
  // Soft delete
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
templateSchema.index({ accountId: 1, name: 1 });
templateSchema.index({ accountId: 1, status: 1 });
templateSchema.index({ accountId: 1, deleted: 1 });

export default mongoose.model('Template', templateSchema);
