import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import Invoice from '../models/Invoice.js';
import Account from '../models/Account.js';
import { generateId } from '../utils/idGenerator.js';

// Create payment initiation
export const initiatePayment = async (req, res) => {
  try {
    const { planId, billingCycle, paymentGateway } = req.body;

    if (!planId || !billingCycle || !paymentGateway) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate payment gateway
    const validGateways = ['stripe', 'razorpay', 'paypal', 'manual_transfer'];
    if (!validGateways.includes(paymentGateway)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment gateway'
      });
    }

    const paymentId = `pay_${generateId()}`;

    // Create payment record
    const payment = new Payment({
      paymentId,
      accountId: req.account.accountId,
      amount: 0, // Will be set when we have pricing
      currency: 'USD',
      paymentGateway,
      status: 'pending',
      initiatedAt: new Date()
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment initiated',
      data: {
        paymentId,
        nextStep: 'redirect_to_payment_gateway'
      }
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment'
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.accountId !== req.account.accountId && req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment'
    });
  }
};

// Get all payments for account
export const getMyPayments = async (req, res) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;
    const filter = { accountId: req.account.accountId };

    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
};

// Confirm payment (called by payment gateway webhook)
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId, gatewayTransactionId, status, amount } = req.body;

    if (!paymentId || !gatewayTransactionId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (status === 'completed' || status === 'success') {
      payment.status = 'completed';
      payment.gatewayTransactionId = gatewayTransactionId;
      payment.completedAt = new Date();
      if (amount) payment.amount = amount;

      await payment.save();

      // Update subscription status if associated
      if (payment.subscriptionId) {
        await Subscription.findByIdAndUpdate(payment.subscriptionId, {
          status: 'active'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: payment
      });
    } else if (status === 'failed') {
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.failureReason = req.body.failureReason || 'Payment failed';
      payment.errorCode = req.body.errorCode;
      payment.errorMessage = req.body.errorMessage;

      await payment.save();

      return res.status(200).json({
        success: true,
        message: 'Payment failure recorded',
        data: payment
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid payment status'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
};

// Refund payment
export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason, refundAmount } = req.body;

    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can refund payments'
      });
    }

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    const refund = refundAmount || payment.amount;

    payment.status = 'refunded';
    payment.refundAmount = refund;
    payment.refundReason = reason || 'Admin initiated refund';
    payment.refundStatus = refund === payment.amount ? 'full' : 'partial';
    payment.refundedAt = new Date();

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refund payment'
    });
  }
};

// Get all payments (SUPERADMIN)
export const getAllPayments = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can view all payments'
      });
    }

    const { status, accountId, limit = 50, skip = 0 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (accountId) filter.accountId = accountId;

    const payments = await Payment.find(filter)
      .populate('accountId', 'name email company')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
};

// Get payment statistics (SUPERADMIN)
export const getPaymentStats = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can view payment statistics'
      });
    }

    const { startDate, endDate } = req.query;
    const filter = {
      status: 'completed'
    };

    if (startDate || endDate) {
      filter.completedAt = {};
      if (startDate) filter.completedAt.$gte = new Date(startDate);
      if (endDate) filter.completedAt.$lte = new Date(endDate);
    }

    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$currency',
          totalAmount: { $sum: '$amount' },
          totalRefunded: { $sum: '$refundAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics'
    });
  }
};
