import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'whatsapp-platform-jwt-secret-2026';

/**
 * JWT Authentication Middleware
 * For dashboard users - stateless auth with tokens
 */

export const requireJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('🔑 JWT Check:');
    console.log('  Auth Header:', !!authHeader ? '✅ Present' : '❌ Missing');
    console.log('  Token:', !!token ? '✅ Present' : '❌ Missing');
    
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
    
    next();
  } catch (error) {
    console.error('❌ JWT verification failed:', error.message);
    console.error('  JWT_SECRET env:', !!process.env.JWT_SECRET ? '✅ Set' : '❌ Using default');
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
