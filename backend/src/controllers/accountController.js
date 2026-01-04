/**
 * Account Controller
 * Handles account CRUD and API key management
 */

import Account from '../models/Account.js';
import PhoneNumber from '../models/PhoneNumber.js';

/**
 * POST /api/admin/accounts - Create new account
 */
export const createAccount = async (req, res) => {
  try {
    const {
      accountId,
      name,
      email,
      type = 'client',
      plan = 'free',
      limits,
      wabaId,
      phoneNumberId,
      accessToken
    } = req.body;
    
    // Validate required fields
    if (!accountId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: accountId, name, email'
      });
    }
    
    // Check if account already exists
    const existing = await Account.findOne({ accountId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Account with ID '${accountId}' already exists`
      });
    }
    
    // Create account
    const account = new Account({
      accountId,
      name,
      email,
      type,
      plan,
      status: 'active',
      limits: limits || undefined, // Use defaults if not provided
      lastActiveAt: new Date()
    });
    
    // Generate API key
    const apiKey = account.generateApiKey();
    
    // Save account
    await account.save();
    
    // If WABA credentials provided, create phone number entry
    if (wabaId && phoneNumberId && accessToken) {
      const phoneNumber = new PhoneNumber({
        accountId,
        wabaId,
        phoneNumberId,
        accessToken,
        status: 'active'
      });
      await phoneNumber.save();
    }
    
    // Return account details + API key (ONLY TIME IT'S SHOWN)
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      account: {
        accountId: account.accountId,
        name: account.name,
        email: account.email,
        type: account.type,
        plan: account.plan,
        status: account.status,
        apiKeyPrefix: account.apiKeyPrefix,
        createdAt: account.createdAt
      },
      apiKey, // ⚠️ ONLY SHOWN ONCE
      warning: '⚠️ Store this API key securely. It will not be shown again.'
    });
    
  } catch (error) {
    console.error('Create account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create account',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/accounts - List all accounts
 */
export const listAccounts = async (req, res) => {
  try {
    const { type, status, limit = 50, skip = 0 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    
    const accounts = await Account.find(query)
      .select('-apiKeyHash') // Don't expose hash
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });
    
    const total = await Account.countDocuments(query);
    
    return res.json({
      success: true,
      accounts,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: skip + accounts.length < total
      }
    });
    
  } catch (error) {
    console.error('List accounts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list accounts',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/accounts/:accountId - Get account details
 */
export const getAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const account = await Account.findOne({ accountId })
      .select('-apiKeyHash');
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // Get associated phone numbers
    const phoneNumbers = await PhoneNumber.find({ accountId });
    
    return res.json({
      success: true,
      account,
      phoneNumbers
    });
    
  } catch (error) {
    console.error('Get account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get account',
      error: error.message
    });
  }
};

/**
 * PATCH /api/admin/accounts/:accountId - Update account
 */
export const updateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const updates = req.body;
    
    // Don't allow updating sensitive fields
    delete updates.accountId;
    delete updates.apiKeyHash;
    delete updates.apiKeyPrefix;
    delete updates.createdAt;
    
    const account = await Account.findOneAndUpdate(
      { accountId },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-apiKeyHash');
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Account updated successfully',
      account
    });
    
  } catch (error) {
    console.error('Update account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update account',
      error: error.message
    });
  }
};

/**
 * DELETE /api/admin/accounts/:accountId - Delete account
 */
export const deleteAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const account = await Account.findOneAndDelete({ accountId });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // Also delete associated phone numbers
    await PhoneNumber.deleteMany({ accountId });
    
    return res.json({
      success: true,
      message: 'Account deleted successfully',
      accountId
    });
    
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/accounts/:accountId/api-key/regenerate - Regenerate API key
 */
export const regenerateApiKey = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const account = await Account.findOne({ accountId });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // Generate new API key
    const newApiKey = account.generateApiKey();
    
    await account.save();
    
    return res.json({
      success: true,
      message: 'API key regenerated successfully',
      account: {
        accountId: account.accountId,
        name: account.name,
        apiKeyPrefix: account.apiKeyPrefix
      },
      apiKey: newApiKey, // ⚠️ ONLY SHOWN ONCE
      warning: '⚠️ Old API key is now invalid. Store this new key securely.'
    });
    
  } catch (error) {
    console.error('Regenerate API key error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to regenerate API key',
      error: error.message
    });
  }
};

/**
 * DELETE /api/admin/accounts/:accountId/api-key - Revoke API key
 */
export const revokeApiKey = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const account = await Account.findOneAndUpdate(
      { accountId },
      {
        $unset: { apiKeyHash: '', apiKeyPrefix: '' },
        $set: { apiKeyCreatedAt: null, apiKeyLastUsedAt: null }
      },
      { new: true }
    ).select('-apiKeyHash');
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'API key revoked successfully',
      account: {
        accountId: account.accountId,
        name: account.name,
        status: account.status
      }
    });
    
  } catch (error) {
    console.error('Revoke API key error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke API key',
      error: error.message
    });
  }
};

/**
 * GET /api/account/me - Get own account details (self-service)
 */
export const getMyAccount = async (req, res) => {
  try {
    const accountId = req.accountId; // From auth middleware
    
    const account = await Account.findOne({ accountId })
      .select('-apiKeyHash');
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // Get associated phone numbers
    const phoneNumbers = await PhoneNumber.find({ accountId });
    
    return res.json({
      success: true,
      account,
      phoneNumbers
    });
    
  } catch (error) {
    console.error('Get my account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get account details',
      error: error.message
    });
  }
};

/**
 * POST /api/account/api-key/regenerate - Regenerate own API key (self-service)
 */
export const regenerateMyApiKey = async (req, res) => {
  try {
    const accountId = req.accountId; // From auth middleware
    
    const account = await Account.findOne({ accountId });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // Generate new API key
    const newApiKey = account.generateApiKey();
    
    await account.save();
    
    return res.json({
      success: true,
      message: 'API key regenerated successfully',
      apiKey: newApiKey, // ⚠️ ONLY SHOWN ONCE
      warning: '⚠️ Your old API key is now invalid. Update your application with this new key immediately.'
    });
    
  } catch (error) {
    console.error('Regenerate my API key error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to regenerate API key',
      error: error.message
    });
  }
};
