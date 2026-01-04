import express from 'express';
import messageController from '../controllers/messageController.js';

const router = express.Router();

/**
 * Message Routes
 * Handles message sending and retrieval
 */

// Send messages
router.post('/send', messageController.sendTextMessage);
router.post('/send-template', messageController.sendTemplateMessage);

// Get messages
router.get('/', messageController.getMessages);
router.get('/:id', messageController.getMessage);

export default router;
