import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { requireJWT } from '../middlewares/jwtAuth.js';

const router = express.Router();

/**
 * PROTECTED ROUTES - Requires JWT
 */

// User subscription routes
router.get('/my-subscription', requireJWT, subscriptionController.getMySubscription);
router.post('/create', requireJWT, subscriptionController.createSubscription);
router.post('/change-plan', requireJWT, subscriptionController.changePlan);
router.post('/cancel', requireJWT, subscriptionController.cancelSubscription);
router.post('/pause', requireJWT, subscriptionController.pauseSubscription);
router.post('/resume', requireJWT, subscriptionController.resumeSubscription);

// Superadmin routes
router.get('/', requireJWT, subscriptionController.getAllSubscriptions);

export default router;
