import Account from '../models/Account.js';
import { emailService } from '../services/emailService.js';

/**
 * GET /api/admin/pending-users
 * List all accounts with pending payment status (superadmin only)
 */
export const getPendingUsers = async (req, res) => {
  try {
    // Check if superadmin
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can view pending users'
      });
    }

    const { limit = 50, skip = 0 } = req.query;

    // Find all accounts with status 'pending'
    const pendingUsers = await Account.find({ status: 'pending' })
      .select('_id accountId name email company phone plan billingCycle createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Calculate amount due for each user based on plan and billing cycle
    const planPrices = {
      starter: { monthly: 999, quarterly: 2847, annual: 9590 },
      pro: { monthly: 2999, quarterly: 8547, annual: 28790 },
      enterprise: { monthly: 9999, quarterly: 28497, annual: 95990 },
      custom: { monthly: 0, quarterly: 0, annual: 0 }
    };

    const usersWithAmounts = pendingUsers.map((user) => {
      const planKey = (user.plan || 'starter').toLowerCase();
      const cycleKey = (user.billingCycle || 'monthly').toLowerCase();
      
      const prices = planPrices[planKey] || planPrices.starter;
      const amount = prices[cycleKey] || prices.monthly;

      return {
        _id: user._id,
        accountId: user.accountId,
        name: user.name,
        email: user.email,
        company: user.company,
        phone: user.phone,
        plan: user.plan,
        billingCycle: user.billingCycle,
        amountDue: amount,
        registeredAt: user.createdAt,
        hoursAgo: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60))
      };
    });

    const total = await Account.countDocuments({ status: 'pending' });

    console.log('✅ Fetched pending users:', {
      count: usersWithAmounts.length,
      total,
      skip,
      limit
    });

    res.status(200).json({
      success: true,
      data: usersWithAmounts,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching pending users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending users',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/send-payment-reminder
 * Send payment reminder email to a pending user (superadmin only)
 */
export const sendPaymentReminder = async (req, res) => {
  try {
    // Check if superadmin
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can send payment reminders'
      });
    }

    const { accountId, userId } = req.body;

    if (!accountId && !userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide accountId or userId'
      });
    }

    // Find the account
    const account = await Account.findOne({
      $or: [
        { _id: userId || accountId },
        { accountId: accountId }
      ]
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (account.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This account is not pending payment',
        currentStatus: account.status
      });
    }

    // Calculate amount due
    const planPrices = {
      starter: { monthly: 999, quarterly: 2847, annual: 9590 },
      pro: { monthly: 2999, quarterly: 8547, annual: 28790 },
      enterprise: { monthly: 9999, quarterly: 28497, annual: 95990 },
      custom: { monthly: 0, quarterly: 0, annual: 0 }
    };

    const planKey = (account.plan || 'starter').toLowerCase();
    const cycleKey = (account.billingCycle || 'monthly').toLowerCase();
    const prices = planPrices[planKey] || planPrices.starter;
    const amountDue = prices[cycleKey] || prices.monthly;

    // Generate payment link
    const paymentLink = `${(process.env.FRONTEND_URL || 'https://replysys.com').replace(/\/$/, '')}/checkout?plan=${account.plan.toLowerCase()}&billingCycle=${account.billingCycle.toLowerCase()}`;

    // Send reminder email
    await emailService.sendPaymentReminderEmail(
      account.email,
      account.name,
      account.plan,
      amountDue,
      account.billingCycle,
      paymentLink
    );

    console.log('✅ Payment reminder sent to:', {
      email: account.email,
      name: account.name,
      amount: amountDue
    });

    res.status(200).json({
      success: true,
      message: 'Payment reminder email sent successfully',
      data: {
        email: account.email,
        name: account.name,
        plan: account.plan,
        amountDue
      }
    });
  } catch (error) {
    console.error('❌ Error sending payment reminder:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment reminder',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/send-reminder-all-pending
 * Send payment reminders to all pending users (superadmin only)
 * Optional: filter by hours (e.g., only users pending for more than 24 hours)
 */
export const sendReminderAllPending = async (req, res) => {
  try {
    // Check if superadmin
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can send bulk reminders'
      });
    }

    const { hoursAfterSignup = 24 } = req.body;

    // Find pending users who registered more than X hours ago
    const cutoffTime = new Date(Date.now() - hoursAfterSignup * 60 * 60 * 1000);
    const pendingUsers = await Account.find({
      status: 'pending',
      createdAt: { $lt: cutoffTime }
    }).select('_id name email plan billingCycle createdAt');

    console.log(`📧 Found ${pendingUsers.length} pending users to remind (registered before ${hoursAfterSignup}h ago)`);

    const planPrices = {
      starter: { monthly: 999, quarterly: 2847, annual: 9590 },
      pro: { monthly: 2999, quarterly: 8547, annual: 28790 },
      enterprise: { monthly: 9999, quarterly: 28497, annual: 95990 },
      custom: { monthly: 0, quarterly: 0, annual: 0 }
    };

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Send emails
    for (const user of pendingUsers) {
      try {
        const planKey = (user.plan || 'starter').toLowerCase();
        const cycleKey = (user.billingCycle || 'monthly').toLowerCase();
        const prices = planPrices[planKey] || planPrices.starter;
        const amountDue = prices[cycleKey] || prices.monthly;

        const paymentLink = `${(process.env.FRONTEND_URL || 'https://replysys.com').replace(/\/$/, '')}/checkout?plan=${user.plan.toLowerCase()}&billingCycle=${user.billingCycle.toLowerCase()}`;

        await emailService.sendPaymentReminderEmail(
          user.email,
          user.name,
          user.plan,
          amountDue,
          user.billingCycle,
          paymentLink
        );

        results.sent++;
        console.log(`✅ Reminder sent to: ${user.email}`);
      } catch (err) {
        results.failed++;
        results.errors.push({
          email: user.email,
          error: err.message
        });
        console.error(`❌ Failed to send reminder to ${user.email}:`, err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Payment reminders sent to ${results.sent} users`,
      results
    });
  } catch (error) {
    console.error('❌ Error sending bulk reminders:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk reminders',
      error: error.message
    });
  }
};
