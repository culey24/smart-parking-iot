"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server"); // New import
const User_1 = require("../src/models/User");
const Zone_1 = require("../src/models/Zone");
const ParkingSession_1 = require("../src/models/ParkingSession");
describe('Task 1: Core Database Models Validation', () => {
    let mongoServer;
    beforeAll(async () => {
        // Starts a temporary database in your RAM
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose_1.default.connect(uri);
        // ADD THIS LINE: It waits for the 'unique' rules to be ready in the DB
        await User_1.User.init();
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await mongoServer.stop(); // Shuts down the temporary database
    });
    afterEach(async () => {
        await User_1.User.deleteMany({});
        await Zone_1.Zone.deleteMany({});
        await ParkingSession_1.ParkingSession.deleteMany({});
    });
    /**
     * TEST: User Model Validation
     * Requirement: Test if creating a duplicate userId throws an error.
     */
    describe('User Model', () => {
        it('should throw an error for duplicate userId', async () => {
            await User_1.User.create({
                userId: 'SV001',
                fullName: 'Nguyen Van A',
                email: 'a@hcmut.edu.vn'
            });
            const duplicateUser = new User_1.User({
                userId: 'SV001',
                fullName: 'Nguyen Van B',
                email: 'b@hcmut.edu.vn'
            });
            let err;
            try {
                await duplicateUser.save();
            }
            catch (error) {
                err = error;
            }
            // MongoDB error code 11000 is for unique constraint violations
            expect(err).toBeDefined();
            expect(err.code).toBe(11000);
        });
        it('should fail if email is missing', async () => {
            const user = new User_1.User({ userId: 'SV002', fullName: 'No Email' });
            let err;
            try {
                await user.save();
            }
            catch (error) {
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
            const validZone = new Zone_1.Zone({
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
            const session = new ParkingSession_1.ParkingSession({
                sessionId: 'SESS-001',
                type: 'TEMPORARY',
                vehicleType: 'MOTORBIKE',
                subjectId: 'GUEST-1',
                plateNumber: '59-P1'
            });
            const savedSession = await session.save();
            expect(savedSession.sessionStatus).toBe('ACTIVE');
        });
    });
});
