import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server'; // New import
import { User } from '../src/models/User';
import { Zone } from '../src/models/Zone';
import { ParkingSession } from '../src/models/ParkingSession';

describe('Task 1: Core Database Models Validation', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Starts a temporary database in your RAM
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // ADD THIS LINE: It waits for the 'unique' rules to be ready in the DB
    await User.init();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop(); // Shuts down the temporary database
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Zone.deleteMany({});
    await ParkingSession.deleteMany({});
  });

  /**
   * TEST: User Model Validation
   * Requirement: Test if creating a duplicate userId throws an error.
   */
  describe('User Model', () => {
    it('should throw an error for duplicate userId', async () => {
      await User.create({
        userId: 'SV001',
        fullName: 'Nguyen Van A',
        email: 'a@hcmut.edu.vn',
        password: 'password'
      });

      const duplicateUser = new User({
        userId: 'SV001',
        fullName: 'Nguyen Van B',
        email: 'b@hcmut.edu.vn',
        password: 'password'
      });

      let err: any;
      try {
        await duplicateUser.save();
      } catch (error) {
        err = error;
      }
      // MongoDB error code 11000 is for unique constraint violations
      // Mongoose may wrap it: err.code or err.errorResponse?.code
      expect(err).toBeDefined();
      const errorCode = err.code ?? err.errorResponse?.code;
      expect(errorCode).toBe(11000);
    });

    it('should fail if email is missing', async () => {
      const user = new User({ userId: 'SV002', fullName: 'No Email' });
      let err: any;
      try {
        await user.save();
      } catch (error) {
        err = error;
      }
      expect(err.errors.email).toBeDefined();
    });
  });

  /**
   * TEST: Zone Model Validation
   * Requirement: Check required fields like capacity.
   */
  describe('Zone Model', () => {
    it('should correctly save a valid Zone', async () => {
      const validZone = new Zone({
        zoneId: 'Z1',
        zoneName: 'Khu A',
        capacity: 100
      });
      const savedZone = await validZone.save();
      expect(savedZone.currentUsage).toBe(0); // Default value
    });
  });

  /**
   * TEST: ParkingSession Model
   * Requirement: Ensure sessionStatus defaults to ACTIVE.
   */
  describe('ParkingSession Model', () => {
    it('should default sessionStatus to ACTIVE', async () => {
      const session = new ParkingSession({
        sessionId: 'SESS-001',
        type: 'TEMPORARY',
        vehicleType: 'MOTORBIKE',
        subjectID: 'GUEST-1',
        plateNumber: '59-P1',
        userRole: 'VISITOR'
      });
      const savedSession = await session.save();
      expect(savedSession.sessionStatus).toBe('ACTIVE');
    });
  });
});