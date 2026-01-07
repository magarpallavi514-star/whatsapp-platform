/**
 * Integration Token Authentication Middleware
 * Validates integration tokens from external apps (Enromatics, etc.)
 */

import Account from '../models/Account.js';

/**
 * Integration Token Authentication Middleware
 * Validates wpi_int_ prefixed tokens
 */
export const authenticateIntegration = async (req, res, next) => {
  try {
    // Extract API key from Authorization header or x-integration-token header
    const authHeader = req.headers.authorization || req.headers['x-integration-token'];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Integration token required. Provide: Authorization: Bearer wpi_int_... or X-Integration-Token: wpi_int_...'
      });
    }
    
    // Extract token (handle both Bearer and direct token)
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove "Bearer "
    }
    
    if (!token || token.trim() === '') {
      return res.status(401).json({
        success: false,
        message: 'Integration token is empty'
      });
    }
    
    // Validate token format (wpi_int_<64 hex chars>)
    if (!token.startsWith('wpi_int_')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid integration token format. Must start with: wpi_int_'
      });
    }
    
    // Find account by integration token
    const account = await Account.findByIntegrationToken(token);
    
    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Invalid integration token or account inactive'
      });
    }
    
    // Update last used timestamp (async, don't wait)
    Account.updateOne(
      { _id: account._id },
      { integrationTokenLastUsedAt: new Date() }
    ).catch(err => console.error('Error updating integrationTokenLastUsedAt:', err));
    
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
    req.authType = 'integration'; // Mark as integration auth
    
    // Continue to next middleware/route
    next();
    
  } catch (error) {
    console.error('❌ Integration token authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Dual Authentication Middleware
 * Accepts both API key and integration token
 */
export const authenticateDual = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const integrationHeader = req.headers['x-integration-token'];
    
    // Try integration token first
    if (integrationHeader || (authHeader && authHeader.includes('wpi_int_'))) {
      return authenticateIntegration(req, res, next);
    }
    
    // Fall back to regular API key auth
    const { authenticate } = await import('./auth.js');
    return authenticate(req, res, next);
    
  } catch (error) {
    console.error('❌ Dual authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};
