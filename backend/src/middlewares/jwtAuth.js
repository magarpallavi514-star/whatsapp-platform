import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'whatsapp-platform-jwt-secret-2026';

/**
 * JWT Authentication Middleware
 * For dashboard users - stateless auth with tokens
 */

export const requireJWT = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
        redirectTo: '/login'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
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
