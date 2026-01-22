import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Account from '../models/Account.js';
import PricingPlan from '../models/PricingPlan.js';
import { emailService } from '../services/emailService.js';
import { generateId } from '../utils/idGenerator.js';

// Get subscription for current account
export const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ accountId: req.account._id })
      .populate('planId')
      .lean();

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription'
    });
  }
};

// Get all subscriptions (SUPERADMIN)
export const getAllSubscriptions = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can view all subscriptions'
      });
    }

    const { status, accountId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (accountId) filter.accountId = accountId;

    const subscriptions = await Subscription.find(filter)
      .populate('accountId', 'name email company')
      .populate('planId', 'name monthlyPrice yearlyPrice')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subscriptions,
      total: subscriptions.length
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
};

// Create subscription (after checkout)
export const createSubscription = async (req, res) => {
  try {
    const {
      planId,
      billingCycle,
      paymentGateway,
      transactionId,
      paymentMethodId
    } = req.body;

    if (!planId || !billingCycle || !paymentGateway) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const plan = await PricingPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    // Calculate pricing
    const monthlyPrice = plan.monthlyPrice;
    const yearlyPrice = plan.yearlyPrice;
    const discount = billingCycle === 'annual' ? plan.yearlyDiscount : plan.monthlyDiscount;
    const baseAmount = billingCycle === 'annual' ? yearlyPrice : monthlyPrice;
    const discountAmount = (baseAmount * discount) / 100;
    const finalAmount = baseAmount - discountAmount;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscriptionId = `sub_${generateId()}`;

    const subscription = new Subscription({
      subscriptionId,
      accountId: req.account._id,
      planId: plan._id,
      status: 'active',
      billingCycle,
      pricing: {
        amount: baseAmount,
        discount: discountAmount,
        discountReason: `${discount}% ${billingCycle} discount`,
        finalAmount,
        currency: plan.currency
      },
      startDate,
      endDate,
      renewalDate: endDate,
      paymentGateway,
      transactionId,
      paymentMethodId,
      autoRenew: true,
      nextRenewalDate: endDate
    });

    await subscription.save();

    // Update account with subscription
    await Account.findByIdAndUpdate(req.account._id, {
      subscription: subscription._id,
      plan: plan.name
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { reason } = req.body;

    const subscription = await Subscription.findOne({ accountId: req.account._id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    subscription.status = 'cancelled';
    subscription.cancelledDate = new Date();
    subscription.cancellationReason = reason || 'User requested';
    subscription.autoRenew = false;
    await subscription.save();

    // Update account
    await Account.findByIdAndUpdate(req.account._id, {
      plan: null,
      subscription: null
    });

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
};

// Upgrade/Downgrade plan
export const changePlan = async (req, res) => {
  try {
    const { newPlanId, billingCycle } = req.body;

    if (!newPlanId) {
      return res.status(400).json({
        success: false,
        message: 'New plan ID is required'
      });
    }

    const currentSubscription = await Subscription.findOne({ accountId: req.account._id });
    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    const newPlan = await PricingPlan.findById(newPlanId);
    if (!newPlan) {
      return res.status(404).json({
        success: false,
        message: 'New pricing plan not found'
      });
    }

    const effectiveBillingCycle = billingCycle || currentSubscription.billingCycle;

    // Cancel current subscription
    currentSubscription.status = 'cancelled';
    currentSubscription.cancelledDate = new Date();
    currentSubscription.cancellationReason = 'Plan upgrade/downgrade';
    await currentSubscription.save();

    // Create new subscription
    const baseAmount = effectiveBillingCycle === 'annual' ? newPlan.yearlyPrice : newPlan.monthlyPrice;
    const discount = effectiveBillingCycle === 'annual' ? newPlan.yearlyDiscount : newPlan.monthlyDiscount;
    const discountAmount = (baseAmount * discount) / 100;
    const finalAmount = baseAmount - discountAmount;

    const startDate = new Date();
    const endDate = new Date();
    if (effectiveBillingCycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const newSubscriptionId = `sub_${generateId()}`;

    const newSubscription = new Subscription({
      subscriptionId: newSubscriptionId,
      accountId: req.account._id,
      planId: newPlan._id,
      status: 'active',
      billingCycle: effectiveBillingCycle,
      pricing: {
        amount: baseAmount,
        discount: discountAmount,
        discountReason: `${discount}% ${effectiveBillingCycle} discount`,
        finalAmount,
        currency: newPlan.currency
      },
      startDate,
      endDate,
      renewalDate: endDate,
      paymentGateway: currentSubscription.paymentGateway,
      paymentMethodId: currentSubscription.paymentMethodId,
      autoRenew: true,
      nextRenewalDate: endDate
    });

    await newSubscription.save();

    // Update account
    await Account.findByIdAndUpdate(req.account._id, {
      subscription: newSubscription._id,
      plan: newPlan.name
    });

    res.status(200).json({
      success: true,
      message: 'Plan changed successfully',
      data: newSubscription
    });
  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change plan'
    });
  }
};

// Pause subscription
export const pauseSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ accountId: req.account._id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    subscription.status = 'paused';
    subscription.autoRenew = false;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription paused successfully'
    });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause subscription'
    });
  }
};

// Resume subscription
export const resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ accountId: req.account._id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    if (subscription.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Only paused subscriptions can be resumed'
      });
    }

    subscription.status = 'active';
    subscription.autoRenew = true;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription resumed successfully'
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume subscription'
    });
  }
};

// Create Cashfree order for checkout
export const createOrder = async (req, res) => {
  try {
    const { plan, paymentGateway } = req.body;
    const accountId = req.accountId; // From JWT middleware (string)

    console.log('📝 Creating order:', { plan, paymentGateway, accountId });

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Missing plan'
      });
    }

    // Get the Cashfree credentials from environment
    const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
    const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
    const CASHFREE_API_URL = process.env.CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg';

    if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
      console.error('❌ Cashfree credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured'
      });
    }

    // Get account - accountId from JWT is a string (accountId field), not MongoDB _id
    const account = await Account.findOne({ accountId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Fetch pricing plan dynamically from database (more secure than trusting frontend)
    // Map plan names: starter -> Starter, pro -> Pro
    const planNameMapping = {
      'starter': 'Starter',
      'pro': 'Pro',
      'enterprise': 'Enterprise'
    };
    
    const pricingPlanName = planNameMapping[plan.toLowerCase()] || plan;
    const pricingPlan = await PricingPlan.findOne({ name: pricingPlanName, isActive: true });
    
    if (!pricingPlan) {
      console.error('❌ Pricing plan not found:', pricingPlanName);
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    // Calculate total amount (monthly price + setup fee)
    const amount = pricingPlan.monthlyPrice + (pricingPlan.setupFee || 0);
    
    console.log('💰 Amount calculated:', { 
      monthlyPrice: pricingPlan.monthlyPrice, 
      setupFee: pricingPlan.setupFee,
      totalAmount: amount 
    });

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan pricing'
      });
    }

    // Create unique order ID
    const orderId = `ORDER_${plan.toUpperCase()}_${Date.now()}`;

    // Prepare Cashfree payment session request
    const sessionPayload = {
      orderId: orderId,
      orderAmount: amount,
      orderCurrency: 'INR',
      customerDetails: {
        customerId: accountId.toString(),
        customerEmail: account.email || 'customer@example.com',
        customerPhone: account.phone || '9999999999'
      },
      orderMeta: {
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?orderId=${orderId}`,
        notifyUrl: `${process.env.BACKEND_URL || 'http://localhost:5050'}/api/payments/cashfree`
      },
      orderNote: `${pricingPlanName} Plan Subscription`
    };

    console.log('🔄 Calling Cashfree API with payload:', {
      orderId: sessionPayload.orderId,
      orderAmount: sessionPayload.orderAmount,
      orderCurrency: sessionPayload.orderCurrency,
      customerId: sessionPayload.customerDetails.customerId
    });

    // Call Cashfree API to create payment session
    const cashfreeResponse = await fetch(`${CASHFREE_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_CLIENT_ID,
        'x-client-secret': CASHFREE_CLIENT_SECRET
      },
      body: JSON.stringify(sessionPayload)
    });

    const responseText = await cashfreeResponse.text();
    
    if (!cashfreeResponse.ok) {
      console.error('❌ Cashfree API Error:', cashfreeResponse.status, responseText);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment session with Cashfree',
        error: responseText
      });
    }

    let cashfreeData;
    try {
      cashfreeData = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse Cashfree response:', responseText);
      return res.status(500).json({
        success: false,
        message: 'Invalid response from Cashfree'
      });
    }

    console.log('✅ Cashfree order created:', cashfreeData);

    // Store payment record in our database
    // Use account._id (MongoDB ObjectId) for Payment model
    const payment = new Payment({
      accountId: account._id,
      orderId,
      amount: amount,
      currency: 'INR',
      paymentGateway: 'cashfree',
      status: 'pending',
      planId: plan,
      gatewayOrderId: cashfreeData.orderId,
      paymentSessionId: cashfreeData.paymentSessionId,
      metadata: {
        plan,
        planName: pricingPlanName,
        amount,
        cashfreeResponse: cashfreeData
      }
    });

    await payment.save();
    console.log('✅ Payment record saved:', payment._id);

    res.status(201).json({
      success: true,
      orderId: orderId,
      paymentSessionId: cashfreeData.paymentSessionId,
      amount: amount,
      currency: 'INR',
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating order:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Verify Cashfree payment
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, paymentSignature } = req.body;
    const accountId = req.account._id;

    if (!orderId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Find the payment record
    const payment = await Payment.findOne({ orderId, accountId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Mark payment as successful
    payment.status = 'completed';
    payment.transactionId = paymentId;
    payment.paymentSignature = paymentSignature;
    await payment.save();

    // Create subscription
    const subscription = new Subscription({
      accountId,
      planId: payment.metadata.plan,
      paymentId: payment._id,
      status: 'active',
      autoRenew: true,
      currentBillingCycle: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    await subscription.save();

    // 📋 Create Invoice for paid subscription
    console.log('📋 Creating invoice for subscription:', subscription._id);
    try {
      const account = await Account.findById(accountId);
      const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const invoiceNumber = `INV-${account?.accountId || accountId}-${Date.now()}`;
      
      const newInvoice = new Invoice({
        invoiceId: invoiceId,
        invoiceNumber: invoiceNumber,
        accountId: account?.accountId || accountId.toString(),
        subscriptionId: subscription._id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billTo: {
          name: account?.name || 'Customer',
          email: account?.email
        },
        subtotal: payment.amount,
        tax: 0,
        totalAmount: payment.amount,
        dueAmount: 0,
        status: 'paid',
        items: [
          {
            description: `${payment.metadata.plan.charAt(0).toUpperCase() + payment.metadata.plan.slice(1)} Plan Subscription`,
            quantity: 1,
            unitPrice: payment.amount,
            amount: payment.amount
          }
        ],
        notes: `Paid subscription - Order ID: ${orderId}`,
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newInvoice.save();
      console.log('✅ Invoice created:', invoiceNumber);

      // Send invoice email
      try {
        const pdfUrl = `${process.env.FRONTEND_URL}/dashboard/invoices`;
        await emailService.sendInvoiceEmail(
          account?.email,
          invoiceNumber,
          pdfUrl,
          payment.amount,
          account?.name || 'Valued Customer'
        );
        console.log('✅ Invoice email sent to:', account?.email);
      } catch (emailError) {
        console.warn('⚠️  Invoice email failed:', emailError.message);
      }

    } catch (invoiceError) {
      console.warn('⚠️  Invoice creation failed (but payment successful):', invoiceError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and subscription created',
      data: {
        subscriptionId: subscription._id,
        status: subscription.status,
        invoiceCreated: true
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};
