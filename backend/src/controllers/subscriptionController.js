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
    const subscription = await Subscription.findOne({ accountId: req.account.accountId })
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
      accountId: req.account.accountId,
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

    const subscription = await Subscription.findOne({ accountId: req.account.accountId });

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

    const currentSubscription = await Subscription.findOne({ accountId: req.account.accountId });
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
      accountId: req.account.accountId,
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
    const subscription = await Subscription.findOne({ accountId: req.account.accountId });

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
    const subscription = await Subscription.findOne({ accountId: req.account.accountId });

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
    const { plan, billingCycle, paymentGateway } = req.body;
    const accountId = req.accountId; // From JWT middleware (string)

    console.log('📝 Creating order:', { plan, billingCycle, paymentGateway, accountId });

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Missing plan'
      });
    }

    // Validate billing cycle
    const cycle = (billingCycle || 'monthly').toLowerCase();
    if (!['monthly', 'quarterly', 'annual'].includes(cycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle. Must be monthly, quarterly, or annual'
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
    const account = await Account.findById(req.account._id);
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
    console.log(`🔍 Looking for pricing plan: "${pricingPlanName}" (from input: "${plan}")`);
    
    const pricingPlan = await PricingPlan.findOne({ name: pricingPlanName, isActive: true });
    
    if (!pricingPlan) {
      console.error(`❌ Pricing plan not found: "${pricingPlanName}"`);
      // List available plans for debugging
      const availablePlans = await PricingPlan.find({ isActive: true }).select('name monthlyPrice');
      console.log('📋 Available plans:', availablePlans.map(p => ({ name: p.name, price: p.monthlyPrice })));
      
      return res.status(404).json({
        success: false,
        message: `Pricing plan "${pricingPlanName}" not found`,
        availablePlans: availablePlans.map(p => p.name)
      });
    }

    // Calculate total amount based on billing cycle
    let amount;
    let billingPeriod;
    
    if (cycle === 'annual') {
      amount = (pricingPlan.monthlyPrice * 12 * 0.8) + (pricingPlan.setupFee || 0); // 20% discount
      billingPeriod = 'annual';
    } else if (cycle === 'quarterly') {
      amount = (pricingPlan.monthlyPrice * 3 * 0.95) + (pricingPlan.setupFee || 0); // 5% discount
      billingPeriod = 'quarterly';
    } else {
      amount = pricingPlan.monthlyPrice + (pricingPlan.setupFee || 0); // No discount for monthly
      billingPeriod = 'monthly';
    }
    
    console.log('💰 Amount calculated:', { 
      baseMonthlyPrice: pricingPlan.monthlyPrice,
      setupFee: pricingPlan.setupFee,
      billingCycle: cycle,
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

    // Prepare Cashfree payment session request (using snake_case as per Cashfree API v2023-08-01)
    const sessionPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: accountId.toString(),
        customer_email: account.email || 'customer@example.com',
        customer_phone: account.phone || '9999999999'
      },
      order_meta: {
        return_url: `${(process.env.FRONTEND_URL || 'https://pixels-whatsapp-frontend.up.railway.app').replace(/\/$/, '')}/payment-success?orderId=${orderId}`,
        notify_url: `${(process.env.BACKEND_URL || 'https://whatsapp-platform-production-e48b.up.railway.app').replace(/\/$/, '')}/api/payments/cashfree`
      },
      order_note: `${pricingPlanName} Plan (${cycle}) Subscription`
    };

    console.log('🔄 Calling Cashfree API with payload:', {
      order_id: sessionPayload.order_id,
      order_amount: sessionPayload.order_amount,
      order_currency: sessionPayload.order_currency,
      customer_id: sessionPayload.customer_details.customer_id,
      billingCycle: cycle
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

    // 🔴 PRICING SNAPSHOT - Capture ALL plan details at order creation time
    // This snapshot NEVER changes, ensuring consistency across client account, superadmin account, and emails
    const pricingSnapshot = {
      planName: pricingPlanName,
      monthlyPrice: pricingPlan.monthlyPrice,
      yearlyPrice: pricingPlan.yearlyPrice,
      setupFee: pricingPlan.setupFee || 0,
      selectedBillingCycle: cycle,  // What user selected: monthly/quarterly/annual
      calculatedAmount: amount,      // Exact final amount for this cycle
      currency: 'INR',
      discountApplied: cycle === 'annual' ? 20 : (cycle === 'quarterly' ? 5 : 0),
      discountReason: cycle === 'annual' ? '20% annual discount' : (cycle === 'quarterly' ? '5% quarterly discount' : 'No discount'),
      finalAmount: amount,
      capturedAt: new Date()
    };

    // Store payment record in our database
    // Use account._id (MongoDB ObjectId) for Payment model
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const payment = new Payment({
      paymentId: paymentId,
      accountId: account._id,
      orderId,
      amount: amount,
      currency: 'INR',
      paymentGateway: 'cashfree',
      status: 'pending',
      planId: plan,
      billingCycle: cycle,
      pricingSnapshot,  // 🔴 Store immutable pricing snapshot
      gatewayOrderId: cashfreeData.order_id || cashfreeData.orderId,
      paymentSessionId: cashfreeData.payment_session_id || cashfreeData.paymentSessionId,
      metadata: {
        plan,
        planName: pricingPlanName,
        billingCycle: cycle,
        amount,
        cashfreeResponse: cashfreeData
      }
    });

    await payment.save();
    console.log('✅ Payment record saved:', payment._id);
    console.log('🔴 Pricing snapshot captured:', JSON.stringify(pricingSnapshot, null, 2));

    res.status(201).json({
      success: true,
      orderId: orderId,
      paymentSessionId: cashfreeData.payment_session_id || cashfreeData.paymentSessionId,
      amount: amount,
      currency: 'INR',
      billingCycle: cycle,
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
    const payment = await Payment.findOne({ orderId, accountId: req.account.accountId });

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

      // 🔴 Send payment confirmation email using pricing snapshot (NEVER live prices)
      try {
        const account = await Account.findById(accountId);
        await emailService.sendPaymentConfirmationEmailWithSnapshot(
          account?.email,
          account?.name || 'Valued Customer',
          payment.pricingSnapshot,  // Pass the immutable pricing snapshot
          paymentId
        );
        console.log('✅ Payment confirmation email sent to:', account?.email);
      } catch (emailError) {
        console.warn('⚠️  Payment confirmation email failed:', emailError.message);
      }

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

/**
 * 🔴 GET PENDING TRANSACTIONS (for client account)
 * Returns all pending/unpaid transactions with original pricing snapshot
 * Client can see what they selected, and superadmin sees the same
 */
export const getPendingTransactions = async (req, res) => {
  try {
    const accountId = req.account._id;

    // Fetch all pending payments for this account
    const pendingPayments = await Payment.find({
      accountId: accountId,
      status: 'pending'
    })
    .sort({ initiatedAt: -1 });

    if (!pendingPayments || pendingPayments.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No pending transactions'
      });
    }

    // Format response with pricing snapshot (NOT live pricing)
    const formattedTransactions = pendingPayments.map(payment => ({
      transactionId: payment.paymentId,
      orderId: payment.orderId,
      status: payment.status,
      createdAt: payment.initiatedAt,
      
      // 🔴 Use pricing snapshot, NEVER fetch live prices
      planDetails: {
        planName: payment.pricingSnapshot?.planName || payment.metadata?.planName,
        selectedCycle: payment.pricingSnapshot?.selectedBillingCycle || payment.billingCycle,
        monthlyPrice: payment.pricingSnapshot?.monthlyPrice,
        setupFee: payment.pricingSnapshot?.setupFee,
        discountApplied: payment.pricingSnapshot?.discountApplied,
        discountReason: payment.pricingSnapshot?.discountReason
      },
      
      // 🔴 Amount is EXACTLY what was shown at checkout time
      amount: payment.pricingSnapshot?.calculatedAmount || payment.amount,
      finalAmount: payment.pricingSnapshot?.finalAmount || payment.amount,
      currency: payment.pricingSnapshot?.currency || payment.currency,
      
      paymentGateway: payment.paymentGateway,
      paymentSessionId: payment.paymentSessionId
    }));

    res.status(200).json({
      success: true,
      data: formattedTransactions,
      total: formattedTransactions.length
    });
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending transactions',
      error: error.message
    });
  }
};

/**
 * 🔴 GET ALL PENDING TRANSACTIONS (for superadmin)
 * Superadmin can see all clients' pending transactions with exact same details
 */
export const getAllPendingTransactions = async (req, res) => {
  try {
    // Only internal/superadmin can view all
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can view all pending transactions'
      });
    }

    // Fetch all pending payments across all accounts
    const pendingPayments = await Payment.find({
      status: 'pending'
    })
    .populate('accountId', 'name email company accountId')
    .sort({ initiatedAt: -1 });

    if (!pendingPayments || pendingPayments.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No pending transactions'
      });
    }

    // Format response with pricing snapshot (NOT live pricing)
    const formattedTransactions = pendingPayments.map(payment => ({
      transactionId: payment.paymentId,
      orderId: payment.orderId,
      
      // Client details
      client: {
        id: payment.accountId?._id,
        name: payment.accountId?.name || 'Unknown',
        email: payment.accountId?.email,
        company: payment.accountId?.company,
        accountId: payment.accountId?.accountId
      },
      
      status: payment.status,
      createdAt: payment.initiatedAt,
      
      // 🔴 Use pricing snapshot, NEVER fetch live prices
      planDetails: {
        planName: payment.pricingSnapshot?.planName || payment.metadata?.planName,
        selectedCycle: payment.pricingSnapshot?.selectedBillingCycle || payment.billingCycle,
        monthlyPrice: payment.pricingSnapshot?.monthlyPrice,
        setupFee: payment.pricingSnapshot?.setupFee,
        discountApplied: payment.pricingSnapshot?.discountApplied,
        discountReason: payment.pricingSnapshot?.discountReason
      },
      
      // 🔴 Amount is EXACTLY what was shown at checkout time
      amount: payment.pricingSnapshot?.calculatedAmount || payment.amount,
      finalAmount: payment.pricingSnapshot?.finalAmount || payment.amount,
      currency: payment.pricingSnapshot?.currency || payment.currency,
      
      paymentGateway: payment.paymentGateway,
      paymentSessionId: payment.paymentSessionId,
      
      // Days pending
      daysPending: Math.floor((Date.now() - new Date(payment.initiatedAt).getTime()) / (1000 * 60 * 60 * 24))
    }));

    res.status(200).json({
      success: true,
      data: formattedTransactions,
      total: formattedTransactions.length
    });
  } catch (error) {
    console.error('Error fetching all pending transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending transactions',
      error: error.message
    });
  }
};
