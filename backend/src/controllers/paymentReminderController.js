import Account from '../models/Account.js';
import PricingPlan from '../models/PricingPlan.js';
import { emailService } from '../services/emailService.js';

/**
 * Send payment reminders to pending accounts
 * Can be called manually or via scheduled job
 * @route POST /api/admin/send-payment-reminders
 */
export const sendPaymentReminders = async (req, res) => {
  try {
    console.log('📧 Starting payment reminder job...');

    // Find all accounts with pending status
    const pendingAccounts = await Account.find({ status: 'pending', type: 'client' });
    console.log(`📋 Found ${pendingAccounts.length} pending accounts`);

    if (pendingAccounts.length === 0) {
      return res.json({
        success: true,
        message: 'No pending accounts to remind',
        count: 0
      });
    }

    // Track results
    const results = {
      sent: [],
      failed: [],
      skipped: []
    };

    // Send reminders to each pending account
    for (const account of pendingAccounts) {
      try {
        // Get plan prices
        const planPrices = {
          starter: { monthly: 999, quarterly: 2847, annual: 9590 },
          pro: { monthly: 2999, quarterly: 8547, annual: 28790 },
          enterprise: { monthly: 9999, quarterly: 28497, annual: 95990 },
          custom: { monthly: 0, quarterly: 0, annual: 0 }
        };

        const planAmount = planPrices[account.plan]?.[account.billingCycle] || 0;

        if (!account.email || !account.name) {
          console.warn(`⚠️  Skipping account ${account.accountId} - missing email or name`);
          results.skipped.push({
            accountId: account.accountId,
            reason: 'Missing email or name'
          });
          continue;
        }

        const paymentLink = `${process.env.FRONTEND_URL || 'https://app.pixelswhatsapp.com'}/checkout?plan=${account.plan}`;

        // Send reminder email
        const emailResult = await emailService.sendPaymentReminderEmail({
          email: account.email,
          name: account.name,
          plan: account.plan,
          planAmount: planAmount,
          billingCycle: account.billingCycle,
          paymentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          paymentLink: paymentLink
        });

        if (emailResult.success) {
          results.sent.push({
            accountId: account.accountId,
            email: account.email,
            plan: account.plan
          });
          console.log(`✅ Reminder sent to ${account.email}`);
        } else {
          results.failed.push({
            accountId: account.accountId,
            email: account.email,
            error: emailResult.error
          });
          console.error(`❌ Failed to send reminder to ${account.email}:`, emailResult.error);
        }
      } catch (error) {
        console.error(`❌ Error processing account ${account.accountId}:`, error.message);
        results.failed.push({
          accountId: account.accountId,
          error: error.message
        });
      }
    }

    console.log('📧 Payment reminder job completed:', {
      total: pendingAccounts.length,
      sent: results.sent.length,
      failed: results.failed.length,
      skipped: results.skipped.length
    });

    res.json({
      success: true,
      message: 'Payment reminders sent',
      summary: {
        total: pendingAccounts.length,
        sent: results.sent.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      details: results
    });
  } catch (error) {
    console.error('❌ Payment reminder job failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment reminders',
      error: error.message
    });
  }
};

/**
 * Get pending payment accounts summary
 * @route GET /api/admin/pending-payments
 */
export const getPendingPayments = async (req, res) => {
  try {
    const pendingAccounts = await Account.find({ status: 'pending', type: 'client' })
      .select('accountId email name plan billingCycle createdAt')
      .sort({ createdAt: -1 });

    // Calculate summary
    const planCounts = {};
    const billingCycleCounts = {};

    pendingAccounts.forEach(account => {
      planCounts[account.plan] = (planCounts[account.plan] || 0) + 1;
      billingCycleCounts[account.billingCycle] = (billingCycleCounts[account.billingCycle] || 0) + 1;
    });

    res.json({
      success: true,
      data: pendingAccounts,
      summary: {
        total: pendingAccounts.length,
        byPlan: planCounts,
        byBillingCycle: billingCycleCounts
      }
    });
  } catch (error) {
    console.error('❌ Error fetching pending payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending payments',
      error: error.message
    });
  }
};

/**
 * Mark account as payment reminder sent (optional - for tracking)
 * @route POST /api/admin/mark-reminder-sent/:accountId
 */
export const markReminderSent = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findOne({ accountId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Could add a lastReminderSentAt field if needed
    account.lastReminderSentAt = new Date();
    await account.save();

    res.json({
      success: true,
      message: 'Reminder marked as sent'
    });
  } catch (error) {
    console.error('❌ Error marking reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark reminder',
      error: error.message
    });
  }
};

export default {
  sendPaymentReminders,
  getPendingPayments,
  markReminderSent
};
