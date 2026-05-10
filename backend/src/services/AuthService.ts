import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export class AuthService {
  static async login(schoolCardId: string, password: string) {
    const cardId = parseInt(schoolCardId, 10);
    if (isNaN(cardId)) {
      throw new Error('Invalid card ID');
    }

    const user = await User.findOne({ schoolCardId: cardId });

    if (!user) {
      throw new Error('User not found');
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      throw new Error('Invalid password');
    }

    const payload = {
      userId: user.userId,
      schoolCardId: user.schoolCardId,
      role: user.role,
      fullName: user.fullName,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    return { token, user };
  }
}