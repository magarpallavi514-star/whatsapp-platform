import express from 'express';
import multer from 'multer';
import messageController from '../controllers/messageController.js';
import { resolvePhoneNumber } from '../middlewares/phoneNumberHelper.js';

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
 * Note: All routes use resolvePhoneNumber middleware to auto-detect phone number from API key
 */

// Send messages (phoneNumberId is optional - will auto-detect from account)
router.post('/send', resolvePhoneNumber, messageController.sendTextMessage);
router.post('/send-template', resolvePhoneNumber, messageController.sendTemplateMessage);
router.post('/send-media', upload.single('file'), resolvePhoneNumber, messageController.sendMediaMessage);

// Get messages
router.get('/', messageController.getMessages);
router.get('/:id', messageController.getMessage);

export default router;
