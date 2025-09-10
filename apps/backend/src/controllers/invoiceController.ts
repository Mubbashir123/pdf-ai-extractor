import { Request, Response } from 'express';
import { put, head, del } from '@vercel/blob';
import { extractDataWithAI } from '../services/aiExtractor';
import { InvoiceModel } from '../models/Invoice';

// POST /upload
export const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  try {
    const { originalname, buffer } = req.file;
    const uniqueFileName = `${Date.now()}-${originalname}`;
    const blob = await put(uniqueFileName, buffer, {
      access: 'public',
      allowOverwrite:true
    });
    res.status(201).json({ fileId: blob.pathname, fileName: originalname });
  } catch (error: any) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

// POST /extract
export const extractData = async (req: Request, res: Response) => {
  const { fileId } = req.body;
  if (!fileId) {
    return res.status(400).json({ message: 'fileId is required.' });
  }
  try {
    const { url } = await head(fileId);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file. Status: ${response.status}`);
    }
    const fileBuffer = Buffer.from(await response.arrayBuffer());
    const extractedData = await extractDataWithAI(fileBuffer);
    res.status(200).json(extractedData);
  } catch (error: any) {
    console.error("ERROR DURING EXTRACTION:", error); 
    res.status(500).json({ message: 'Data extraction failed', error: error.message });
  }
};

// POST /invoices
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const newInvoice = new InvoiceModel(req.body);
    const savedInvoice = await newInvoice.save();
    console.log(`Invoice saved successfully with ID: ${savedInvoice._id}`);
    res.status(201).json(savedInvoice);
  } catch (error: any) {
    console.error("Failed to save invoice:", error);
    res.status(500).json({ message: 'Failed to save invoice', error: error.message });
  }
};

// GET /invoices
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    let filter = {};

    if (query) {
      filter = {
        $or: [
          { 'vendor.name': { $regex: query, $options: 'i' } },
          { 'invoice.number': { $regex: query, $options: 'i' } },
        ],
      };
    }
    
    const invoices = await InvoiceModel.find(filter).sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: error.message });
  }
};

// GET /invoices/:id
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch invoice', error: error.message });
  }
};

// PUT /invoices/:id
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json(updatedInvoice);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update invoice', error: error.message });
  }
};

// DELETE /invoices/:id
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const deletedInvoice = await InvoiceModel.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res.status(4404).json({ message: 'Invoice not found' });
    }
    // To enable file deletion from Blob storage
    // await del(deletedInvoice.fileId); 
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete invoice', error: error.message });
  }
};