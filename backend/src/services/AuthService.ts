import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export class AuthService {
  static async login(userId: string) {
    // Giả lập SSO login: Nếu userId tồn tại trong DB, cấp token.
    const user = await User.findOne({ userId });
    
    if (!user) {
      throw new Error('User not found');
    }

    const payload = {
      userId: user.userId,
      role: user.role,
      fullName: user.fullName
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    
    return { token, user };
  }
}
