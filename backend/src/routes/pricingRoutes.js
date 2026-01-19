import express from 'express';
import * as pricingController from '../controllers/pricingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/plans/public', pricingController.getPublicPricingPlans);
router.get('/plans/public/:planId', pricingController.getPricingPlanDetails);

// Protected routes
router.use(authMiddleware);

// Superadmin routes
router.post('/plans', pricingController.createPricingPlan);
router.get('/plans', pricingController.getAllPricingPlans);
router.put('/plans/:planId', pricingController.updatePricingPlan);
router.delete('/plans/:planId', pricingController.deletePricingPlan);

// Feature management
router.post('/plans/:planId/features', pricingController.addFeatureToPlan);
router.delete('/plans/:planId/features/:featureId', pricingController.removeFeatureFromPlan);

export default router;
