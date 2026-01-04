import express from 'express';
import statsController from '../controllers/statsController.js';

const router = express.Router();

/**
 * Stats Routes
 * Provides analytics and statistics
 */

router.get('/', statsController.getStats);
router.get('/daily', statsController.getDailyStats);

export default router;
