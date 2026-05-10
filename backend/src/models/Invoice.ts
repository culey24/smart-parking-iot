import { Schema, model } from 'mongoose';

export interface IInvoice {
  invoiceId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  invoiceId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' }
}, { timestamps: true });

export const Invoice = model<IInvoice>('Invoice', InvoiceSchema);
