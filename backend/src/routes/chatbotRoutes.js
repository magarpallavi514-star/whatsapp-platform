import express from 'express';
import { 
  getChatbots, 
  getChatbot,
  createChatbot,
  updateChatbot,
  toggleChatbot,
  deleteChatbot,
  getChatbotInteractions
} from '../controllers/chatbotController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all chatbots with stats
router.get('/', getChatbots);

// Get single chatbot
router.get('/:id', getChatbot);

// Get chatbot interaction history
router.get('/:id/interactions', getChatbotInteractions);

// Create new chatbot
router.post('/', createChatbot);

// Update chatbot
router.put('/:id', updateChatbot);

// Toggle chatbot active status
router.patch('/:id/toggle', toggleChatbot);

// Delete chatbot
router.delete('/:id', deleteChatbot);

export default router;
