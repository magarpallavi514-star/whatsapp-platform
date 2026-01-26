/**
 * Dashboard Controller - Fetch role-specific statistics
 * Superadmin sees: All platform stats
 * Clients see: Their own organization stats
 */

import Account from '../models/Account.js';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Message from '../models/Message.js';
import Contact from '../models/Contact.js';

/**
 * Get dashboard stats for current user
 * Users see their own stats, superadmin sees all platform stats
 * @route GET /api/dashboard/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const accountId = req.account.accountId;
    const account = await Account.findOne({ accountId });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Check if user is superadmin
    const isSuperAdmin = account.type === 'internal';

    let stats = {};

    if (isSuperAdmin) {
      // SUPERADMIN: Platform-wide statistics
      console.log('📊 Fetching platform stats for superadmin');

      // Get organization count (count all client accounts as organizations)
      const organizations = await Account.countDocuments({ type: 'client' });
      const accounts = await Account.countDocuments({ type: 'client' });

      // Get revenue from paid payments
      const paidPayments = await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
      ]);
      const totalRevenue = paidPayments[0]?.totalRevenue || 0;

      // Get pending payments
      const pendingPayments = await Payment.countDocuments({ status: 'pending' });

      // Get total messages across all accounts
      const totalMessages = await Message.countDocuments();

      // Get average response time (mock data)
      const avgResponseTime = 2.4; // Default value

      stats = {
        totalOrganizations: organizations,
        totalAccounts: accounts,
        totalRevenue: Math.round(totalRevenue),
        pendingPayments: pendingPayments,
        totalMessages: totalMessages,
        avgResponseTime: avgResponseTime,
        systemUptime: '99.8%'
      };
    } else {
      // CLIENT: Their organization's statistics
      console.log(`📊 Fetching stats for client account:`, accountId);

      // Get account's contacts
      const contacts = await Contact.countDocuments({ accountId });

      // Get account's messages
      const messages = await Message.countDocuments({ accountId });

      // Get account's invoices
      const invoices = await Invoice.find({ accountId });
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      // Get pending payments
      const pendingPayments = await Payment.countDocuments({ accountId, status: 'pending' });

      // Calculate response rate (mock data for now)
      const responseRate = 94.3;
      const avgResponseTime = 2.4;

      stats = {
        totalContacts: contacts,
        totalMessages: messages,
        totalBilled: Math.round(totalBilled),
        totalPaid: Math.round(totalPaid),
        pendingPayments: pendingPayments,
        responseRate: responseRate,
        avgResponseTime: avgResponseTime,
        invoiceCount: invoices.length,
        paidInvoices: paidInvoices.length
      };
    }

    res.status(200).json({
      success: true,
      data: {
        isSuperAdmin,
        stats,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

/**
 * Get recent activity for dashboard
 * @route GET /api/dashboard/activity
 */
export const getDashboardActivity = async (req, res) => {
  try {
    const accountId = req.account.accountId;
    const account = await Account.findOne({ accountId });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const isSuperAdmin = account.type === 'internal';

    let activity = [];

    if (isSuperAdmin) {
      // Get recent payments across all accounts
      const payments = await Payment.find()
        .populate('accountId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10);

      activity = payments.map(p => ({
        type: 'payment',
        action: `Payment ${p.status}`,
        details: `${p.amount} INR - ${p.accountId?.name || 'Unknown'}`,
        time: p.createdAt,
        icon: 'DollarSign'
      }));
    } else {
      // Get user's recent activity
      const recentInvoices = await Invoice.find({ accountId })
        .sort({ invoiceDate: -1 })
        .limit(5);

      const recentPayments = await Payment.find({ accountId })
        .sort({ createdAt: -1 })
        .limit(5);

      activity = [
        ...recentInvoices.map(inv => ({
          type: 'invoice',
          action: `Invoice ${inv.status}`,
          details: `${inv.invoiceNumber} - ₹${inv.totalAmount}`,
          time: inv.invoiceDate,
          icon: 'FileText'
        })),
        ...recentPayments.map(p => ({
          type: 'payment',
          action: `Payment ${p.status}`,
          details: `₹${p.amount} - ${p.planId || 'Subscription'}`,
          time: p.createdAt,
          icon: 'DollarSign'
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
    }

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard activity:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard activity',
      error: error.message
    });
  }
};

export default {
  getDashboardStats,
  getDashboardActivity
};
