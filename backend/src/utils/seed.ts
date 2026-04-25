import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Zone } from '../models/Zone';
import { PricingPolicy } from '../models/PricingPolicy';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-parking';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Zone.deleteMany({});
    await PricingPolicy.deleteMany({});

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
    await User.insertMany(users);

    // Seed Zones
    const zones = [
      { zoneId: 'Z1', zoneName: 'Khu A - Xe Máy', capacity: 500, currentUsage: 0 },
      { zoneId: 'Z2', zoneName: 'Khu B - Ô Tô', capacity: 100, currentUsage: 0 }
    ];
    await Zone.insertMany(zones);

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
    await PricingPolicy.insertMany(pricing);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
