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
// Simpler routes (accountId from JWT middleware)
router.get('/', getBroadcasts);
router.post('/', createBroadcast);
router.post('/:broadcastId/start', startBroadcast);
router.post('/:broadcastId/cancel', cancelBroadcast);
router.get('/:broadcastId/stats', getBroadcastStats);

// Parameterized routes (with explicit phoneNumberId)
router.post('/:accountId/:phoneNumberId/broadcasts', createBroadcast);
router.get('/:accountId/:phoneNumberId/broadcasts', getBroadcasts);
router.get('/:accountId/broadcasts/:broadcastId', getBroadcastById);
router.put('/:accountId/broadcasts/:broadcastId', updateBroadcast);
router.post('/:accountId/:phoneNumberId/broadcasts/:broadcastId/start', startBroadcast);
router.post('/:accountId/broadcasts/:broadcastId/cancel', cancelBroadcast);
router.get('/:accountId/broadcasts/:broadcastId/stats', getBroadcastStats);

export default router;
