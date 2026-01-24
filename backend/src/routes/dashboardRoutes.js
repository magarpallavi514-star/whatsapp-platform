import express from 'express';
import { requireJWT } from '../middlewares/jwtAuth.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics based on user role
 * @access  Private (JWT required)
 */
router.get('/stats', requireJWT, dashboardController.getDashboardStats);

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity for dashboard
 * @access  Private (JWT required)
 */
router.get('/activity', requireJWT, dashboardController.getDashboardActivity);

export default router;
