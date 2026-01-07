/**
 * Enromatics Integration Routes
 * Third-party integration for sending messages via integration tokens
 * 
 * Usage: 
 *   Authorization: Bearer wpi_int_xxxxx
 */

import express from 'express';
import { authenticateIntegration } from '../middlewares/integrationAuth.js';
import { sendMessageViaIntegration, getConversationsViaIntegration } from '../controllers/integrationsController.js';

const router = express.Router();

/**
 * @route   POST /api/integrations/send-message
 * @desc    Send WhatsApp message via integration token (Enromatics, etc.)
 * @access  Integration token required
 * @body    { recipientPhone, message, mediaUrl?, mediaType? }
 */
router.post('/send-message', authenticateIntegration, sendMessageViaIntegration);

/**
 * @route   GET /api/integrations/conversations
 * @desc    Get conversations for account (paginated)
 * @access  Integration token required
 * @query   { limit, offset }
 */
router.get('/conversations', authenticateIntegration, getConversationsViaIntegration);

export default router;
