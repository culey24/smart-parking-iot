import { Schema, model, Document, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export interface IUser extends Document {
  userId: string;
  schoolCardId?: number;
  fullName: string;
  role: 'ADMIN' | 'OPERATOR' | 'LEARNER' | 'FACULTY' | 'IT_TEAM' | 'FINANCE_OFFICE';
  email: string;
  userStatus: 'ACTIVE' | 'INACTIVE';
  password: string;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  schoolCardId: { type: String, unique: true },

  fullName: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'OPERATOR', 'LEARNER', 'FACULTY', 'IT_TEAM', 'FINANCE_OFFICE'], default: 'LEARNER' },
  email: { type: String, required: true, unique: true },
  userStatus: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  password: { type: String, required: true },
}, { timestamps: true });

UserSchema.pre('save', async function (this: HydratedDocument<IUser>) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

export const User = model<IUser>('User', UserSchema);