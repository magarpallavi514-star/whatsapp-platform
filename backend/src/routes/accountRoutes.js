/**
 * Self-Service Account Routes
 * Endpoints for account owners to manage their own account
 */

import express from 'express';
import {
  getMyAccount,
  regenerateMyApiKey,
  generateIntegrationToken,
  getIntegrationToken,
  revokeIntegrationToken
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

/**
 * @route   POST /api/account/integration-token
 * @desc    Generate integration token for external apps (Enromatics, etc.)
 * @access  Authenticated account
 */
router.post('/integration-token', generateIntegrationToken);

/**
 * @route   GET /api/account/integration-token
 * @desc    Get integration token info (prefix, created date, last used)
 * @access  Authenticated account
 */
router.get('/integration-token', getIntegrationToken);

/**
 * @route   DELETE /api/account/integration-token
 * @desc    Revoke integration token
 * @access  Authenticated account
 */
router.delete('/integration-token', revokeIntegrationToken);

export default router;
