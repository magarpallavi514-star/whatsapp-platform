import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes
router.use(authMiddleware);

// User subscription routes
router.get('/my-subscription', subscriptionController.getMySubscription);
router.post('/create', subscriptionController.createSubscription);
router.post('/change-plan', subscriptionController.changePlan);
router.post('/cancel', subscriptionController.cancelSubscription);
router.post('/pause', subscriptionController.pauseSubscription);
router.post('/resume', subscriptionController.resumeSubscription);

// Superadmin routes
router.get('/', subscriptionController.getAllSubscriptions);

export default router;
