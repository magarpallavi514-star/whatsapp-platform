import express from 'express';
import * as invoiceController from '../controllers/invoiceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes
router.use(authMiddleware);

// User invoice routes
router.get('/my-invoices', invoiceController.getMyInvoices);
router.get('/:invoiceId', invoiceController.getInvoice);
router.post('/:invoiceId/send-email', invoiceController.sendInvoiceEmail);
router.post('/:invoiceId/record-payment', invoiceController.recordPaymentForInvoice);

// Superadmin routes
router.post('/create', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.put('/:invoiceId', invoiceController.updateInvoice);

export default router;
