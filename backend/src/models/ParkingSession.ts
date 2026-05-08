import { Schema, model } from 'mongoose';

const ParkingSessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  sessionStatus: { type: String, enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE' },
  paymentStatus: { type: String, enum: ['UNPAID', 'PENDING', 'PAID'], default: 'UNPAID' },
  type: { type: String, enum: ['REGISTERED', 'TEMPORARY'], required: true },
  vehicleType: { type: String, required: true },
  subjectId: { type: String, required: true }, // userId or cardID
  plateNumber: { type: String, required: true },
  fee: { type: Number, default: 0 },
  invoiceId: { type: String },
}, { timestamps: true });

export const ParkingSession = model('ParkingSession', ParkingSessionSchema);
