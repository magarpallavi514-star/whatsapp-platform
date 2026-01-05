import express from 'express';
import settingsController from '../controllers/settingsController.js';

const router = express.Router();

/**
 * Settings Routes - Phone Number Management
 * All routes require authentication
 */

router.get('/phone-numbers', settingsController.getPhoneNumbers);
router.post('/phone-numbers', settingsController.addPhoneNumber);
router.put('/phone-numbers/:id', settingsController.updatePhoneNumber);
router.delete('/phone-numbers/:id', settingsController.deletePhoneNumber);
router.post('/phone-numbers/:id/test', settingsController.testPhoneNumber);

export default router;
