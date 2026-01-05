import PhoneNumber from '../models/PhoneNumber.js';

/**
 * Phone Number Settings Controller
 * Manages WhatsApp Business Account configurations
 */

/**
 * GET /api/settings/phone-numbers - Get all phone numbers for account
 */
export const getPhoneNumbers = async (req, res) => {
  try {
    const accountId = req.accountId;
    
    const phoneNumbers = await PhoneNumber.find({ accountId })
      .select('-accessToken') // Don't expose token
      .sort({ isActive: -1, createdAt: -1 })
      .lean();
    
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
    
    // Check if phone number already exists
    const existing = await PhoneNumber.findOne({ phoneNumberId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered'
      });
    }
    
    // Check if this is the first phone number for this account
    const count = await PhoneNumber.countDocuments({ accountId });
    const isFirst = count === 0;
    
    const phoneNumber = await PhoneNumber.create({
      accountId,
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

export default {
  getPhoneNumbers,
  addPhoneNumber,
  updatePhoneNumber,
  deletePhoneNumber,
  testPhoneNumber
};
