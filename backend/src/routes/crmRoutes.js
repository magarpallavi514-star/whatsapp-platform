import express from 'express';
import crmController from '../controllers/crmController.js';
import { verifyJWT } from '../middlewares/auth.js';

const router = express.Router();

/**
 * CRM Routes
 * All routes require JWT authentication (user logged in)
 */

// Dashboard & Overview
router.get('/dashboard', verifyJWT, crmController.getCRMDashboard);

// Contact Management
router.get('/contacts', verifyJWT, crmController.getCRMContacts);
router.post('/contacts', verifyJWT, crmController.createCRMContact);
router.put('/contacts/:id', verifyJWT, crmController.updateCRMContact);

// Conversation Management
router.get('/conversations', verifyJWT, crmController.getCRMConversations);
router.get('/conversation/:conversationId', verifyJWT, crmController.getCRMConversationDetail);

// Analytics
router.get('/analytics', verifyJWT, crmController.getCRMAnalytics);

export default router;
