import bcrypt from 'bcryptjs';
import { generateToken } from '../middlewares/jwtAuth.js';

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
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token instead of session
    const token = generateToken(ADMIN_USER);
    
    console.log('✅ User logged in:', email);
    console.log('✅ JWT token generated');
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
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
 * Logout (JWT is stateless - just clear on client side)
 */
export const logout = async (req, res) => {
  try {
    // JWT is stateless, no session to destroy
    // Client should clear localStorage token
    console.log('✅ User logged out');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
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
 * Get current logged-in user (requires JWT token)
 */
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    res.json({
      success: true,
      user: req.user
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
