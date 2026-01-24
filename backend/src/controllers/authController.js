import bcrypt from 'bcryptjs';
import { generateToken } from '../middlewares/jwtAuth.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import Invoice from '../models/Invoice.js';

/**
 * Auth Controller
 * Handles login/logout for dashboard users
 * NO API KEYS - Uses sessions/cookies
 */

// Hardcoded admin for now (can move to database later)
const ADMIN_USER = {
  email: 'mpiyush2727@gmail.com',
  password: 'Pm@22442232', // EXACT PASSWORD - For demo - use plaintext comparison
  accountId: 'pixels_internal',
  name: 'Piyush Magar',
  role: 'superadmin' // Full platform access
};

// Debug helper
console.log('🔑 ADMIN_USER Configuration:');
console.log('   Email:', ADMIN_USER.email);
console.log('   Password:', ADMIN_USER.password);
console.log('   AccountId:', ADMIN_USER.accountId);
console.log('   Role:', ADMIN_USER.role);

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
      
      // Ensure demo account exists in database
      try {
        // Note: For demo/hardcoded account, we search by accountId field (String) since it's not from auth token
        let account = await Account.findOne({ accountId: user.accountId });
        
        if (!account) {
          console.log('📝 Creating demo account in database...');
          account = new Account({
            accountId: user.accountId,
            name: user.name,
            email: user.email,
            type: 'internal',
            plan: 'demo',
            status: 'active'
          });
          await account.save();
          console.log('✅ Demo account created:', user.accountId);
        } else {
          console.log('✅ Demo account already exists');
        }
      } catch (err) {
        console.error('⚠️  Warning: Could not create demo account:', err.message);
        // Continue anyway - JWT auth will still work
      }
      
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
    
    // Real admin user - password: Pm@22442232
    if (email === ADMIN_USER.email) {
      console.log('🔐 Attempting ADMIN_USER login:');
      console.log('   Email match:', email === ADMIN_USER.email);
      console.log('   Incoming email:', email);
      console.log('   Expected email:', ADMIN_USER.email);
      console.log('   Incoming password length:', password.length);
      console.log('   Expected password length:', ADMIN_USER.password.length);
      console.log('   Password match:', password === ADMIN_USER.password);
      
      if (password !== ADMIN_USER.password) {
        console.log('❌ Invalid password for:', email);
        console.log('   Expected:', ADMIN_USER.password);
        console.log('   Got:', password);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Ensure admin account exists in database
      try {
        // Note: For demo/hardcoded account, we search by accountId field (String) since it's not from auth token
        let account = await Account.findOne({ accountId: ADMIN_USER.accountId });
        
        if (!account) {
          console.log('📝 Creating admin account in database...');
          account = new Account({
            accountId: ADMIN_USER.accountId,
            name: ADMIN_USER.name,
            email: ADMIN_USER.email,
            type: 'internal',
            plan: 'premium',
            status: 'active'
          });
          await account.save();
          console.log('✅ Admin account created:', ADMIN_USER.accountId);
        } else {
          console.log('✅ Admin account already exists');
        }
      } catch (err) {
        console.error('⚠️  Warning: Could not create admin account:', err.message);
        // Continue anyway - JWT auth will still work
      }
      
      const token = generateToken(ADMIN_USER);
      console.log('🔐 Admin user logged in:');
      console.log('  Email:', email);
      console.log('  AccountId:', ADMIN_USER.accountId);
      console.log('  Token length:', token.length);
      
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
    
    // Check for registered user in database
    console.log('🔍 Checking Account collection for:', email);
    const account = await Account.findOne({ email });
    
    if (!account) {
      console.log('❌ Account not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is still PENDING (payment not completed)
    if (account.status === 'pending') {
      console.log('⏳ Account pending payment:', email);
      return res.status(403).json({
        success: false,
        message: 'Please complete payment to activate your account. Redirecting to checkout...',
        requiresPayment: true
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for account:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Account authenticated - generate token
    const userData = {
      email: account.email,
      accountId: account.accountId,
      name: account.name,
      role: 'user',
      _id: account._id
    };
    
    const token = generateToken(userData);
    console.log('✅ Account logged in:', email);
    
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
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
/**
 * POST /api/auth/logout
 * Logout user (clear token)
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
 * POST /api/auth/signup
 * Register a new user account
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, company, phone, selectedPlan } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate plan selection (Starter or Pro)
    if (!selectedPlan || !['starter', 'pro'].includes(selectedPlan.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Please select a plan: Starter or Pro'
      });
    }

    // Map frontend plan names to backend enum values
    const planMapping = {
      'starter': 'basic',  // frontend "Starter" maps to backend "basic" plan
      'pro': 'pro'         // frontend "Pro" maps to backend "pro" plan
    };
    const mappedPlan = planMapping[selectedPlan.toLowerCase()];

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if email already exists
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique accountId
    const accountId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new account with PENDING status (will be activated after payment)
    const newAccount = new Account({
      accountId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      company: company?.trim() || undefined,
      phone: phone?.trim() || undefined,
      type: 'client',
      plan: mappedPlan, // Set to mapped plan (basic or pro)
      status: 'pending' // Account is PENDING until payment succeeds
    });

    await newAccount.save();

    console.log('✅ New account created (PENDING - awaiting payment):');
    console.log('  AccountId:', accountId);
    console.log('  Email:', email);
    console.log('  Name:', name);
    console.log('  Status: PENDING (will be activated after payment)');
    console.log('  Selected Plan (Frontend):', selectedPlan.toLowerCase());
    console.log('  Mapped Plan (Backend):', mappedPlan);

    // 📝 NOTE: Account is PENDING until payment completes
    // Invoice will be created after user completes payment for selected plan
    // Webhook will activate the account when payment succeeds

    // Create user object for token
    // Use a temporary token that only allows checkout
    const user = {
      accountId,
      email: newAccount.email,
      name: newAccount.name,
      role: 'user',
      status: 'pending' // Mark token as pending
    };

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created! Completing payment to activate...',
      token,
      user,
      selectedPlan: selectedPlan.toLowerCase(),
      redirectTo: `/checkout?plan=${selectedPlan.toLowerCase()}`
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.'
    });
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 * Demo mode: superadmin@test.com accepts any password
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
  signup,
  logout,
  getCurrentUser
};
