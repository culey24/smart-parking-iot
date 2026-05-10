import { Schema, model } from 'mongoose';

const ParkingSessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  sessionStatus: { type: String, enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE' },
  paymentStatus: { type: String, enum: ['UNPAID', 'PENDING', 'PAID'], default: 'UNPAID' },
  type: { type: String, enum: ['REGISTERED', 'TEMPORARY'], required: true },
  userRole: { type: String, enum: ['LEARNER', 'FACULTY', 'VISITOR', 'ADMIN', 'OPERATOR', 'IT_TEAM', 'FINANCE_OFFICE'], required: true },
  vehicleType: { type: String, required: true },
  subjectID: { type: String, required: true }, // userId or tempCardID
  deviceId: { type: String }, // Binds the session to a specific parking sensor
  plateNumber: { type: String, required: true },
  fee: { type: Number, default: 0 },
  invoiceId: { type: String },
}, { timestamps: true });

export const ParkingSession = model('ParkingSession', ParkingSessionSchema);
