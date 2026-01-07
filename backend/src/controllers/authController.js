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
 * Demo mode: superadmin@test.com accepts any password
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
    
    // Demo superadmin account - password: 22442232
    if (email === 'superadmin@test.com') {
      if (password !== '22442232') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      const user = {
        email: 'superadmin@test.com',
        accountId: 'pixels_internal',
        name: 'SuperAdmin (Demo)',
        role: 'superadmin'
      };
      
      const token = generateToken(user);
      console.log('🔐 SuperAdmin login:');
      console.log('  Email:', email);
      console.log('  AccountId:', user.accountId);
      console.log('  Token length:', token.length);
      console.log('  Token starts with:', token.substring(0, 20) + '...');
      
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user
      });
    }
    
    // Demo admin account - accepts any password
    if (email === 'admin@test.com') {
      const user = {
        email: 'admin@test.com',
        accountId: 'demo_admin_001',
        name: 'Admin (Demo)',
        role: 'admin'
      };
      
      const token = generateToken(user);
      console.log('✅ Admin demo user logged in');
      
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user
      });
    }
    
    // Demo manager account - accepts any password
    if (email === 'manager@test.com') {
      const user = {
        email: 'manager@test.com',
        accountId: 'demo_manager_001',
        name: 'Manager (Demo)',
        role: 'manager'
      };
      
      const token = generateToken(user);
      console.log('✅ Manager demo user logged in');
      
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user
      });
    }
    
    // Demo agent account - accepts any password
    if (email === 'agent@test.com') {
      const user = {
        email: 'agent@test.com',
        accountId: 'demo_agent_001',
        name: 'Agent (Demo)',
        role: 'agent'
      };
      
      const token = generateToken(user);
      console.log('✅ Agent demo user logged in');
      
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user
      });
    }
    
    // Real password validation for actual users (if needed)
    if (email === ADMIN_USER.email) {
      const isValid = await bcrypt.compare(password, ADMIN_USER.passwordHash);
      
      if (!isValid) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      const token = generateToken(ADMIN_USER);
      console.log('✅ User logged in:', email);
      
      return res.json({
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
    }
    
    // User not found
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
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
