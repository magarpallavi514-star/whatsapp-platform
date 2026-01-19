import Invoice from '../models/Invoice.js';
import Subscription from '../models/Subscription.js';
import Account from '../models/Account.js';
import Payment from '../models/Payment.js';
import { generateId } from '../utils/idGenerator.js';

// Helper to generate invoice number
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

// Create invoice
export const createInvoice = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can create invoices'
      });
    }

    const {
      accountId,
      subscriptionId,
      billTo,
      lineItems,
      subtotal,
      taxRate,
      discountAmount,
      totalAmount,
      notes,
      paymentTerms
    } = req.body;

    if (!accountId || !subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'accountId and subscriptionId are required'
      });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const invoiceId = `inv_${generateId()}`;
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate tax
    const taxAmount = taxRate ? (subtotal * taxRate) / 100 : 0;
    const dueAmount = totalAmount - (subtotal - discountAmount + taxAmount);

    const invoice = new Invoice({
      invoiceId,
      invoiceNumber,
      accountId,
      subscriptionId,
      billTo: billTo || {
        name: account.name,
        email: account.email,
        company: account.company,
        phone: account.phone
      },
      lineItems: lineItems || [],
      subtotal,
      taxRate: taxRate || 0,
      taxAmount,
      discountAmount: discountAmount || 0,
      totalAmount,
      dueAmount,
      currency: subscription.pricing.currency,
      status: 'draft',
      notes,
      paymentTerms: paymentTerms || 'Net 30'
    });

    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice'
    });
  }
};

// Get invoice
export const getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findOne({ invoiceId })
      .populate('accountId', 'name email company phone')
      .populate('subscriptionId');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check authorization
    if (invoice.accountId._id.toString() !== req.account._id.toString() && req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice'
    });
  }
};

// Get my invoices
export const getMyInvoices = async (req, res) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;
    const filter = { accountId: req.account._id };

    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .sort({ invoiceDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Invoice.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
};

// Update invoice
export const updateInvoice = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can update invoices'
      });
    }

    const { invoiceId } = req.params;
    const updates = req.body;

    const invoice = await Invoice.findOneAndUpdate(
      { invoiceId },
      {
        ...updates,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice'
    });
  }
};

// Send invoice via email
export const sendInvoiceEmail = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { recipientEmail } = req.body;

    const invoice = await Invoice.findOne({ invoiceId });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check authorization
    if (invoice.accountId.toString() !== req.account._id.toString() && req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // TODO: Implement email service to send invoice
    // For now, just update the record
    invoice.emailSentAt = new Date();
    invoice.status = 'sent';
    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Invoice sent successfully'
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invoice'
    });
  }
};

// Record payment for invoice
export const recordPaymentForInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { amount, paymentMethod, transactionId } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount is required'
      });
    }

    const invoice = await Invoice.findOne({ invoiceId });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check authorization
    if (invoice.accountId.toString() !== req.account._id.toString() && req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    invoice.payments.push({
      paymentId: `pay_${generateId()}`,
      amount,
      date: new Date(),
      method: paymentMethod || 'unknown',
      transactionId,
      status: 'success'
    });

    invoice.paidAmount += amount;
    invoice.dueAmount = invoice.totalAmount - invoice.paidAmount;

    if (invoice.dueAmount <= 0) {
      invoice.status = 'paid';
      invoice.dueAmount = 0;
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment'
    });
  }
};

// Get all invoices (SUPERADMIN)
export const getAllInvoices = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can view all invoices'
      });
    }

    const { status, accountId, limit = 50, skip = 0 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (accountId) filter.accountId = accountId;

    const invoices = await Invoice.find(filter)
      .populate('accountId', 'name email company')
      .sort({ invoiceDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Invoice.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching all invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
};
