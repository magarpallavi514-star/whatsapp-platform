/**
 * Organizations Controller
 * Handles admin operations for managing registered organizations/users
 */

import User from '../models/User.js';
import Counter from '../models/Counter.js';
import { generateAccountId } from '../utils/idGenerator.js';
import mongoose from 'mongoose';

/**
 * Get all registered users/organizations
 * @route GET /api/admin/organizations
 */
export const getAllOrganizations = async (req, res) => {
  try {
    const users = await User.find({})
      .select('_id accountId email name phone phoneNumber countryCode status role plan billingCycle nextBillingDate totalPayments createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users.map(user => ({
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
        createdAt: user.createdAt
      }))
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
 * Create new organization/user
 * @route POST /api/admin/organizations
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

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone: phoneNumber ? `${countryCode}${phoneNumber}` : '',
      phoneNumber: phoneNumber,
      countryCode: countryCode || '+91',
      plan: plan || 'free',
      status: status || 'active',
      billingCycle: billingCycle || 'monthly',
      nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : null,
      role: 'user',
      totalPayments: 0,
      accountId: accountId // Use the new 7-digit account ID
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
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
        createdAt: newUser.createdAt
      }
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
    const { name, email, countryCode, phoneNumber, plan, status, billingCycle, nextBillingDate } = req.body;

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

    await user.save();

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