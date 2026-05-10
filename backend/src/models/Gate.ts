// import { Schema, model } from 'mongoose';

// const GateSchema = new Schema({
//   gateId: { type: String, required: true, unique: true },
//   gateName: { type: String, required: true },
//   gateType: { type: String, enum: ['IN', 'OUT'], required: true },
//   location: { type: String },
// }, { timestamps: true });

// export const Gate = model('Gate', GateSchema);

import { Schema, model } from 'mongoose';

const GateSchema = new Schema({
  gateId: { type: String, required: true, unique: true },
  gateName: { type: String, required: true },
  type: { type: String, enum: ['ENTRY', 'EXIT'], required: true }, // Đổi thành ENTRY/EXIT theo thiết kế
  ipAddress: { type: String }, // Đổi từ location sang ipAddress
  status: { type: String, enum: ['ONLINE', 'OFFLINE'], default: 'ONLINE' }, // Thêm trạng thái hoạt động
}, { timestamps: true });

export const Gate = model('Gate', GateSchema);