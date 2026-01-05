import express from 'express';
import multer from 'multer';
import messageController from '../controllers/messageController.js';

const router = express.Router();

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB limit (WhatsApp requirement)
  }
});

/**
 * Message Routes
 * Handles message sending and retrieval
 */

// Send messages
router.post('/send', messageController.sendTextMessage);
router.post('/send-template', messageController.sendTemplateMessage);
router.post('/send-media', upload.single('file'), messageController.sendMediaMessage);

// Get messages
router.get('/', messageController.getMessages);
router.get('/:id', messageController.getMessage);

export default router;
