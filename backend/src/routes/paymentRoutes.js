import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public webhook (no auth needed)
router.post('/webhook/confirm', paymentController.confirmPayment);

// Protected routes
router.use(authMiddleware);

// Payment routes
router.post('/initiate', paymentController.initiatePayment);
router.get('/my-payments', paymentController.getMyPayments);
router.get('/:paymentId', paymentController.getPaymentDetails);
router.post('/:paymentId/refund', paymentController.refundPayment);

// Superadmin routes
router.get('/', paymentController.getAllPayments);
router.get('/stats/overview', paymentController.getPaymentStats);

export default router;
