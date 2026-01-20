/**
 * Billing Routes - Subscription, Invoices, and Billing Management
 */

import express from 'express';
import * as billingController from '../controllers/billingController.js';
import { requireJWT } from '../middlewares/jwtAuth.js';

const router = express.Router();

/**
 * Subscription Management
 */

// Create subscription after payment
router.post('/subscriptions', requireJWT, billingController.createSubscription);

// Get user's subscriptions
router.get('/subscriptions', requireJWT, billingController.getMySubscriptions);

// Change/Upgrade/Downgrade plan
router.put('/subscriptions/:subscriptionId/change-plan', requireJWT, billingController.changePlan);

// Cancel subscription
router.post('/subscriptions/:subscriptionId/cancel', requireJWT, billingController.cancelSubscription);

/**
 * Invoices & Billing History
 */

// Get billing history
router.get('/invoices', requireJWT, billingController.getBillingHistory);

// Get specific invoice
router.get('/invoices/:invoiceId', requireJWT, billingController.getInvoice);

// Download invoice as PDF
router.get('/invoices/:invoiceId/download', requireJWT, (req, res) => {
  // TODO: Implement PDF generation and download
  res.status(501).json({
    success: false,
    message: 'PDF download feature coming soon'
  });
});

/**
 * Billing Dashboard
 */

// Get billing stats
router.get('/stats', requireJWT, billingController.getBillingStats);

export default router;
