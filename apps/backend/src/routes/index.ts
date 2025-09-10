import { Router } from 'express';
import multer from 'multer';
import * as invoiceController from '../controllers/invoiceController';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } 
});

router.post('/upload', upload.single('file'), invoiceController.uploadFile);
router.post('/extract', invoiceController.extractData); 
router.post('/invoices', invoiceController.createInvoice); 
router.get('/invoices',invoiceController.getInvoices);
router.get('/invoices/:id',invoiceController.getInvoiceById);
router.put('/invoices/:id',invoiceController.updateInvoice);
router.delete('/invoices/:id',invoiceController.deleteInvoice);
export default router;