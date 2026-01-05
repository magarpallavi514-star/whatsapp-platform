import express from 'express';
import templateController from '../controllers/templateController.js';

const router = express.Router();

/**
 * Template Routes
 * All routes require authentication
 */

router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplate);
router.post('/', templateController.createTemplate);
router.post('/sync', templateController.syncTemplates);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

export default router;
