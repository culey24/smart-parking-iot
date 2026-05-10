import { AuthService } from '../../src/services/AuthService';
import { User } from '../../src/models/User';
import jwt from 'jsonwebtoken';

jest.mock('../../src/models/User');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user if user exists', async () => {
      const mockUser = {
        userId: 'U1',
        schoolCardId: 100001,
        role: 'ADMIN',
        fullName: 'Admin User',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await AuthService.login('100001', 'password');

      expect(result.token).toBe('mock_token');
      expect(result.user).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ schoolCardId: 100001 });
    });

    it('should throw error if user does not exist', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.login('100001', 'password')).rejects.toThrow('User not found');
    });
  });
});
