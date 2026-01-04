import Account from '../models/Account.js';

/**
 * API Key Authentication Middleware
 * Validates API key and injects accountId into request
 */

export const authenticate = async (req, res, next) => {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide API key in Authorization header.',
        hint: 'Authorization: Bearer wpk_live_...'
      });
    }
    
    // Check Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Authorization: Bearer <api_key>'
      });
    }
    
    // Extract API key
    const apiKey = authHeader.substring(7); // Remove "Bearer "
    
    if (!apiKey || apiKey.trim() === '') {
      return res.status(401).json({
        success: false,
        message: 'API key is empty'
      });
    }
    
    // Validate API key format (wpk_live_<64 hex chars>)
    if (!apiKey.startsWith('wpk_live_')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key format'
      });
    }
    
    // Find account by API key
    const account = await Account.findByApiKey(apiKey);
    
    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key or account inactive'
      });
    }
    
    // Update last used timestamp (async, don't wait)
    Account.updateOne(
      { _id: account._id },
      { apiKeyLastUsedAt: new Date() }
    ).catch(err => console.error('Error updating apiKeyLastUsedAt:', err));
    
    // Inject account info into request
    req.accountId = account.accountId;
    req.account = {
      id: account._id,
      accountId: account.accountId,
      name: account.name,
      email: account.email,
      type: account.type,
      plan: account.plan,
      status: account.status
    };
    
    // Continue to next middleware/route
    next();
    
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Optional Authentication Middleware
 * Allows requests without auth but injects account if provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth provided, continue without account
      return next();
    }
    
    const apiKey = authHeader.substring(7);
    const account = await Account.findByApiKey(apiKey);
    
    if (account) {
      req.accountId = account.accountId;
      req.account = {
        id: account._id,
        accountId: account.accountId,
        name: account.name,
        email: account.email,
        type: account.type,
        plan: account.plan,
        status: account.status
      };
    }
    
    next();
  } catch (error) {
    // If optional auth fails, just continue without account
    next();
  }
};

export default { authenticate, optionalAuth };
