import PhoneNumber from '../models/PhoneNumber.js';
import Account from '../models/Account.js';
import ApiKey from '../models/ApiKey.js';
import crypto from 'crypto';

/**
 * Settings Controller
 * Manages WhatsApp configurations, profile, API keys, and security
 */

/**
 * GET /api/settings/phone-numbers - Get all phone numbers for account
 */
export const getPhoneNumbers = async (req, res) => {
  try {
    const accountId = req.accountId;
    
    console.log('📱 [GET PHONE NUMBERS]');
    console.log('  Account ID from middleware:', accountId);
    console.log('  User email:', req.user?.email);
    console.log('  User role:', req.user?.role);
    
    if (!accountId) {
      console.error('❌ NO ACCOUNT ID IN REQUEST!');
      console.log('  req.accountId:', req.accountId);
      console.log('  req.user:', req.user);
      console.log('  All req keys:', Object.keys(req).filter(k => !k.startsWith('_')).slice(0, 10));
      return res.status(401).json({
        success: false,
        message: 'Account ID not found in request. Authentication failed.'
      });
    }
    
    // Build query to find phone numbers by:
    // 1. String accountId (from JWT token)
    // 2. MongoDB ObjectId (if account has both accountId and _id)
    let mongoAccountId = null;
    
    // Try to find the account's MongoDB _id if we only have the accountId string
    try {
      const account = await Account.findOne({ accountId }).select('_id');
      if (account) {
        mongoAccountId = account._id;
        console.log('  Found MongoDB ID:', mongoAccountId);
      }
    } catch (e) {
      console.log('  Note: Could not lookup account._id:', e.message);
    }
    
    // Query using both possible IDs
    const query = mongoAccountId 
      ? { $or: [{ accountId }, { accountId: mongoAccountId }] }
      : { accountId };
    
    const phoneNumbers = await PhoneNumber.find(query)
      .select('-accessToken') // Don't expose token
      .sort({ isActive: -1, createdAt: -1 })
      .lean();
    
    console.log('  Found phones:', phoneNumbers.length);
    
    res.json({
      success: true,
      phoneNumbers
    });
    
  } catch (error) {
    console.error('❌ Get phone numbers error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/settings/phone-numbers - Add new phone number
 */
export const addPhoneNumber = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { phoneNumberId, wabaId, accessToken, displayName, displayPhone } = req.body;
    
    if (!phoneNumberId || !wabaId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: phoneNumberId, wabaId, accessToken'
      });
    }
    
    // Get the account's MongoDB _id
    const account = await Account.findOne({ accountId }).select('_id');
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    const mongoAccountId = account._id;
    
    // Check if phone number already exists FOR THIS ACCOUNT (check both IDs)
    const existing = await PhoneNumber.findOne({ 
      $or: [
        { accountId: mongoAccountId, phoneNumberId },
        { accountId, phoneNumberId }
      ]
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already connected to your account'
      });
    }
    
    // Check if this is the first phone number for this account
    const count = await PhoneNumber.countDocuments({ 
      $or: [
        { accountId: mongoAccountId },
        { accountId }
      ]
    });
    const isFirst = count === 0;
    
    const phoneNumber = await PhoneNumber.create({
      accountId: mongoAccountId,  // Store MongoDB ObjectId, NOT string
      phoneNumberId,
      wabaId,
      accessToken,
      displayName: displayName || 'WhatsApp Business',
      displayPhone: displayPhone || phoneNumberId,
      isActive: isFirst, // First phone number is active by default
      verifiedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Phone number added successfully',
      phoneNumber: {
        _id: phoneNumber._id,
        phoneNumberId: phoneNumber.phoneNumberId,
        wabaId: phoneNumber.wabaId,
        displayName: phoneNumber.displayName,
        displayPhone: phoneNumber.displayPhone,
        isActive: phoneNumber.isActive
      }
    });
    
  } catch (error) {
    console.error('❌ Add phone number error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/settings/phone-numbers/:id - Update phone number
 */
export const updatePhoneNumber = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id } = req.params;
    const { displayName, displayPhone, accessToken, isActive } = req.body;
    
    const phoneNumber = await PhoneNumber.findOne({ _id: id, accountId });
    
    if (!phoneNumber) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found'
      });
    }
    
    // Update fields
    if (displayName !== undefined) phoneNumber.displayName = displayName;
    if (displayPhone !== undefined) phoneNumber.displayPhone = displayPhone;
    if (accessToken !== undefined) {
      phoneNumber.accessToken = accessToken;
      phoneNumber.tokenUpdatedAt = new Date();
    }
    
    // Handle isActive toggle
    if (isActive !== undefined && isActive === true) {
      // Deactivate all other phone numbers
      await PhoneNumber.updateMany(
        { accountId, _id: { $ne: id } },
        { isActive: false }
      );
      phoneNumber.isActive = true;
    } else if (isActive !== undefined) {
      phoneNumber.isActive = false;
    }
    
    await phoneNumber.save();
    
    res.json({
      success: true,
      message: 'Phone number updated successfully',
      phoneNumber: {
        _id: phoneNumber._id,
        phoneNumberId: phoneNumber.phoneNumberId,
        wabaId: phoneNumber.wabaId,
        displayName: phoneNumber.displayName,
        displayPhone: phoneNumber.displayPhone,
        isActive: phoneNumber.isActive
      }
    });
    
  } catch (error) {
    console.error('❌ Update phone number error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * DELETE /api/settings/phone-numbers/:id - Delete phone number
 */
export const deletePhoneNumber = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id } = req.params;
    
    const phoneNumber = await PhoneNumber.findOne({ _id: id, accountId });
    
    if (!phoneNumber) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found'
      });
    }
    
    // Don't allow deleting the active phone number if it's the only one
    if (phoneNumber.isActive) {
      const count = await PhoneNumber.countDocuments({ accountId });
      if (count === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the only active phone number. Add another one first.'
        });
      }
    }
    
    await phoneNumber.deleteOne();
    
    res.json({
      success: true,
      message: 'Phone number deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete phone number error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/settings/phone-numbers/:id/test - Test phone number connection
 */
export const testPhoneNumber = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id } = req.params;
    
    const phoneNumber = await PhoneNumber.findOne({ _id: id, accountId }).select('+accessToken');
    
    if (!phoneNumber) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found'
      });
    }
    
    // Test connection to WhatsApp API
    const axios = (await import('axios')).default;
    const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
    
    const response = await axios.get(
      `${GRAPH_API_URL}/${phoneNumber.phoneNumberId}`,
      {
        headers: { 'Authorization': `Bearer ${phoneNumber.accessToken}` }
      }
    );
    
    phoneNumber.lastTestedAt = new Date();
    await phoneNumber.save();
    
    res.json({
      success: true,
      message: 'Connection test successful',
      details: {
        phoneNumber: response.data.display_phone_number,
        verifiedName: response.data.verified_name,
        qualityRating: response.data.quality_rating
      }
    });
    
  } catch (error) {
    console.error('❌ Test phone number error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * GET /api/settings/profile - Get user profile
 */
export const getProfile = async (req, res) => {
  try {
    const accountId = req.accountId;
    
    const account = await Account.findOne({ accountId })
      .select('name email company phone timezone')
      .lean();
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    res.json({
      success: true,
      profile: account
    });
    
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/settings/profile - Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { name, email, company, phone, timezone } = req.body;
    
    const account = await Account.findOne({ accountId });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // Update fields
    if (name) account.name = name;
    if (email) account.email = email;
    if (company !== undefined) account.company = company;
    if (phone !== undefined) account.phone = phone;
    if (timezone) account.timezone = timezone;
    
    await account.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        name: account.name,
        email: account.email,
        company: account.company,
        phone: account.phone,
        timezone: account.timezone
      }
    });
    
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/settings/api-keys - Get all API keys
 */
export const getApiKeys = async (req, res) => {
  try {
    const accountId = req.accountId;
    
    const apiKeys = await ApiKey.find({ accountId })
      .select('name keyPrefix lastUsedAt createdAt expiresAt')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      apiKeys
    });
    
  } catch (error) {
    console.error('❌ Get API keys error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/settings/api-keys - Generate new API key
 */
export const generateApiKey = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'API key name is required'
      });
    }
    
    // Generate API key
    const { apiKey, keyHash, keyPrefix } = ApiKey.generateApiKey();
    
    // Save to database
    const newApiKey = await ApiKey.create({
      accountId,
      name: name.trim(),
      keyHash,
      keyPrefix
    });
    
    res.json({
      success: true,
      message: 'API key generated successfully',
      apiKey, // Return plaintext key (ONLY TIME IT'S VISIBLE)
      keyData: {
        _id: newApiKey._id,
        name: newApiKey.name,
        keyPrefix: newApiKey.keyPrefix,
        createdAt: newApiKey.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Generate API key error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * DELETE /api/settings/api-keys/:id - Delete API key
 */
export const deleteApiKey = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { id } = req.params;
    
    const apiKey = await ApiKey.findOne({ _id: id, accountId });
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }
    
    await apiKey.deleteOne();
    
    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete API key error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/settings/change-password - Change password
 */
export const changePassword = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }
    
    const account = await Account.findOne({ accountId }).select('+password');
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // Verify current password
    if (account.password) {
      const bcrypt = (await import('bcrypt')).default;
      const isMatch = await bcrypt.compare(currentPassword, account.password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }
    
    // Hash and save new password
    const bcrypt = (await import('bcrypt')).default;
    account.password = await bcrypt.hash(newPassword, 10);
    await account.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getPhoneNumbers,
  addPhoneNumber,
  updatePhoneNumber,
  deletePhoneNumber,
  testPhoneNumber,
  getProfile,
  updateProfile,
  getApiKeys,
  generateApiKey,
  deleteApiKey,
  changePassword
};
