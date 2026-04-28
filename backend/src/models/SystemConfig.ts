import { Schema, model, Document } from 'mongoose';

// 1. Khai báo Interface: Định nghĩa rõ ràng các kiểu dữ liệu cho TypeScript
export interface ISystemConfig extends Document {
  settingKey: string;
  settingValue: any; // Dùng any vì giá trị cấu hình có thể là chuỗi, số, mảng...
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Nhúng Interface vào Schema
const SystemConfigSchema = new Schema<ISystemConfig>({
  settingKey: { type: String, required: true, unique: true },
  settingValue: { type: Schema.Types.Mixed, required: true },
  description: { type: String },
}, { timestamps: true });

// 3. Export Model có gắn kèm Type
export const SystemConfig = model<ISystemConfig>('SystemConfig', SystemConfigSchema);