"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
const Zone_1 = require("../models/Zone");
const PricingPolicy_1 = require("../models/PricingPolicy");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-parking';
const seedDatabase = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');
        // Clear existing data
        await User_1.User.deleteMany({});
        await Zone_1.Zone.deleteMany({});
        await PricingPolicy_1.PricingPolicy.deleteMany({});
        // Seed Users
        const users = [
            {
                userId: 'admin1',
                schoolCardId: 100001,
                fullName: 'Admin User',
                role: 'ADMIN',
                email: 'admin@hcmut.edu.vn'
            },
            {
                userId: 'student1',
                schoolCardId: 200001,
                fullName: 'Nguyen Van A',
                role: 'USER',
                email: 'student1@hcmut.edu.vn'
            }
        ];
        await User_1.User.insertMany(users);
        // Seed Zones
        const zones = [
            { zoneId: 'Z1', zoneName: 'Khu A - Xe Máy', capacity: 500, currentUsage: 0 },
            { zoneId: 'Z2', zoneName: 'Khu B - Ô Tô', capacity: 100, currentUsage: 0 }
        ];
        await Zone_1.Zone.insertMany(zones);
        // Seed Pricing Policy
        const pricing = [
            {
                vehicleType: 'MOTORBIKE',
                baseRate: 4000,
                hourlyRate: 1000,
                monthlyRate: 120000
            },
            {
                vehicleType: 'CAR',
                baseRate: 20000,
                hourlyRate: 5000,
                monthlyRate: 600000
            }
        ];
        await PricingPolicy_1.PricingPolicy.insertMany(pricing);
        console.log('Database seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};
seedDatabase();
