import mongoose from 'mongoose';
import { User } from '../models/User';

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/smart-parking?authSource=admin';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User model', () => {
  describe('password hashing', () => {
    it('should hash password on save', async () => {
      const user = new User({
        userId: 'TEST_1',
        schoolCardId: 999999,
        fullName: 'Test User',
        role: 'USER',
        email: 'test@example.com',
        password: 'plaintext123',
      });

      await user.save();

      expect(user.password).not.toBe('plaintext123');
      expect(user.password).toMatch(/^\$2[aby]?\$\d{1,2}\$/);
    });

    it('should not re-hash password if not modified', async () => {
      const user = new User({
        userId: 'TEST_2',
        schoolCardId: 999998,
        fullName: 'Test User 2',
        role: 'USER',
        email: 'test2@example.com',
        password: 'mypassword',
      });

      await user.save();
      const hashAfterSave = user.password;

      user.fullName = 'Updated Name';
      await user.save();

      expect(user.password).toBe(hashAfterSave);
    });

    it('should comparePassword return true for correct password', async () => {
      const user = new User({
        userId: 'TEST_3',
        schoolCardId: 999997,
        fullName: 'Test User 3',
        role: 'USER',
        email: 'test3@example.com',
        password: 'correctPassword',
      });

      await user.save();
      const isValid = await user.comparePassword('correctPassword');

      expect(isValid).toBe(true);
    });

    it('should comparePassword return false for wrong password', async () => {
      const user = new User({
        userId: 'TEST_4',
        schoolCardId: 999996,
        fullName: 'Test User 4',
        role: 'USER',
        email: 'test4@example.com',
        password: 'correctPassword',
      });

      await user.save();
      const isValid = await user.comparePassword('wrongPassword');

      expect(isValid).toBe(false);
    });
  });

  describe('schema validation', () => {
    it('should require password field', async () => {
      const user = new User({
        userId: 'TEST_5',
        schoolCardId: 999995,
        fullName: 'Test User 5',
        role: 'USER',
        email: 'test5@example.com',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique schoolCardId', async () => {
      await User.create({
        userId: 'TEST_6',
        schoolCardId: 999994,
        fullName: 'Test User 6',
        role: 'USER',
        email: 'test6@example.com',
        password: 'pass',
      });

      await expect(User.create({
        userId: 'TEST_7',
        schoolCardId: 999994,
        fullName: 'Test User 7',
        role: 'USER',
        email: 'test7@example.com',
        password: 'pass',
      })).rejects.toThrow();
    });
  });
});