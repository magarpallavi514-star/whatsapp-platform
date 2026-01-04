import express from 'express';
import contactController from '../controllers/contactController.js';

const router = express.Router();

/**
 * Contact Routes
 * Handles contact management
 */

// CRUD operations
router.get('/', contactController.getContacts);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

// Bulk operations
router.post('/import', contactController.importContacts);

export default router;
