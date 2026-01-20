import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Basic info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  picture: String,
  phone: String,

  // Authentication
  password: String, // Optional - for email/password auth
  googleId: String, // For Google OAuth
  emailVerified: {
    type: Boolean,
    default: false
  },

  // Account & Role
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'manager', 'agent', 'user'],
    default: 'user'
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },

  // Plan
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro', 'enterprise'],
    default: 'free'
  },

  // Metadata
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ accountId: 1 });
userSchema.index({ googleId: 1 });

const User = mongoose.model('User', userSchema);

export default User;
