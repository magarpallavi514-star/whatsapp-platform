import express from 'express';
import authController from '../controllers/authController.js';
import { requireJWT } from '../middlewares/jwtAuth.js';

const router = express.Router();

/**
 * Auth Routes
 * Uses JWT (stateless) for authentication
 */

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected route - requires JWT
router.get('/me', requireJWT, authController.getCurrentUser);

export default router;
