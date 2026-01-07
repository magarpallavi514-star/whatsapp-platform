import express from 'express';
import settingsController from '../controllers/settingsController.js';

const router = express.Router();

/**
 * Settings Routes
 * Uses session auth (set in app.js) - NO API KEYS!
 * User must be logged in via /api/auth/login
 */

// Phone Number Management (Session Auth - from app.js)
router.get('/phone-numbers', settingsController.getPhoneNumbers);
router.post('/phone-numbers', settingsController.addPhoneNumber);
router.put('/phone-numbers/:id', settingsController.updatePhoneNumber);
router.delete('/phone-numbers/:id', settingsController.deletePhoneNumber);
router.post('/phone-numbers/:id/test', settingsController.testPhoneNumber);

// Profile Management
router.get('/profile', settingsController.getProfile);
router.put('/profile', settingsController.updateProfile);

// API Keys Management
router.get('/api-keys', settingsController.getApiKeys);
router.post('/api-keys', settingsController.generateApiKey);
router.delete('/api-keys/:id', settingsController.deleteApiKey);

// Security
router.post('/change-password', settingsController.changePassword);

export default router;
