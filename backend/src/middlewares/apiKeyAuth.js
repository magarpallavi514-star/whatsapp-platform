/**
 * API Key Authentication Middleware (External Integrations)
 * ✅ AUTH TYPE: API Key (wpk_live_ prefix)
 * ❌ NOT for: JWT, webhooks, dashboard
 * 
 * Used by: /api/external/* routes for third-party integrations
 * Verifies API key and looks up account from API key
 */

import Account from '../models/Account.js';
import ApiKey from '../models/ApiKey.js';

export const requireApiKey = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let apiKey = null;

    // Extract API key from Authorization header
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.substring(7); // Remove "Bearer "
      } else {
        apiKey = authHeader; // Direct token
      }
    }

    // Also check x-api-key header
    if (!apiKey && req.headers['x-api-key']) {
      apiKey = req.headers['x-api-key'];
    }

    console.log('🔑 API Key Check:');
    console.log('  Path:', req.path);
    console.log('  Method:', req.method);
    console.log('  Auth Header:', !!authHeader ? '✅ Present' : '❌ Missing');
    console.log('  API Key:', !!apiKey ? '✅ Present' : '❌ Missing');

    if (!apiKey) {
      console.log('  → Rejecting: No API key provided');
      return res.status(401).json({
        success: false,
        code: 'NO_API_KEY',
        message: 'API key required. Provide: Authorization: Bearer wpk_live_... or X-API-Key: wpk_live_...'
      });
    }

    // Validate API key format (wpk_live_<key>)
    if (!apiKey.startsWith('wpk_live_')) {
      console.log('  → Rejecting: Invalid API key format');
      return res.status(401).json({
        success: false,
        code: 'INVALID_API_KEY_FORMAT',
        message: 'Invalid API key format. Must start with: wpk_live_'
      });
    }

    // Find API key record and associated account
    const apiKeyRecord = await ApiKey.findByApiKey(apiKey);

    if (!apiKeyRecord) {
      console.log('  → Rejecting: API key not found or inactive');
      return res.status(401).json({
        success: false,
        code: 'INVALID_API_KEY',
        message: 'Invalid or inactive API key'
      });
    }

    // Find account by accountId from API key record
    const account = await Account.findById(apiKeyRecord.accountId);

    if (!account || account.status !== 'active') {
      console.log('  → Rejecting: Account not found or inactive');
      return res.status(401).json({
        success: false,
        code: 'ACCOUNT_INACTIVE',
        message: 'Associated account is inactive'
      });
    }

    console.log('  → ✅ API key verified for account:', account.accountId);

    // Update last used timestamp (async, don't wait)
    ApiKey.updateOne(
      { _id: apiKeyRecord._id },
      { lastUsedAt: new Date() }
    ).catch(err => console.error('Error updating API key lastUsedAt:', err));

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
    req.authType = 'apiKey'; // Mark as API key auth
    req.apiKeyId = apiKeyRecord._id; // Track which API key was used

    next();
  } catch (error) {
    console.error('❌ API key authentication error:', error);
    res.status(500).json({
      success: false,
      code: 'API_KEY_AUTH_ERROR',
      message: 'API key authentication failed'
    });
  }
};

export default requireApiKey;
