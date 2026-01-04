/**
 * Self-Service Account Routes
 * Endpoints for account owners to manage their own account
 */

import express from 'express';
import {
  getMyAccount,
  regenerateMyApiKey
} from '../controllers/accountController.js';

const router = express.Router();

// ==========================================
// SELF-SERVICE ROUTES (requires account auth)
// ==========================================

/**
 * @route   GET /api/account/me
 * @desc    Get own account details
 * @access  Authenticated account
 */
router.get('/me', getMyAccount);

/**
 * @route   POST /api/account/api-key/regenerate
 * @desc    Regenerate own API key
 * @access  Authenticated account
 */
router.post('/api-key/regenerate', regenerateMyApiKey);

export default router;
