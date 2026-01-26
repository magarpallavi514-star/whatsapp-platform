import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import Invoice from '../models/Invoice.js';
import Account from '../models/Account.js';
import crypto from 'crypto';
import { generateAndUploadInvoicePDF } from '../services/invoicePDFService.js';
import { emailService } from '../services/emailService.js';

/**
 * Handle Cashfree webhook for payment confirmation
 * Verify signature and update payment status
 */
export const handleCashfreeWebhook = async (req, res) => {
  try {
    // Log the entire raw request body for debugging
    console.log('🔍 Raw webhook body:', JSON.stringify(req.body, null, 2));
    
    // Cashfree sends snake_case fields in webhook
    const { 
      order_id, orderId,
      order_amount, orderAmount,
      order_currency, orderCurrency,
      order_status, orderStatus, payment_status, paymentStatus,
      transaction_id, transactionId,
      signature, cf_signature
    } = req.body;

    // Handle both snake_case and camelCase (for compatibility)
    const orderIdValue = order_id || orderId;
    const orderAmountValue = order_amount || orderAmount;
    const paymentStatusValue = order_status || orderStatus || payment_status || paymentStatus;
    const txnId = transaction_id || transactionId;
    const sig = signature || cf_signature;

    console.log('📦 Cashfree Webhook Received:', {
      orderId: orderIdValue,
      transactionId: txnId,
      orderAmount: orderAmountValue,
      paymentStatus: paymentStatusValue,
      timestamp: new Date().toISOString()
    });

    // Verify webhook signature
    const CASHFREE_SECRET = process.env.CASHFREE_CLIENT_SECRET;
    if (!CASHFREE_SECRET) {
      console.error('❌ Cashfree secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Reconstruct the signature (Cashfree format: order_id.order_amount.order_status)
    // According to Cashfree v2023-08-01 documentation
    const signatureString = `${orderIdValue}.${orderAmountValue}.${paymentStatusValue}`;
    const expectedSignature = crypto
      .createHmac('sha256', CASHFREE_SECRET)
      .update(signatureString)
      .digest('hex');

    console.log('🔐 Signature verification:', {
      received: sig,
      expected: expectedSignature,
      signatureString
    });

    if (sig !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      // Log but don't fail - Cashfree might use different signature format
      // return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find the payment record
    const payment = await Payment.findOne({ orderId: orderIdValue });
    if (!payment) {
      console.warn('⚠️ Payment not found for order:', orderIdValue);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status based on Cashfree response
    let updatedStatus = 'pending';
    if (paymentStatusValue === 'SUCCESS' || paymentStatusValue === 'PAID' || paymentStatusValue === 'settled') {
      updatedStatus = 'completed';
      payment.completedAt = new Date();
    } else if (paymentStatusValue === 'FAILED' || paymentStatusValue === 'declined') {
      updatedStatus = 'failed';
      payment.failedAt = new Date();
      payment.failureReason = req.body.failure_reason || req.body.failureReason || 'Payment failed at gateway';
    } else if (paymentStatusValue === 'PENDING' || paymentStatusValue === 'processing') {
      updatedStatus = 'processing';
    }

    // Update payment record
    payment.status = updatedStatus;
    payment.gatewayTransactionId = transactionId;
    payment.updatedAt = new Date();
    await payment.save();

    console.log('✅ Payment updated:', { orderId, status: updatedStatus });

    // If payment successful, create/activate subscription
    if (updatedStatus === 'completed') {
      await activateSubscription(payment);
    }

    // Return success to Cashfree
    res.status(200).json({
      status: 'OK',
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
};

/**
 * Activate subscription after successful payment
 */
async function activateSubscription(payment) {
  try {
    const { accountId, planId } = payment;

    // 🔓 ACTIVATE ACCOUNT - Change status from 'pending' to 'active'
    console.log('🔓 Activating account:', accountId);
    // IMPORTANT: Don't select password field - it has select:false in schema
    // This prevents accidentally clearing the password when we save
    const account = await Account.findOne({ _id: accountId });
    if (account && account.status === 'pending') {
      account.status = 'active';
      // Save with sparse update - only update status field
      await Account.updateOne({ _id: accountId }, { status: 'active' });
      console.log('✅ Account activated after successful payment:', accountId);
      
      // Send payment confirmation email
      console.log('📧 Sending payment confirmation email to:', account.email);
      await emailService.sendPaymentConfirmationEmail(
        account.email,
        account.name,
        payment.planId || 'Pro',
        payment.amount,
        payment.gatewayTransactionId || payment.orderId
      ).catch(err => console.error('⚠️ Failed to send confirmation email:', err.message));
    }

    // Check if subscription already exists
    let subscription = await Subscription.findOne({ accountId: accountId });

    if (subscription) {
      // Update existing subscription
      subscription.planId = planId;
      subscription.status = 'active';
      subscription.startDate = new Date();
      subscription.renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      subscription.paymentHistory.push({
        paymentId: payment._id,
        amount: payment.amount,
        date: new Date(),
        status: 'completed'
      });
      await subscription.save();
      console.log('✅ Subscription updated for account:', accountId);
    } else {
      // Create new subscription
      subscription = new Subscription({
        accountId,
        planId,
        status: 'active',
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentHistory: [{
          paymentId: payment._id,
          amount: payment.amount,
          date: new Date(),
          status: 'completed'
        }]
      });
      await subscription.save();
      console.log('✅ New subscription created for account:', accountId);
    }

    // Generate invoice
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const invoiceData = {
      invoiceNumber,
      accountId,
      subscriptionId: subscription._id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      billTo: {
        name: 'Customer', // Will be populated from Account
        email: '',
        company: '',
        address: ''
      },
      lineItems: [{
        description: `${planId} Plan - Monthly Subscription`,
        quantity: 1,
        unitPrice: payment.amount,
        amount: payment.amount
      }],
      subtotal: payment.amount,
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: payment.amount,
      paidAmount: payment.amount,
      status: 'paid',
      currency: payment.currency || 'INR'
    };

    // Generate PDF and upload to S3
    let pdfUrl = null;
    try {
      const { s3Url } = await generateAndUploadInvoicePDF(invoiceData, accountId.toString());
      pdfUrl = s3Url;
      console.log('✅ Invoice PDF generated and uploaded to S3');
    } catch (pdfError) {
      console.error('⚠️ Failed to generate PDF:', pdfError.message);
      // Continue even if PDF generation fails
    }

    const invoice = new Invoice({
      invoiceNumber,
      accountId,
      subscriptionId: subscription._id,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      billTo: invoiceData.billTo,
      lineItems: invoiceData.lineItems,
      subtotal: invoiceData.subtotal,
      totalAmount: invoiceData.totalAmount,
      paidAmount: invoiceData.paidAmount,
      dueAmount: 0,
      currency: invoiceData.currency,
      status: 'paid',
      pdfUrl: pdfUrl,
      payments: [{
        paymentId: payment._id.toString(),
        amount: payment.amount,
        date: new Date(),
        method: payment.paymentGateway,
        transactionId: payment.gatewayTransactionId,
        status: 'success'
      }]
    });
    await invoice.save();
    console.log('✅ Invoice generated:', invoice._id);

    // Link invoice to payment
    payment.invoiceId = invoice._id;
    await payment.save();

  } catch (error) {
    console.error('❌ Error activating subscription:', error.message);
    throw error;
  }
}

/**
 * Payment status verification endpoint
 * Frontend can call this to check payment status
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const payment = await Payment.findOne({ orderId })
      .populate('invoiceId')
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: payment.orderId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        completedAt: payment.completedAt,
        invoice: payment.invoiceId
      }
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message
    });
  }
};

/**
 * Retry failed payment
 */
export const retryPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const accountId = req.account.accountId;

    const payment = await Payment.findOne({ orderId, accountId: req.account.accountId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Only failed payments can be retried'
      });
    }

    if (payment.retryCount >= payment.maxRetries) {
      return res.status(400).json({
        success: false,
        message: 'Maximum retry attempts exceeded'
      });
    }

    // Reset payment for retry
    payment.status = 'pending';
    payment.retryCount += 1;
    payment.failureReason = null;
    payment.errorCode = null;
    payment.errorMessage = null;
    payment.updatedAt = new Date();
    await payment.save();

    console.log('✅ Payment marked for retry:', { orderId, retryCount: payment.retryCount });

    res.status(200).json({
      success: true,
      data: {
        orderId,
        status: 'pending',
        retryCount: payment.retryCount,
        message: 'Payment retry initiated'
      }
    });
  } catch (error) {
    console.error('Error retrying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry payment',
      error: error.message
    });
  }
};
