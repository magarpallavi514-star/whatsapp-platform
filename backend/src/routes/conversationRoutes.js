import express from 'express';
import conversationController from '../controllers/conversationController.js';

const router = express.Router();

/**
 * Conversation Routes
 * Handles inbox conversations
 */

// Get conversations
router.get('/', conversationController.getConversations);
router.get('/:conversationId/messages', conversationController.getConversationMessages);

// Reply to conversation
router.post('/:conversationId/reply', conversationController.replyToConversation);

// Update conversation
router.patch('/:conversationId/read', conversationController.markAsRead);
router.patch('/:conversationId/status', conversationController.updateStatus);

export default router;
