import express from 'express';
import {
  createBroadcast,
  getBroadcasts,
  getBroadcastById,
  updateBroadcast,
  startBroadcast,
  cancelBroadcast,
  getBroadcastStats
} from '../controllers/broadcastController.js';

const router = express.Router();

// Broadcast routes
router.post('/:accountId/:phoneNumberId/broadcasts', createBroadcast);
router.get('/:accountId/:phoneNumberId/broadcasts', getBroadcasts);
router.get('/:accountId/broadcasts/:broadcastId', getBroadcastById);
router.put('/:accountId/broadcasts/:broadcastId', updateBroadcast);
router.post('/:accountId/:phoneNumberId/broadcasts/:broadcastId/start', startBroadcast);
router.post('/:accountId/broadcasts/:broadcastId/cancel', cancelBroadcast);
router.get('/:accountId/broadcasts/:broadcastId/stats', getBroadcastStats);

export default router;
