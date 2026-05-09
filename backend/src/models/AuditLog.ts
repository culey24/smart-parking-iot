import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  action: string;
  targetResource?: string;
  details?: any; // Lưu log thì có thể quăng bất cứ Object nào vào cũng được
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  targetResource: { type: String },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);