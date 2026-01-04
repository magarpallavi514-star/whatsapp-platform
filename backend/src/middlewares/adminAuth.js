/**
 * Admin Authentication Middleware
 * Validates admin API key for account management operations
 */

import crypto from 'crypto';

// Admin key stored securely in environment
const ADMIN_API_KEY_HASH = process.env.ADMIN_API_KEY_HASH;

/**
 * Hash a key using SHA-256
 */
function hashKey(key) {
  return crypto
    .createHash('sha256')
    .update(key)
    .digest('hex');
}

/**
 * Admin authentication middleware
 * Validates wpk_admin_ prefixed keys
 */
export const authenticateAdmin = (req, res, next) => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required. Provide: Authorization: Bearer wpk_admin_...'
      });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer "
    
    // Validate format
    if (!token.startsWith('wpk_admin_')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin API key format. Must start with: wpk_admin_'
      });
    }
    
    // Validate against hashed admin key
    if (!ADMIN_API_KEY_HASH) {
      console.error('❌ ADMIN_API_KEY_HASH not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'Admin authentication not configured'
      });
    }
    
    const providedHash = hashKey(token);
    
    if (providedHash !== ADMIN_API_KEY_HASH) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin API key'
      });
    }
    
    // Mark request as admin authenticated
    req.isAdmin = true;
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Generate admin API key (run once to create)
 * Usage: node -e "require('./src/middlewares/adminAuth.js').generateAdminKey()"
 */
export function generateAdminKey() {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const adminKey = `wpk_admin_${randomBytes}`;
  const adminKeyHash = hashKey(adminKey);
  
  console.log('\n🔑 ========== ADMIN API KEY ==========\n');
  console.log('⚠️  SAVE THESE VALUES SECURELY\n');
  console.log('1. Add to .env file:');
  console.log(`   ADMIN_API_KEY_HASH="${adminKeyHash}"\n`);
  console.log('2. Use this key for admin operations:');
  console.log(`   ${adminKey}\n`);
  console.log('⚠️  This key has FULL PLATFORM ACCESS');
  console.log('⚠️  Never commit to git');
  console.log('⚠️  Store in secure password manager\n');
  console.log('=====================================\n');
  
  return { adminKey, adminKeyHash };
}
