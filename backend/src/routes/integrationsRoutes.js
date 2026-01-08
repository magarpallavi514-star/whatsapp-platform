/**
 * Enromatics Integration Routes
 * Third-party integration for all platform features
 * 
 * Usage: 
 *   Authorization: Bearer wpi_int_xxxxx
 * 
 * Features:
 *   - Conversations (chat, inbox)
 *   - Contacts (management)
 *   - Broadcast (bulk messages)
 *   - Account (settings, config, health)
 */

import express from 'express';
import { authenticateIntegration } from '../middlewares/integrationAuth.js';
import {
  // Conversations
  getConversationsViaIntegration,
  getConversationDetailsViaIntegration,
  getConversationMessagesViaIntegration,
  replyToConversationViaIntegration,
  
  // Messages
  sendMessageViaIntegration,
  
  // Contacts
  getContactsViaIntegration,
  getContactViaIntegration,
  createContactViaIntegration,
  updateContactViaIntegration,
  deleteContactViaIntegration,
  
  // Account/Settings
  getAccountConfigViaIntegration,
  healthCheckViaIntegration,
  
  // Broadcast
  sendBroadcastViaIntegration
} from '../controllers/integrationsController.js';

const router = express.Router();

// ========== CONVERSATIONS ==========

/**
 * @route   GET /api/integrations/conversations
 * @desc    Get all conversations (chat inbox)
 * @access  Integration token required
 * @query   { limit?, offset?, search? }
 */
router.get('/conversations', authenticateIntegration, getConversationsViaIntegration);

/**
 * @route   GET /api/integrations/conversations/:id
 * @desc    Get single conversation details
 * @access  Integration token required
 */
router.get('/conversations/:id', authenticateIntegration, getConversationDetailsViaIntegration);

/**
 * @route   GET /api/integrations/conversations/:id/messages
 * @desc    Get messages in a conversation
 * @access  Integration token required
 * @query   { limit?, offset? }
 */
router.get('/conversations/:id/messages', authenticateIntegration, getConversationMessagesViaIntegration);

/**
 * @route   POST /api/integrations/conversations/:id/reply
 * @desc    Reply to a conversation
 * @access  Integration token required
 * @body    { message, mediaUrl?, mediaType? }
 */
router.post('/conversations/:id/reply', authenticateIntegration, replyToConversationViaIntegration);

// ========== MESSAGES ==========

/**
 * @route   POST /api/integrations/send-message
 * @desc    Send WhatsApp message
 * @access  Integration token required
 * @body    { recipientPhone, message, mediaUrl?, mediaType? }
 */
router.post('/send-message', authenticateIntegration, sendMessageViaIntegration);

// ========== CONTACTS ==========

/**
 * @route   GET /api/integrations/contacts
 * @desc    Get all contacts
 * @access  Integration token required
 * @query   { limit?, offset?, search? }
 */
router.get('/contacts', authenticateIntegration, getContactsViaIntegration);

/**
 * @route   GET /api/integrations/contacts/:id
 * @desc    Get single contact
 * @access  Integration token required
 */
router.get('/contacts/:id', authenticateIntegration, getContactViaIntegration);

/**
 * @route   POST /api/integrations/contacts
 * @desc    Create new contact
 * @access  Integration token required
 * @body    { name, phone, email?, tags? }
 */
router.post('/contacts', authenticateIntegration, createContactViaIntegration);

/**
 * @route   PUT /api/integrations/contacts/:id
 * @desc    Update contact
 * @access  Integration token required
 * @body    { name?, phone?, email?, tags? }
 */
router.put('/contacts/:id', authenticateIntegration, updateContactViaIntegration);

/**
 * @route   DELETE /api/integrations/contacts/:id
 * @desc    Delete contact
 * @access  Integration token required
 */
router.delete('/contacts/:id', authenticateIntegration, deleteContactViaIntegration);

// ========== BROADCAST ==========

/**
 * @route   POST /api/integrations/broadcast
 * @desc    Send broadcast message to multiple contacts
 * @access  Integration token required
 * @body    { message, contactIds?, tags? }
 */
router.post('/broadcast', authenticateIntegration, sendBroadcastViaIntegration);

// ========== ACCOUNT & SETTINGS ==========

/**
 * @route   GET /api/integrations/account/config
 * @desc    Get account configuration
 * @access  Integration token required
 */
router.get('/account/config', authenticateIntegration, getAccountConfigViaIntegration);

/**
 * @route   GET /api/integrations/health
 * @desc    Health check endpoint
 * @access  Integration token required
 */
router.get('/health', authenticateIntegration, healthCheckViaIntegration);

export default router;
