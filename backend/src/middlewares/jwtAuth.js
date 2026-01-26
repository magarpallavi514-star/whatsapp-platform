import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import Account from '../models/Account.js';

/**
 * JWT Authentication Middleware
 * For dashboard users - stateless auth with tokens
 */

export const requireJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('🔑 JWT Check:');
    console.log('  Path:', req.path);
    console.log('  Method:', req.method);
    console.log('  Auth Header:', !!authHeader ? '✅ Present' : '❌ Missing');
    console.log('  Token:', !!token ? '✅ Present' : '❌ Missing');
    
    if (!!token) {
      console.log('  Token length:', token.length);
      console.log('  Token prefix:', token.substring(0, 20) + '...');
      console.log('  Token dots count:', (token.match(/\./g) || []).length, '(should be 2)');
      console.log('  Token sample:', token.substring(0, 50) + '...');
    }
    
    if (!token) {
      console.log('  → Rejecting: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
        redirectTo: '/login'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('  → ✅ Token verified for:', decoded.email);
    
    // Inject user info into request
    req.accountId = decoded.accountId;
    req.user = {
      email: decoded.email,
      name: decoded.name,
      accountId: decoded.accountId,
      role: decoded.role
    };

    // Look up account in database
    // Try findById first if accountId looks like ObjectId, otherwise use findOne
    let account;
    let accountIdToLookup = decoded.accountId;
    
    // ✅ FALLBACK: Handle old tokens with 'pixels_internal' -> map to 2600001
    if (accountIdToLookup === 'pixels_internal') {
      console.log('⚠️  Old token with accountId: pixels_internal - redirecting to 2600001');
      accountIdToLookup = '2600001';
    }
    
    // Check if accountId is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(accountIdToLookup);
    
    if (isValidObjectId) {
      // accountId is a valid ObjectId - use findById
      account = await Account.findById(accountIdToLookup);
    } else {
      // accountId is a custom string (like "2600001") - use findOne with accountId field
      account = await Account.findOne({ accountId: accountIdToLookup });
    }
    
    if (!account) {
      console.error('❌ Account not found for accountId:', decoded.accountId);
      return res.status(401).json({
        success: false,
        message: 'Account not found. Please login again.',
        redirectTo: '/login'
      });
    }

    // Inject full account object (like auth.js middleware does)
    req.account = {
      id: account._id,
      accountId: account.accountId,
      name: account.name,
      email: account.email,
      type: account.type,
      plan: account.plan,
      status: account.status,
      _id: account._id  // Include _id explicitly
    };
    
    next();
  } catch (error) {
    console.error('❌ JWT verification failed:', error.message);
    console.error('  JWT_SECRET env:', !!process.env.JWT_SECRET ? '✅ Set' : '❌ Using default');
    console.error('  Error type:', error.name);
    console.error('  Error details:', error.toString());
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
      redirectTo: '/login'
    });
  }
};

/**
 * Generate JWT Token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      accountId: user.accountId,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' } // Token valid for 24 hours
  );
};

export default {
  requireJWT,
  generateToken
};
