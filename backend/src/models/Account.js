import mongoose from 'mongoose';
import crypto from 'crypto';

const accountSchema = new mongoose.Schema({
  // Account Identity
  accountId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Account Type (CRITICAL for multi-use case)
  type: {
    type: String,
    enum: ['internal', 'client', 'agency'],
    default: 'client'
  },
  
  // Account Info
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
    // NOT unique - agencies may have multiple accounts
    // Uniqueness enforced at auth layer later
  },
  company: {
    type: String
  },
  phone: {
    type: String
  },
  timezone: {
    type: String,
    default: 'America/New_York'
  },
  
  // Password (hashed with bcrypt)
  password: {
    type: String,
    select: false // Don't return in queries by default (security)
  },
  
  // API Authentication (Phase 2B - Hashed)
  apiKeyHash: {
    type: String,
    unique: true,
    sparse: true, // Allow null values, but enforce uniqueness when present
    index: true,
    select: false // Don't return in queries by default (security)
  },
  apiKeyPrefix: {
    type: String, // Store first 12 chars for identification (e.g., "wpk_live_abc")
    select: true
  },
  apiKeyCreatedAt: Date,
  apiKeyLastUsedAt: Date,
  
  // Subscription (Phase 2)
  plan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active'
  },
  
  // Limits (based on plan)
  limits: {
    phoneNumbers: { type: Number, default: 1 },
    messagesPerDay: { type: Number, default: 1000 },
    templates: { type: Number, default: 10 },
    contacts: { type: Number, default: 500 }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: Date
}, { 
  timestamps: true 
});

// Index for lookups
accountSchema.index({ accountId: 1 });
accountSchema.index({ type: 1, status: 1 });
accountSchema.index({ apiKeyHash: 1 });

// Hash function for API keys
accountSchema.statics.hashApiKey = function(apiKey) {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
};

// Method to generate and hash API key
accountSchema.methods.generateApiKey = function() {
  // Generate cryptographically secure random API key
  // Format: wpk_live_<64_random_hex_chars> (whatsapp-platform-key)
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const apiKey = `wpk_live_${randomBytes}`;
  
  // Store hash (for validation) and prefix (for display)
  this.apiKeyHash = this.constructor.hashApiKey(apiKey);
  this.apiKeyPrefix = apiKey.substring(0, 12); // "wpk_live_abc"
  this.apiKeyCreatedAt = new Date();
  
  // Return plaintext key (ONLY TIME IT'S VISIBLE)
  return apiKey;
};

// Static method to find account by API key
accountSchema.statics.findByApiKey = async function(apiKey) {
  const hash = this.hashApiKey(apiKey);
  return this.findOne({ apiKeyHash: hash, status: 'active' }).select('+apiKeyHash');
};

// Method to validate API key
accountSchema.methods.validateApiKey = function(apiKey) {
  const hash = this.constructor.hashApiKey(apiKey);
  return this.apiKeyHash === hash;
};

export default mongoose.model('Account', accountSchema);
