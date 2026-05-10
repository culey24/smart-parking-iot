import { Schema, model, Document } from 'mongoose';

export interface IReconciliationRequest extends Document {
  sessionId: string;
  userId: string;
  userName: string;
  licensePlate: string;
  reportedAt: Date;
  description: string;
  status: 'pending' | 'confirmed' | 'refunded' | 'adjusted';
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReconciliationRequestSchema = new Schema<IReconciliationRequest>({
  sessionId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  licensePlate: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'refunded', 'adjusted'], default: 'pending' },
  note: { type: String }
}, { timestamps: true });

export const ReconciliationRequest = model<IReconciliationRequest>('ReconciliationRequest', ReconciliationRequestSchema);
