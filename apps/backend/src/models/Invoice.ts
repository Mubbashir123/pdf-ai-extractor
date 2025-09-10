import { Schema, model, Document } from 'mongoose';
import { Invoice as InvoiceType } from '@repo/types';

const LineItemSchema = new Schema({
  description: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
}, { _id: false });

// 2. Main Invoice Schema
const InvoiceSchema = new Schema({
  fileId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  vendor: {
    name: { type: String, required: true },
    address: String,
    taxId: String,
  },
  invoice: {
    number: { type: String, required: true },
    date: { type: String, required: true },
    currency: String,
    subtotal: Number,
    taxPercent: Number,
    total: Number,
    poNumber: String,
    poDate: String,
    // array of items in Invoice
    lineItems: [LineItemSchema],
  },
}, { timestamps: true }); 

export const InvoiceModel = model<InvoiceType & Document>('Invoice', InvoiceSchema);