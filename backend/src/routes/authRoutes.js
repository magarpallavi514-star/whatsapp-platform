import express from 'express';
import authController from '../controllers/authController.js';
import { requireSession } from '../middlewares/sessionAuth.js';

const router = express.Router();

/**
 * Auth Routes
 * NO API KEYS - Uses email/password + sessions
 */

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected route
router.get('/me', requireSession, authController.getCurrentUser);

export default router;
