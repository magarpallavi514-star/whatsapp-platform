import PhoneNumber from '../models/PhoneNumber.js';

/**
 * Phone Number Helper Middleware
 * Auto-detects phone number if not provided (simple mode)
 * Or validates provided phoneNumberId (advanced mode for multi-phone accounts)
 * 
 * Supports both:
 * 1. Simple: Just API key → auto-detects default phone
 * 2. Advanced: API key + phoneNumberId → uses specific phone (for Shopify, etc.)
 */

export const resolvePhoneNumber = async (req, res, next) => {
  try {
    // Get STRING accountId from JWT (matches PhoneNumber.accountId field type)
    const accountId = req.account.accountId || req.accountId;
    let phoneNumberId = req.body.phoneNumberId || req.query.phoneNumberId;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Account not found.',
        hint: 'Make sure you are logged in'
      });
    }
    
    // SIMPLE MODE: Auto-detect if phoneNumberId not provided
    if (!phoneNumberId) {
      const phoneNumber = await PhoneNumber.findOne({
        accountId,
        isActive: true
      }).sort({ createdAt: -1 }); // Get the most recently added active number
      
      if (!phoneNumber) {
        return res.status(404).json({
          success: false,
          message: 'No active WhatsApp phone number found for this account. Please configure a phone number first.',
          hint: 'Add a phone number via POST /api/settings/phone-numbers'
        });
      }
      
      // Inject the phone number details into request
      req.phoneNumberId = phoneNumber.phoneNumberId;
      req.wabaId = phoneNumber.wabaId;
      req.phoneNumber = phoneNumber;
      req.phoneNumberMode = 'auto'; // Track which mode was used
      
      console.log(`📞 [AUTO] Detected phone: ${phoneNumber.displayPhone} (${phoneNumber.phoneNumberId})`);
    } 
    // ADVANCED MODE: Validate provided phoneNumberId
    else {
      const phoneNumber = await PhoneNumber.findOne({
        accountId,
        phoneNumberId,
        isActive: true
      });
      
      if (!phoneNumber) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or inactive phone number for this account',
          providedPhoneNumberId: phoneNumberId,
          hint: 'Use GET /api/settings/phone-numbers to see available phone numbers'
        });
      }
      
      // Inject the phone number details into request
      req.phoneNumberId = phoneNumber.phoneNumberId;
      req.wabaId = phoneNumber.wabaId;
      req.phoneNumber = phoneNumber;
      req.phoneNumberMode = 'explicit'; // Track which mode was used
      
      console.log(`📞 [EXPLICIT] Using phone: ${phoneNumber.displayPhone} (${phoneNumber.phoneNumberId})`);
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Phone number resolution error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: 'Failed to resolve phone number',
      error: error.message,
      details: error.stack
    });
  }
};

/**
 * Optional Phone Number Helper (for endpoints that don't require phone)
 * Used for GET endpoints like /api/conversations, /api/messages
 */
export const optionalPhoneNumber = async (req, res, next) => {
  try {
    // Get accountId as ObjectId (req.account._id) not STRING (req.accountId)
    const accountId = req.account?._id || req.accountId;
    const phoneNumberId = req.query.phoneNumberId;
    
    // If phoneNumberId provided, validate it
    if (phoneNumberId) {
      const phoneNumber = await PhoneNumber.findOne({
        accountId,
        phoneNumberId,
        isActive: true
      });
      
      if (!phoneNumber) {
        return res.status(403).json({
          success: false,
          message: 'Invalid phone number for this account'
        });
      }
      
      req.phoneNumberId = phoneNumber.phoneNumberId;
      req.wabaId = phoneNumber.wabaId;
      req.phoneNumber = phoneNumber;
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Optional phone number error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve phone number',
      error: error.message
    });
  }
};
