import bcrypt from 'bcryptjs';
import { generateToken } from '../middlewares/jwtAuth.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import Invoice from '../models/Invoice.js';
import PricingPlan from '../models/PricingPlan.js';
import { emailService } from '../services/emailService.js';

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
    const account = await Account.findOne({ email }).select('+password'); // Explicitly select password field
    
    if (!account) {
      console.log('❌ Account not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password - account.password should be available
    if (!account.password) {
      console.log('❌ Account has no password set:', email);
      console.log('   Account details:', {
        accountId: account.accountId,
        email: account.email,
        status: account.status,
        hasPassword: !!account.password,
        passwordType: typeof account.password
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for account:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Account authenticated - generate token
    // ✅ ALLOW PENDING ACCOUNTS TO LOGIN - They will see payment banner on dashboard
    // ✅ Users can complete payment from /dashboard/billing page
    const userData = {
      email: account.email,
      accountId: account.accountId,
      name: account.name,
      role: 'user',
      status: account.status, // ✅ Include status so frontend knows if pending
      plan: account.plan, // ✅ Include plan details
      billingCycle: account.billingCycle, // ✅ Include billing cycle
      _id: account._id
    };
    
    const token = generateToken(userData);
    
    // Log appropriate message based on status
    if (account.status === 'pending') {
      console.log('⏳ Pending account logged in (payment required):', email);
    } else {
      console.log('✅ Account logged in:', email);
    }
    
    return res.json({
      success: true,
      message: account.status === 'pending' 
        ? 'Login successful - Please complete payment to unlock features'
        : 'Login successful',
      token,
      user: userData,
      requiresPayment: account.status === 'pending' // ✅ Signal to frontend
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
    const { name, email, password, company, phone, selectedPlan, billingCycle } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate plan selection - accept any plan name from API
    if (!selectedPlan || selectedPlan.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please select a plan'
      });
    }

    // Validate billing cycle
    const validCycles = ['monthly', 'quarterly', 'annual'];
    const cycle = (billingCycle || 'monthly').toLowerCase();
    if (!validCycles.includes(cycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle. Choose: monthly, quarterly, or annual'
      });
    }

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

    // Fetch pricing plan to get the plan name (selectedPlan might be a plan ID from API)
    // PricingPlan.name is 'Starter', 'Pro', etc. but Account model enum expects lowercase
    let planName = selectedPlan.toLowerCase(); // Default fallback
    
    try {
      // Query by planId first (exact match) - planId is like "plan_4fe55bd0ea1d"
      let pricingPlan = await PricingPlan.findOne({ 
        planId: selectedPlan,
        isActive: true 
      });
      
      // If not found by planId, try by name
      if (!pricingPlan) {
        pricingPlan = await PricingPlan.findOne({
          name: { $regex: selectedPlan, $options: 'i' },
          isActive: true
        });
      }
      
      if (pricingPlan) {
        planName = pricingPlan.name.toLowerCase(); // Convert 'Starter' → 'starter'
        console.log(`✅ Plan resolved: "${pricingPlan.name}" → "${planName}" (planId: ${pricingPlan.planId})`);
      } else {
        console.log(`⚠️ Plan "${selectedPlan}" not found in database. Using lowercase as fallback: "${planName}"`);
      }
    } catch (err) {
      console.error(`❌ Error querying PricingPlan:`, err.message);
      console.log(`   Continuing with fallback planName: "${planName}"`);
    }

    // Create new account with PENDING status (will be activated after payment)
    const newAccount = new Account({
      accountId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      company: company?.trim() || undefined,
      phone: phone?.trim() || undefined,
      type: 'client',
      plan: planName, // Use resolved plan name from database or input
      billingCycle: cycle, // Store billing cycle preference
      status: 'pending' // Account is PENDING until payment succeeds
    });

    await newAccount.save();

    console.log('✅ New account created (PENDING - awaiting payment):');
    console.log('  AccountId:', accountId);
    console.log('  Email:', email);
    console.log('  Name:', name);
    console.log('  Status: PENDING (will be activated after payment)');
    console.log('  Selected Plan:', planName);
    console.log('  Billing Cycle:', cycle);

    // 📝 NOTE: Account is PENDING until payment completes
    // Invoice will be created after user completes payment for selected plan
    // Webhook will activate the account when payment succeeds

    // Send pending payment notification email
    try {
      const paymentLink = `${process.env.FRONTEND_URL || 'https://app.pixelswhatsapp.com'}/checkout?plan=${planName.toLowerCase()}`;
      const planPrices = {
        starter: { monthly: 999, quarterly: 2847, annual: 9590 },
        pro: { monthly: 2999, quarterly: 8547, annual: 28790 },
        enterprise: { monthly: 9999, quarterly: 28497, annual: 95990 },
        custom: { monthly: 0, quarterly: 0, annual: 0 }
      };
      
      const planAmount = planPrices[planName]?.[cycle] || 0;
      if (planAmount > 0) {
        console.log('📧 Sending pending payment email to:', email);
        await emailService.sendPendingPaymentEmail(
          email,
          name,
          planName,
          planAmount,
          cycle,
          paymentLink
        ).catch(err => console.error('⚠️ Failed to send pending payment email:', err.message));
      }
    } catch (emailErr) {
      console.error('⚠️ Error in pending payment email:', emailErr.message);
      // Don't fail signup if email fails
    }

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
