import mongoose from 'mongoose';

/**
 * WorkflowSession Schema
 * Tracks active conversational workflows with users
 */
const workflowSessionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true
  },
  phoneNumberId: {
    type: String,
    required: true,
    index: true
  },
  contactPhone: {
    type: String,
    required: true,
    index: true
  },
  ruleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KeywordRule',
    required: true
  },
  workflowSteps: [{
    id: String,
    type: { type: String, enum: ['text', 'buttons', 'list', 'question'] },
    text: String,
    buttons: [{
      id: String,
      title: String,
      url: String
    }],
    listItems: [{
      id: String,
      title: String,
      description: String
    }],
    delay: { type: Number, default: 0 },
    saveAs: String, // Variable name to save response as
    waitForResponse: { type: Boolean, default: false }
  }],
  currentStepIndex: {
    type: Number,
    default: 0
  },
  responses: {
    type: Map,
    of: String,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'cancelled'],
    default: 'active',
    index: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  awaitingResponseSince: {
    type: Date
  },
  timeoutMinutes: {
    type: Number,
    default: 1 // 1 minute timeout for user response
  },
  hasTimedOut: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for finding active sessions
workflowSessionSchema.index({ 
  contactPhone: 1, 
  status: 1, 
  accountId: 1 
});

// Index for cleanup of expired sessions
workflowSessionSchema.index({ expiresAt: 1 });

// Method to get current step
workflowSessionSchema.methods.getCurrentStep = function() {
  return this.workflowSteps[this.currentStepIndex];
};

// Method to advance to next step
workflowSessionSchema.methods.advanceStep = function() {
  this.currentStepIndex++;
  this.lastActivityAt = new Date();
  return this.currentStepIndex < this.workflowSteps.length;
};

// Method to save response
workflowSessionSchema.methods.saveResponse = function(variableName, value) {
  this.responses.set(variableName, value);
  this.lastActivityAt = new Date();
};

// Method to check if workflow is complete
workflowSessionSchema.methods.isComplete = function() {
  return this.currentStepIndex >= this.workflowSteps.length;
};

// Method to check if session has timed out (user not responding)
workflowSessionSchema.methods.checkTimeout = function() {
  if (!this.awaitingResponseSince) return false;
  
  const timeoutMs = this.timeoutMinutes * 60 * 1000;
  const elapsedMs = Date.now() - this.awaitingResponseSince.getTime();
  
  return elapsedMs >= timeoutMs;
};

const WorkflowSession = mongoose.model('WorkflowSession', workflowSessionSchema);

export default WorkflowSession;
