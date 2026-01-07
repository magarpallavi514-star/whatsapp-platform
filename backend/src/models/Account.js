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
  
  // Integration Token (for external apps like Enromatics)
  integrationTokenHash: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    select: false // Don't return in queries by default (security)
  },
  integrationTokenPrefix: {
    type: String, // Store first 12 chars for identification (e.g., "wpi_int_abc")
    select: true
  },
  integrationTokenCreatedAt: Date,
  integrationTokenLastUsedAt: Date,
  
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

// Integration Token Methods (for external app integrations like Enromatics)
accountSchema.methods.generateIntegrationToken = function() {
  // Generate cryptographically secure random integration token
  // Format: wpi_int_<64_random_hex_chars> (whatsapp-platform-integration)
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const integrationToken = `wpi_int_${randomBytes}`;
  
  // Store hash (for validation) and prefix (for display)
  this.integrationTokenHash = this.constructor.hashApiKey(integrationToken);
  this.integrationTokenPrefix = integrationToken.substring(0, 12); // "wpi_int_abc"
  this.integrationTokenCreatedAt = new Date();
  
  // Return plaintext token (ONLY TIME IT'S VISIBLE)
  return integrationToken;
};

// Static method to find account by integration token
accountSchema.statics.findByIntegrationToken = async function(integrationToken) {
  const hash = this.hashApiKey(integrationToken);
  return this.findOne({ integrationTokenHash: hash, status: 'active' }).select('+integrationTokenHash');
};

// Method to validate integration token
accountSchema.methods.validateIntegrationToken = function(integrationToken) {
  const hash = this.constructor.hashApiKey(integrationToken);
  return this.integrationTokenHash === hash;
};

export default mongoose.model('Account', accountSchema);
