/**
 * Organizations Controller
 * Handles admin operations for managing registered organizations/users
 */

import User from '../models/User.js';
import Account from '../models/Account.js';
import Counter from '../models/Counter.js';
import Subscription from '../models/Subscription.js';
import Invoice from '../models/Invoice.js';
import PricingPlan from '../models/PricingPlan.js';
import { generateAccountId, generateId } from '../utils/idGenerator.js';
import { emailService } from '../services/emailService.js';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

/**
 * Get all registered users/organizations
 * @route GET /api/admin/organizations
 * IMPORTANT: Query BOTH User and Account models (new accounts use Account model)
 * INCLUDES: Basic info + Payment Details + Subscription Status
 */
export const getAllOrganizations = async (req, res) => {
  try {
    // Get from old User model
    const users = await User.find({})
      .select('_id accountId email name phone phoneNumber countryCode status role plan billingCycle nextBillingDate totalPayments createdAt')
      .sort({ createdAt: -1 });

    // Get from new Account model (signup flow)
    const accounts = await Account.find({})
      .select('-apiKeyHash -password') // Exclude sensitive fields
      .sort({ createdAt: -1 });

    // Fetch related data for all accounts
    const accountIds = accounts.filter(acc => acc.type !== 'internal').map(acc => acc._id);
    
    // Get subscriptions for these accounts
    const subscriptions = await Subscription.find({ accountId: { $in: accountIds } })
      .lean();
    
    // Get invoices for these accounts
    const invoices = await Invoice.find({ accountId: { $in: accountIds } })
      .lean()
      .sort({ createdAt: -1 });

    // Create lookup maps for faster access
    const subscriptionMap = {};
    const invoiceMap = {};
    
    subscriptions.forEach(sub => {
      if (!subscriptionMap[sub.accountId]) {
        subscriptionMap[sub.accountId] = sub;
      }
    });
    
    invoices.forEach(inv => {
      if (!invoiceMap[inv.accountId]) {
        invoiceMap[inv.accountId] = inv;
      }
    });

    // Combine and format both sources
    const allOrganizations = [
      // From User model
      ...users.map(user => ({
        _id: user._id,
        accountId: user.accountId,
        email: user.email,
        name: user.name || user.email,
        phoneNumber: user.phoneNumber || user.phone || '',
        plan: user.plan || 'free',
        status: user.status || 'active',
        role: user.role,
        billingCycle: user.billingCycle || 'monthly',
        nextBillingDate: user.nextBillingDate,
        totalPayments: user.totalPayments || 0,
        createdAt: user.createdAt,
        source: 'legacy', // Mark as legacy User model
        // Payment/Subscription data
        subscription: null,
        invoice: null,
        paymentStatus: 'N/A'
      })),
      // From Account model
      ...accounts.filter(acc => acc.type !== 'internal').map(account => {
        const accountIdStr = account._id.toString();
        const subscription = subscriptionMap[accountIdStr];
        const invoice = invoiceMap[accountIdStr];
        
        return {
          _id: account._id,
          accountId: account.accountId,
          email: account.email,
          name: account.name,
          phoneNumber: account.phone || '',
          company: account.company || '',
          mobileNumber: account.mobileNumber || '',
          website: account.website || '',
          plan: account.plan || 'free',
          status: account.status,
          role: 'user',
          billingCycle: account.billingCycle || 'monthly',
          nextBillingDate: subscription?.nextRenewalDate || null,
          totalPayments: subscription?.paymentAmount || 0,
          subdomain: account.subdomain || null,
          createdAt: account.createdAt,
          source: 'new_signup', // Mark as new signup flow
          // ✅ Payment/Subscription data
          subscription: subscription ? {
            _id: subscription._id,
            orderId: subscription.orderId,
            paymentAmount: subscription.paymentAmount,
            paymentStatus: subscription.paymentStatus,
            paymentMethod: subscription.paymentMethod,
            nextRenewalDate: subscription.nextRenewalDate,
            createdAt: subscription.createdAt
          } : null,
          invoice: invoice ? {
            _id: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            status: invoice.status,
            dueDate: invoice.dueDate,
            paidDate: invoice.paidDate,
            createdAt: invoice.createdAt
          } : null,
          paymentStatus: subscription?.paymentStatus || account.status === 'active' ? 'paid' : 'pending'
        }
      })
    ];

    // Sort by creation date (newest first)
    allOrganizations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: allOrganizations,
      summary: {
        total: allOrganizations.length,
        legacy: users.length,
        new_signups: accounts.filter(acc => acc.type !== 'internal').length,
        activeSubscriptions: subscriptions.length,
        pendingInvoices: invoices.filter(inv => inv.status === 'pending').length
      }
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: error.message
    });
  }
};

/**
 * Create new organization/user (FREE - NO INVOICE)
 * @route POST /api/admin/organizations
 * @desc Creates a new client with plan but NO AUTOMATIC INVOICE
 * Invoice is created only when admin clicks "Generate Payment Link"
 */
export const createOrganization = async (req, res) => {
  try {
    const { name, email, countryCode, phoneNumber, plan, status, billingCycle, nextBillingDate } = req.body;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate new account ID (7-digit: YYXXXXX format)
    const accountId = await generateAccountId(Counter);

    // 🔐 Generate random password automatically
    const generatePassword = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%"
      let password = ""
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return password
    }

    const temporaryPassword = generatePassword();
    const hashedPassword = await bcryptjs.hash(temporaryPassword, 10);

    // Create new user
    // ✅ ENFORCE: All new organizations start as 'active'
    // Payment webhook will handle payment verification
    const planLower = (plan || 'free').toLowerCase();
    const finalStatus = status && ['active', 'inactive', 'suspended'].includes(status) ? status : 'active';
    
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone: phoneNumber ? `${countryCode}${phoneNumber}` : '',
      phoneNumber: phoneNumber,
      countryCode: countryCode || '+91',
      plan: plan || 'free',
      status: finalStatus, // ✅ Enforce payment requirement for non-free plans
      billingCycle: billingCycle || 'monthly',
      nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : null,
      role: 'user',
      totalPayments: 0,
      accountId: accountId, // Use the new 7-digit account ID
      password: hashedPassword // Store hashed password
    });
    
    console.log(`📝 Creating org: plan="${plan}" → status="${finalStatus}"`);
    console.log(`🔐 Generated temporary password for: ${email}`);

    await newUser.save();
    // ✅ CREATE ACCOUNT ENTRY FOR NEW ORGANIZATION
    // This allows the user to login and access the platform immediately
    let accountCreated = false;
    try {
      const newAccount = new Account({
        email: newUser.email.toLowerCase(),
        name: newUser.name,
        accountId: newUser.accountId,
        plan: newUser.plan,
        status: finalStatus,
        billingCycle: newUser.billingCycle,
        nextBillingDate: newUser.nextBillingDate,
        type: 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newAccount.save();
      accountCreated = true;
      console.log(`✅ [ACCOUNT] Created Account entry for: ${newUser.email} (accountId: ${newUser.accountId})`);
    } catch (accountError) {
      console.warn('⚠️  Account entry creation error:', accountError.message);
      // Don't fail the request if account creation fails
    }
    // � Create invoice record for free clients (even if $0)
    // This ensures proper multi-tenant billing tracking
    let invoiceCreated = false;
    try {
      const newInvoice = new Invoice({
        accountId: accountId,
        customerId: newUser._id,
        invoiceNumber: `INV-${accountId}-${Date.now()}`,
        amount: 0, // Free client
        currency: 'INR',
        status: 'completed', // Auto-completed for free clients
        description: 'Free account - No payment required',
        planName: plan || 'free',
        billingCycle: billingCycle || 'monthly',
        issueDate: new Date(),
        dueDate: new Date(),
        paidDate: new Date(), // Auto-marked as paid
        notes: 'Automatically created for free client registration',
        items: [
          {
            description: `${plan || 'free'} plan subscription`,
            quantity: 1,
            amount: 0,
            rate: 0
          }
        ]
      });

      await newInvoice.save();
      invoiceCreated = true;
      console.log(`✅ [INVOICE] Created $0 invoice for free client: ${accountId}`);
    } catch (invoiceError) {
      console.warn('⚠️  Invoice creation error (non-critical):', invoiceError.message);
      // Don't fail the request if invoice creation fails
    }

    // 📧 Send email with Account ID and Temporary Password
    let emailSent = false;
    try {
      console.log(`\n📧 [ORGANIZATION] Sending credentials email to: ${newUser.email}`);
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { padding: 30px; }
            .credentials-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; font-family: 'Courier New', monospace; }
            .label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
            .value { font-size: 16px; color: #333; word-break: break-all; padding: 8px; background: white; border-radius: 3px; }
            .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
            .button:hover { background: #764ba2; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
            .plan-badge { display: inline-block; background: #667eea; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; text-transform: uppercase; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Replysys!</h1>
              <p>Your account is ready to use</p>
            </div>
            
            <div class="content">
              <p>Hello <strong>${newUser.name}</strong>,</p>
              
              <p>Your Replysys organization account has been successfully created by your administrator. Below are your login credentials:</p>
              
              <div class="credentials-box">
                <div class="label">Account ID</div>
                <div class="value">${newUser.accountId}</div>
                
                <div class="label" style="margin-top: 15px;">Email</div>
                <div class="value">${newUser.email}</div>
                
                <div class="label" style="margin-top: 15px;">Temporary Password</div>
                <div class="value">${temporaryPassword}</div>
                
                <div class="plan-badge">Plan: ${newUser.plan.toUpperCase()}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️  Important:</strong> Please change your password after your first login for security. This temporary password will work immediately.
              </div>
              
              <p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to Dashboard</a>
              </p>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Login with your credentials above</li>
                <li>Complete your profile setup</li>
                <li>Connect your WhatsApp Business Account</li>
                <li>Start sending messages!</li>
              </ol>
              
              <p>If you need any assistance, contact our support team.</p>
              
              <p>Best regards,<br><strong>Replysys Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Replysys. All rights reserved.</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const emailResult = await emailService.sendEmail(newUser.email, '🎉 Your Replysys Account is Ready - Login Credentials', emailHtml);
      emailSent = emailResult.success;
      
      if (emailSent) {
        console.log(`✅ [ORGANIZATION] Credentials email sent to ${newUser.email}`);
      } else {
        console.warn(`⚠️  [ORGANIZATION] Credentials email failed: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.warn('⚠️  Credentials email error:', emailError.message);
      // Don't fail the request if email fails - account is created
    }

    res.status(201).json({
      success: true,
      message: `Organization created successfully${emailSent ? ' - Welcome email sent ✅' : ' - Email failed but account created'}${accountCreated ? ' - Account ready for login ✅' : ''}`,
      data: {
        _id: newUser._id,
        accountId: newUser.accountId,
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        plan: newUser.plan,
        status: newUser.status,
        role: newUser.role,
        billingCycle: newUser.billingCycle,
        nextBillingDate: newUser.nextBillingDate,
        totalPayments: newUser.totalPayments,
        createdAt: newUser.createdAt,
        emailSent: emailSent,
        invoiceCreated: invoiceCreated,
        accountCreated: accountCreated
      },
      note: accountCreated && invoiceCreated 
        ? '✅ Organization ready! User can login immediately. Account + Invoice created.'
        : accountCreated
        ? '✅ Organization created with Account. User can login immediately.'
        : '💡 Organization created (Account creation pending). Click "Generate Payment Link" to create invoice.'
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization',
      error: error.message
    });
  }
};

/**
 * Get single organization by ID
 * @route GET /api/admin/organizations/:id
 */
export const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('_id email name phone phoneNumber countryCode status role plan nextBillingDate totalPayments createdAt updatedAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber || user.phone,
        plan: user.plan,
        status: user.status,
        role: user.role,
        nextBillingDate: user.nextBillingDate,
        totalPayments: user.totalPayments || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization',
      error: error.message
    });
  }
};

/**
 * Update organization
 * @route PUT /api/admin/organizations/:id
 */
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, countryCode, phoneNumber, plan, status, billingCycle, nextBillingDate, password, sendEmail } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) {
      // Check if new email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email.toLowerCase();
    }
    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
      user.phone = phoneNumber ? `${countryCode || '+91'}${phoneNumber}` : '';
    }
    if (countryCode) user.countryCode = countryCode;
    if (plan) user.plan = plan;
    if (status) user.status = status;
    if (billingCycle) user.billingCycle = billingCycle;
    if (nextBillingDate) user.nextBillingDate = new Date(nextBillingDate);
    
    // Hash password if provided
    if (password && password.trim()) {
      user.password = await bcryptjs.hash(password, 10);
      console.log(`✅ Password updated for organization: ${user.email}`);
    }

    await user.save();

    // Send email if password was updated and sendEmail is true
    if (password && password.trim() && sendEmail) {
      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your New Password</h2>
          <p>Hello ${user.name || user.email},</p>
          <p>Your password has been updated. Use the new password below to login:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 18px; font-weight: bold; color: #333; font-family: monospace; word-break: break-all;">
              ${password}
            </p>
          </div>
          <p>Login at: <a href="https://replysys.com/login">https://replysys.com/login</a></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            If you did not request this password update, please contact support immediately.
          </p>
        </div>
      `;

      try {
        const emailResult = await emailService.sendEmail(user.email, '🔐 Your Password Updated - Replysys', emailTemplate);
        if (emailResult.success) {
          console.log(`✅ Password email sent to ${user.email}`);
        } else {
          console.warn(`⚠️  Password email failed for ${user.email}: ${emailResult.error}`);
        }
      } catch (emailErr) {
        console.error('⚠️  Error sending password email:', emailErr.message);
        // Don't fail the request if email fails - password is already updated
      }
    }

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        plan: user.plan,
        status: user.status,
        role: user.role,
        billingCycle: user.billingCycle,
        nextBillingDate: user.nextBillingDate,
        totalPayments: user.totalPayments,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization',
      error: error.message
    });
  }
};

/**
 * Reset organization password and send via email
 * @route POST /api/admin/organizations/:id/reset-password
 */
export const resetOrganizationPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, sendEmail } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Hash and save password
    user.password = await bcryptjs.hash(password, 10);
    await user.save();

    // Send email if requested
    if (sendEmail) {
      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Temporary Password</h2>
          <p>Hello ${user.name || user.email},</p>
          <p>An administrator has reset your password. Use the temporary password below to login:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 18px; font-weight: bold; color: #333; font-family: monospace; word-break: break-all;">
              ${password}
            </p>
          </div>
          <p><strong>Important:</strong> Please change this password after logging in for security.</p>
          <p>Login at: <a href="https://replysys.com/login">https://replysys.com/login</a></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            If you did not request this password reset, please contact support immediately.
          </p>
        </div>
      `;

      await emailService.sendEmail(user.email, '🔐 Your New Password - Replysys', emailTemplate);
    }

    res.json({
      success: true,
      message: 'Password reset successfully' + (sendEmail ? ' and email sent' : ''),
      data: {
        _id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

/**
 * Delete organization
 * @route DELETE /api/admin/organizations/:id
 */
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete organization',
      error: error.message
    });
  }
};
/**
 * Update existing organizations with missing next billing dates
 * @route POST /api/admin/organizations/migrate/billing-dates
 */
export const migrateBillingDates = async (req, res) => {
  try {
    const users = await User.find({ 
      $or: [
        { nextBillingDate: null },
        { nextBillingDate: undefined }
      ]
    });

    let updated = 0;

    for (const user of users) {
      const signupDate = new Date(user.createdAt || new Date());
      let nextBillingDate = new Date(signupDate);

      const billingCycle = user.billingCycle || 'monthly';

      if (billingCycle === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else if (billingCycle === 'quarterly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      } else if (billingCycle === 'annually') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      user.nextBillingDate = nextBillingDate;
      await user.save();
      updated++;
    }

    res.json({
      success: true,
      message: `Migration completed. Updated ${updated} organizations with billing dates`,
      updated: updated
    });
  } catch (error) {
    console.error('Error migrating billing dates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to migrate billing dates',
      error: error.message
    });
  }
};

/**
 * Create Invoice for a Client (Retroactive or Free)
 * @route POST /api/admin/organizations/:id/create-invoice
 * @desc Creates a simple invoice for free clients or retroactive invoices
 * Called from frontend to create $0 invoice for tracking
 */
export const createInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount = 0, description = 'Free account invoice' } = req.body;

    // Get the organization
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if invoice already exists for this account
    const existingInvoice = await Invoice.findOne({ accountId: req.account.accountId });
    if (existingInvoice && amount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Free invoice already exists for this client'
      });
    }

    // Create invoice
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = new Invoice({
      accountId: user.accountId,
      customerId: user._id,
      invoiceNumber,
      amount: amount,
      currency: 'INR',
      status: amount === 0 ? 'completed' : 'pending',
      description: description,
      planName: user.plan || 'free',
      billingCycle: user.billingCycle || 'monthly',
      issueDate: new Date(),
      dueDate: new Date(),
      paidDate: amount === 0 ? new Date() : null,
      notes: amount === 0 ? 'Free account invoice for tracking' : 'Payment pending',
      items: [
        {
          description: `${user.plan || 'free'} plan subscription`,
          quantity: 1,
          amount: amount,
          rate: amount
        }
      ]
    });

    await invoice.save();

    res.status(201).json({
      success: true,
      message: amount === 0 
        ? 'Free invoice created for tracking'
        : 'Invoice created successfully',
      data: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        status: invoice.status,
        createdAt: invoice.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

/**
 * Generate Payment Link for a Client
 * @route POST /api/admin/organizations/:id/generate-payment-link
 * @desc Creates invoice and subscription for a client with the selected plan
 * Called when admin clicks "Generate Payment Link" button
 */
export const generatePaymentLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'planId is required'
      });
    }

    // Get the organization
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Get the pricing plan
    const plan = await PricingPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    // Check if subscription already exists
    let subscription = await Subscription.findOne({ accountId: req.account.accountId });
    
    if (subscription) {
      return res.status(400).json({
        success: false,
        message: 'Subscription already exists for this client'
      });
    }

    // Create subscription
    const subscriptionId = `sub_${generateId()}`;
    subscription = new Subscription({
      subscriptionId,
      accountId: user.accountId,
      userId: user._id,
      planId: plan._id,
      planName: plan.name,
      billingCycle: user.billingCycle || 'monthly',
      status: 'pending', // Pending until payment
      startDate: new Date(),
      nextBillingDate: user.nextBillingDate,
      pricing: {
        amount: plan.monthlyPrice,
        currency: plan.currency || 'INR',
        frequency: 'monthly'
      }
    });

    await subscription.save();

    // Create invoice
    const invoiceId = `inv_${generateId()}`;
    const invoiceNumber = await generateInvoiceNumber();

    const amount = plan.monthlyPrice;
    const setupFee = plan.setupFee || 0;
    const subtotal = amount + setupFee;

    const invoice = new Invoice({
      invoiceId,
      invoiceNumber,
      accountId: user.accountId,
      subscriptionId: subscription._id,
      billTo: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.name
      },
      lineItems: [
        {
          description: `${plan.name} - Monthly Plan`,
          quantity: 1,
          unitPrice: amount,
          amount: amount
        },
        ...(setupFee > 0 ? [{
          description: 'Setup Fee',
          quantity: 1,
          unitPrice: setupFee,
          amount: setupFee
        }] : [])
      ],
      subtotal: subtotal,
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: subtotal,
      dueAmount: subtotal,
      currency: plan.currency || 'INR',
      status: 'pending',
      paymentTerms: 'Net 5',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    });

    await invoice.save();

    // Generate payment link (Cashfree)
    let paymentLink = null;
    try {
      // Mock payment link - in production, integrate with Cashfree API
      const baseUrl = process.env.FRONTEND_URL || 'https://replysys.com';
      paymentLink = `${baseUrl}/checkout?invoice=${invoiceId}&amount=${subtotal}&customer=${user.accountId}`;
    } catch (error) {
      console.warn('⚠️  Could not generate payment link:', error.message);
    }

    // Send payment link email
    try {
      await emailService.sendPaymentLinkEmail(
        user.email,
        paymentLink || `Invoice #${invoiceNumber}`,
        invoiceNumber,
        subtotal,
        user.name
      );
    } catch (emailError) {
      console.warn('⚠️  Payment link email not sent:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Payment link generated successfully',
      data: {
        subscriptionId: subscription.subscriptionId,
        invoiceId: invoice.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount,
        paymentLink: paymentLink,
        dueDate: invoice.dueDate
      },
      note: '📧 Payment link sent to client email'
    });
  } catch (error) {
    console.error('Error generating payment link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment link',
      error: error.message
    });
  }
};

// Helper function to generate invoice number
const generateInvoiceNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  const lastInvoice = await Invoice.findOne({
    invoiceNumber: new RegExp(`^INV-${year}-`)
  }).sort({ invoiceNumber: -1 });

  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `INV-${year}-${String(sequence).padStart(6, '0')}`;
};