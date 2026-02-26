import { cashfreeService } from '../services/cashfreeService.js';
import { emailService } from '../services/emailService.js';
import { Invoice } from '../models/Invoice.js';
import { Subscription } from '../models/Subscription.js';
import { PricingPlan } from '../models/PricingPlan.js';
import { Account } from '../models/Account.js';
import { Organization } from '../models/Organization.js';
import { Payment } from '../models/Payment.js';

/**
 * @route   POST /api/payment/create-order
 * @desc    Create payment order for subscription
 * @access  Private (JWT Required)
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { planId, billingCycle, organizationId } = req.body;
    const accountId = req.user.accountId;

    console.log('💳 Creating payment order:', { planId, billingCycle, organizationId, accountId });

    // Validate input
    if (!planId || !billingCycle) {
      return res.status(400).json({ 
        success: false, 
        message: 'planId and billingCycle are required' 
      });
    }

    // Get plan details
    const plan = await PricingPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plan not found' 
      });
    }

    // Calculate amount
    const amount = billingCycle === 'annual' ? plan.yearlyPrice : plan.monthlyPrice;
    
    // Get organization details
    const org = await Organization.findById(organizationId);
    if (!org) {
      return res.status(404).json({ 
        success: false, 
        message: 'Organization not found' 
      });
    }

    // Get account (user) details
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found' 
      });
    }

    // Create unique order ID
    const orderId = `ORDER-${organizationId}-${Date.now()}`;
    
    // Create Cashfree order
    const orderData = {
      orderId: orderId,
      customerId: organizationId,
      email: account.email,
      phone: account.phoneNumber || '9999999999',
      amount: amount,
      description: `${plan.name} Plan (${billingCycle}) - ${org.name}`
    };

    const result = await cashfreeService.createOrder(orderData);
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        error: result.error || 'Failed to create payment order' 
      });
    }

    // Create invoice in database
    const invoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      accountId: accountId,
      organizationId: organizationId,
      planId: planId,
      amount: amount,
      status: 'pending',
      description: orderData.description,
      orderId: orderId,
      billingCycle: billingCycle,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    console.log('✅ Invoice created:', invoice._id);

    res.json({
      success: true,
      paymentSessionId: result.paymentSessionId,
      redirectUrl: result.redirectUrl,
      invoiceId: invoice._id,
      orderId: orderId,
      amount: amount,
      planName: plan.name
    });
  } catch (error) {
    console.error('❌ Payment creation failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
};

/**
 * @route   POST /api/payment/verify
 * @desc    Verify payment and activate subscription
 * @access  Private (JWT Required)
 */
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const accountId = req.user.accountId;

    console.log('🔍 Verifying payment for order:', orderId);

    // Get order status from Cashfree
    const orderStatus = await cashfreeService.getOrderStatus(orderId);

    if (!orderStatus.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to verify payment with payment gateway' 
      });
    }

    // Check if payment is completed
    if (orderStatus.status !== 'PAID') {
      return res.status(400).json({ 
        success: false, 
        message: `Payment not completed. Status: ${orderStatus.status}` 
      });
    }

    // Find invoice
    const invoice = await Invoice.findOne({ orderId: orderId });
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    // Update invoice status
    invoice.status = 'paid';
    invoice.paidAmount = orderStatus.amount;
    invoice.paymentDate = new Date();
    invoice.cashfreePaymentId = orderStatus.paymentId;
    await invoice.save();

    console.log('✅ Invoice marked as paid:', invoice._id);

    // Get plan details
    const plan = await PricingPlan.findById(invoice.planId);
    
    // Create or update subscription
    const renewalDate = new Date();
    if (invoice.billingCycle === 'annual') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const subscription = await Subscription.findOneAndUpdate(
      { organizationId: invoice.organizationId },
      {
        accountId: accountId,
        organizationId: invoice.organizationId,
        planId: invoice.planId,
        status: 'active',
        billingCycle: invoice.billingCycle,
        startDate: new Date(),
        renewalDate: renewalDate,
        pricing: {
          amount: orderStatus.amount,
          discount: 0,
          finalAmount: orderStatus.amount,
          currency: 'INR'
        }
      },
      { upsert: true, new: true }
    );

    console.log('✅ Subscription activated:', subscription._id);

    // Update organization with subscription
    await Organization.findByIdAndUpdate(invoice.organizationId, {
      subscriptionId: subscription._id,
      plan: plan.planId,
      status: 'active'
    });

    // Send payment confirmation email
    const account = await Account.findById(accountId);
    if (account) {
      await emailService.sendPaymentConfirmationEmail(
        account.email,
        orderId,
        orderStatus.amount,
        'success',
        plan.name
      );
    }

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscriptionId: subscription._id,
      invoiceId: invoice._id,
      planName: plan.name
    });
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
};

/**
 * @route   POST /api/payment/webhook/confirm
 * @desc    Handle Cashfree payment webhook
 * @access  Public (Webhook)
 */
export const handlePaymentWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const body = req.body;

    console.log('🔔 Webhook received from Cashfree');

    // Verify webhook signature
    const isValid = cashfreeService.verifyWebhookSignature(signature, body);
    if (!isValid) {
      console.warn('⚠️ Invalid webhook signature');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const { order_id, order_status, order_amount } = body;

    if (order_status === 'PAID') {
      console.log('💚 Payment received for order:', order_id);

      // Find invoice
      const invoice = await Invoice.findOne({ orderId: order_id });
      if (!invoice) {
        console.warn('Invoice not found for order:', order_id);
        return res.status(200).json({ success: true }); // Return 200 to acknowledge webhook
      }

      // Update invoice
      invoice.status = 'paid';
      invoice.paidAmount = order_amount;
      invoice.paymentDate = new Date();
      await invoice.save();

      // Update Payment record if exists
      await Payment.findOneAndUpdate(
        { orderId: order_id },
        { status: 'completed' }
      );

      // Create/update subscription
      const plan = await PricingPlan.findById(invoice.planId);
      const renewalDate = new Date();
      if (invoice.billingCycle === 'annual') {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      } else if (invoice.billingCycle === 'quarterly') {
        renewalDate.setMonth(renewalDate.getMonth() + 3);
      } else {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      }

      await Subscription.findOneAndUpdate(
        { organizationId: invoice.organizationId },
        {
          accountId: invoice.accountId,
          organizationId: invoice.organizationId,
          planId: invoice.planId,
          status: 'active',
          billingCycle: invoice.billingCycle,
          startDate: new Date(),
          renewalDate: renewalDate,
          pricing: {
            amount: order_amount,
            discount: 0,
            finalAmount: order_amount,
            currency: 'INR'
          }
        },
        { upsert: true, new: true }
      );

      // ✅ Update Account with nextBillingDate
      await Account.findByIdAndUpdate(
        invoice.accountId,
        {
          nextBillingDate: renewalDate,
          totalPayments: (await Account.findById(invoice.accountId))?.totalPayments || 0 + order_amount
        }
      );
      );

      // Send email
      const account = await Account.findById(invoice.accountId);
      if (account) {
        await emailService.sendPaymentConfirmationEmail(
          account.email,
          order_id,
          order_amount,
          'success'
        );
      }

      console.log('✅ Webhook processed successfully for order:', order_id);
    } else if (order_status === 'FAILED') {
      console.log('❌ Payment failed for order:', order_id);
      
      const invoice = await Invoice.findOne({ orderId: order_id });
      if (invoice) {
        invoice.status = 'failed';
        await invoice.save();

        // Update Payment record if exists
        await Payment.findOneAndUpdate(
          { orderId: order_id },
          { status: 'failed' }
        );

        const account = await Account.findById(invoice.accountId);
        if (account) {
          await emailService.sendPaymentConfirmationEmail(
            account.email,
            order_id,
            order_amount,
            'failed'
          );
        }
      }
    } else if (order_status === 'CANCELLED') {
      console.log('⛔ Payment cancelled for order:', order_id);
      
      const invoice = await Invoice.findOne({ orderId: order_id });
      if (invoice) {
        invoice.status = 'cancelled';
        await invoice.save();

        // Update Payment record if exists
        await Payment.findOneAndUpdate(
          { orderId: order_id },
          { status: 'cancelled' }
        );

        const account = await Account.findById(invoice.accountId);
        if (account) {
          await emailService.sendPaymentConfirmationEmail(
            account.email,
            order_id,
            order_amount,
            'cancelled'
          );
        }
      }
    }

    // Always return 200 to acknowledge webhook
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    // Return 200 anyway to acknowledge receipt
    res.status(200).json({ success: true });
  }
};

/**
 * @route   GET /api/payment/invoice/:orderId
 * @desc    Get invoice details
 * @access  Private (JWT Required)
 */
export const getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const accountId = req.user.accountId;

    const invoice = await Invoice.findOne({ orderId })
      .populate('planId', 'name monthlyPrice yearlyPrice')
      .populate('organizationId', 'name');

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    // Verify ownership
    if (invoice.accountId.toString() !== accountId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('❌ Invoice fetch failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
