import bcrypt from 'bcryptjs';

/**
 * Auth Controller
 * Handles login/logout for dashboard users
 * NO API KEYS - Uses sessions/cookies
 */

// Hardcoded admin for now (can move to database later)
const ADMIN_USER = {
  email: 'mpiyush2727@gmail.com',
  passwordHash: '$2a$10$1234567890123456789012eGKWxJ7RZGrxKzYN2Dp3B/lYt2.FYYmC', // Will be set on first run
  accountId: 'pixels_internal',
  name: 'Piyush Magar',
  role: 'superadmin' // Full platform access
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }
    
    // Check email
    if (email !== ADMIN_USER.email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Hash and verify password
    const passwordHash = await bcrypt.hash('Pm@22442232', 10);
    const isValid = await bcrypt.compare(password, passwordHash);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Create session
    req.session.user = {
      email: ADMIN_USER.email,
      accountId: ADMIN_USER.accountId,
      name: ADMIN_USER.name,
      role: ADMIN_USER.role
    };
    
    console.log('✅ User logged in:', email);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        email: ADMIN_USER.email,
        name: ADMIN_USER.name,
        accountId: ADMIN_USER.accountId,
        role: ADMIN_USER.role
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout and destroy session
 */
export const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Logout error:', err);
        return res.status(500).json({
          success: false,
          message: 'Logout failed'
        });
      }
      
      res.clearCookie('connect.sid');
      console.log('✅ User logged out');
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * GET /api/auth/me
 * Get current logged-in user
 */
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    res.json({
      success: true,
      user: req.session.user
    });
    
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

export default {
  login,
  logout,
  getCurrentUser
};
