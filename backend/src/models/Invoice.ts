import { Schema, model, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoiceId: string;
  amount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
  issueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  invoiceId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' },
  issueDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const Invoice = model<IInvoice>('Invoice', InvoiceSchema);
