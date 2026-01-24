import express from 'express';
import { requireJWT } from '../middlewares/jwtAuth.js';
import {
  getPendingUsers,
  sendPaymentReminder,
  sendReminderAllPending
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require JWT authentication
router.use(requireJWT);

/**
 * GET /api/admin/pending-users
 * List all accounts with pending payment (superadmin only)
 */
router.get('/pending-users', getPendingUsers);

/**
 * POST /api/admin/send-payment-reminder
 * Send payment reminder to a specific pending user (superadmin only)
 */
router.post('/send-payment-reminder', sendPaymentReminder);

/**
 * POST /api/admin/send-reminder-all-pending
 * Send payment reminders to all pending users (superadmin only)
 */
router.post('/send-reminder-all-pending', sendReminderAllPending);

export default router;
