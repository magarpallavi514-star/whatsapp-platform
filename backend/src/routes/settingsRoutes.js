import express from 'express';
import settingsController from '../controllers/settingsController.js';
import { authenticateAdmin } from '../middlewares/adminAuth.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Settings Routes
 * Phone number management requires admin auth
 * Other settings require regular auth
 */

// Phone Number Management (Admin Auth Required)
router.get('/phone-numbers', authenticateAdmin, settingsController.getPhoneNumbers);
router.post('/phone-numbers', authenticateAdmin, settingsController.addPhoneNumber);
router.put('/phone-numbers/:id', authenticateAdmin, settingsController.updatePhoneNumber);
router.delete('/phone-numbers/:id', authenticateAdmin, settingsController.deletePhoneNumber);
router.post('/phone-numbers/:id/test', authenticateAdmin, settingsController.testPhoneNumber);

// Profile Management (Regular Auth)
router.get('/profile', authenticate, settingsController.getProfile);
router.put('/profile', authenticate, settingsController.updateProfile);

// API Keys Management (Regular Auth)
router.get('/api-keys', authenticate, settingsController.getApiKeys);
router.post('/api-keys', authenticate, settingsController.generateApiKey);
router.delete('/api-keys/:id', authenticate, settingsController.deleteApiKey);

// Security (Regular Auth)
router.post('/change-password', authenticate, settingsController.changePassword);

export default router;
