import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  schoolCardId: { type: Number, unique: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'OPERATOR', 'USER', 'FINANCE_OFFICE'], default: 'USER' },
  email: { type: String, required: true, unique: true },
  userStatus: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

export const User = model('User', UserSchema);
