import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { Location } from '../models/Location';
import { ParkingSlot } from '../models/ParkingSlot';
import { IoTDevice } from '../models/IoTDevice';
import { InfrastructureAlert } from '../models/InfrastructureAlert';
import { Zone } from '../models/Zone';
import { ParkingSession } from '../models/ParkingSession';
import { User } from '../models/User';
import { PricingPolicy } from '../models/PricingPolicy';
import { TemporaryCard } from '../models/TemporaryCard';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/smart-parking?authSource=admin';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing
    await Location.deleteMany({});
    await ParkingSlot.deleteMany({});
    await IoTDevice.deleteMany({});
    await InfrastructureAlert.deleteMany({});
    await Zone.deleteMany({});
    await ParkingSession.deleteMany({});
    await User.deleteMany({});
    await PricingPolicy.deleteMany({});
    await TemporaryCard.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Create Pricing Policies
    await PricingPolicy.create([
      // LEARNER: Hourly
      { 
        userRole: 'LEARNER', vehicleType: 'MOTORBIKE', calculationType: 'HOURLY',
        specialRules: [
          { name: 'Default', startHour: 0, endHour: 23, rate: 2000, daysOfWeek: [] },
          { name: 'Night', startHour: 18, endHour: 6, rate: 4000, daysOfWeek: [] }
        ]
      },
      { 
        userRole: 'LEARNER', vehicleType: 'CAR', calculationType: 'HOURLY',
        specialRules: [
          { name: 'Default', startHour: 0, endHour: 23, rate: 10000, daysOfWeek: [] },
          { name: 'Night', startHour: 18, endHour: 6, rate: 20000, daysOfWeek: [] }
        ]
      },
      { 
        userRole: 'LEARNER', vehicleType: 'BICYCLE', calculationType: 'HOURLY',
        specialRules: [
          { name: 'Default', startHour: 0, endHour: 23, rate: 1000, daysOfWeek: [] },
          { name: 'Night', startHour: 18, endHour: 6, rate: 2000, daysOfWeek: [] }
        ]
      },
      
      // FACULTY: Hourly with 50% discount
      { 
        userRole: 'FACULTY', vehicleType: 'MOTORBIKE', calculationType: 'HOURLY', discountPercent: 50,
        specialRules: [
          { name: 'Default', startHour: 0, endHour: 23, rate: 2000, daysOfWeek: [] },
          { name: 'Night', startHour: 18, endHour: 6, rate: 4000, daysOfWeek: [] }
        ]
      },
      { 
        userRole: 'FACULTY', vehicleType: 'CAR', calculationType: 'HOURLY', discountPercent: 50,
        specialRules: [
          { name: 'Default', startHour: 0, endHour: 23, rate: 10000, daysOfWeek: [] },
          { name: 'Night', startHour: 18, endHour: 6, rate: 20000, daysOfWeek: [] }
        ]
      },
      { 
        userRole: 'FACULTY', vehicleType: 'BICYCLE', calculationType: 'HOURLY', discountPercent: 100,
        specialRules: [
          { name: 'Default', startHour: 0, endHour: 23, rate: 1000, daysOfWeek: [] },
          { name: 'Night', startHour: 18, endHour: 6, rate: 2000, daysOfWeek: [] }
        ]
      },
      
      // VISITOR: Per turn
      { 
        userRole: 'VISITOR', vehicleType: 'MOTORBIKE', calculationType: 'PER_TURN',
        specialRules: [
          { name: 'Day Turn', startHour: 0, endHour: 23, rate: 5000, daysOfWeek: [] },
          { name: 'Night Turn', startHour: 18, endHour: 6, rate: 10000, daysOfWeek: [] }
        ]
      },
      { 
        userRole: 'VISITOR', vehicleType: 'CAR', calculationType: 'PER_TURN',
        specialRules: [
          { name: 'Day Turn', startHour: 0, endHour: 23, rate: 30000, daysOfWeek: [] },
          { name: 'Night Turn', startHour: 18, endHour: 6, rate: 50000, daysOfWeek: [] }
        ]
      },
      { 
        userRole: 'VISITOR', vehicleType: 'BICYCLE', calculationType: 'PER_TURN',
        specialRules: [
          { name: 'Day Turn', startHour: 0, endHour: 23, rate: 2000, daysOfWeek: [] },
          { name: 'Night Turn', startHour: 18, endHour: 6, rate: 4000, daysOfWeek: [] }
        ]
      },
    ]);
    console.log('Created pricing policies.');

    // 2. Create TemporaryCards (50 cards in pool)
    const tempCards = [];
    for (let i = 1; i <= 50; i++) {
      tempCards.push({ cardId: `CARD_TEMP_${String(i).padStart(3, '0')}` });
    }
    await TemporaryCard.insertMany(tempCards);
    console.log('Created 50 temporary cards.');

    // 3. Create Users
    const hashed = await bcrypt.hash('password123', 10);
    const users = [];
    // Helper to find role by userId in generated users
    const userMap: Record<string, string> = {};
    for (let i = 1; i <= 20; i++) {
      const role = i === 1 ? 'ADMIN' : (i <= 3 ? 'OPERATOR' : (i === 4 ? 'FINANCE_OFFICE' : (i % 2 === 0 ? 'LEARNER' : 'FACULTY')));
      userMap[`USER_${i}`] = role;
      users.push({
        userId: `USER_${i}`,
        schoolCardId: 100000 + i,
        fullName: `User Full Name ${i}`,
        role: role,
        email: `user${i}@example.com`,
        userStatus: 'ACTIVE',
        password: hashed,
      });
    }
    await User.insertMany(users);
    console.log('Created 20 users.');

    // ... (Zones, Slots, Devices logic)
    // (Omitted unchanged code for brevity, assuming it remains intact)

    // 4. Create Zones and Slots
    const zoneConfigs = [
      { id: 'ZONE_A', name: 'West Wing Parking', capacity: 40, rows: 4, cols: 10 },
      { id: 'ZONE_B', name: 'East Wing Parking', capacity: 30, rows: 3, cols: 10 },
      { id: 'ZONE_C', name: 'Underground Level 1', capacity: 50, rows: 5, cols: 10 },
      { id: 'ZONE_D', name: 'Underground Level 2', capacity: 50, rows: 5, cols: 10 },
      { id: 'ZONE_E', name: 'Vip Section', capacity: 10, rows: 1, cols: 10 },
    ];

    for (const z of zoneConfigs) {
      await Zone.create({
        zoneId: z.id,
        zoneName: z.name,
        capacity: z.capacity,
        currentUsage: 0
      });

      const locations = [];
      const slots = [];
      const devices = [];

      // Entry/Exit Gateways for each zone
      const entryGateId = `LOC_GATE_ENTRY_${z.id}`;
      const exitGateId = `LOC_GATE_EXIT_${z.id}`;
      
      locations.push({
        locationId: entryGateId,
        locationName: `${z.name} Entry`,
        coordinates: [0, 0],
        locationType: 'GATE'
      });
      locations.push({
        locationId: exitGateId,
        locationName: `${z.name} Exit`,
        coordinates: [z.rows + 1, z.cols + 1],
        locationType: 'GATE'
      });

      // Cameras at gates
      devices.push({
        deviceId: `CAM_ENTRY_${z.id}`,
        zoneId: z.id,
        deviceType: 'CAMERA',
        locationId: entryGateId,
        deviceName: `${z.name} Entry Cam`,
        status: 'ONLINE'
      });
      devices.push({
        deviceId: `CAM_EXIT_${z.id}`,
        zoneId: z.id,
        deviceType: 'CAMERA',
        locationId: exitGateId,
        deviceName: `${z.name} Exit Cam`,
        status: 'ONLINE'
      });

      // Gateway for the zone
      devices.push({
        deviceId: `GW_${z.id}`,
        zoneId: z.id,
        deviceType: 'GATEWAY',
        locationId: entryGateId,
        deviceName: `${z.name} Main Gateway`,
        status: 'ONLINE'
      });

      // Signage for the zone
      devices.push({
        deviceId: `SIGN_${z.id}`,
        zoneId: z.id,
        deviceType: 'SIGNAGE',
        locationId: entryGateId,
        deviceName: `${z.name} Info Board`,
        status: 'ONLINE'
      });

      // Slots
      for (let r = 1; r <= z.rows; r++) {
        for (let c = 1; c <= z.cols; c++) {
          const slotIdx = (r - 1) * z.cols + c;
          if (slotIdx > z.capacity) break;

          const slotId = `LOC_SLOT_${z.id}_${r}_${c}`;
          locations.push({
            locationId: slotId,
            locationName: `Slot ${r}-${c}`,
            coordinates: [r, c],
            locationType: 'SLOT'
          });

          const isOccupied = Math.random() > 0.7;
          slots.push({
            slotId: slotId,
            zoneId: z.id,
            isAvailable: !isOccupied
          });

          // Sensors for slots (some might be offline or in error)
          const statusRoll = Math.random();
          const status = statusRoll > 0.95 ? 'OFFLINE' : (statusRoll > 0.9 ? 'ERROR' : 'ONLINE');
          
          const deviceId = `SENS_${z.id}_${r}_${c}`;
          devices.push({
            deviceId: deviceId,
            zoneId: z.id,
            deviceType: 'SENSOR',
            locationId: slotId,
            deviceName: `Sensor ${r}-${c}`,
            status: status
          });

          if (status === 'ERROR') {
            await InfrastructureAlert.create({
              deviceId: deviceId,
              alertType: 'ERROR',
              message: 'Connectivity unstable',
              status: 'ACTIVE'
            });
          }
        }
      }

      await Location.insertMany(locations);
      await ParkingSlot.insertMany(slots);
      await IoTDevice.insertMany(devices);
      
      // Update usage
      const occupiedCount = slots.filter(s => !s.isAvailable).length;
      await Zone.updateOne({ zoneId: z.id }, { currentUsage: occupiedCount });
    }
    console.log(`Created ${zoneConfigs.length} zones with slots and devices.`);

    // 5. Create Parking Sessions (Historical & Active)
    const sessions = [];
    const vehicleTypes = ['MOTORBIKE', 'CAR', 'BICYCLE'];
    const platePrefixes = ['29A', '30F', '51G', '43H'];
    
    // Active Sessions (ongoing)
    const activeSessionsCount = 50;
    for (let i = 0; i < activeSessionsCount; i++) {
      const type = Math.random() > 0.3 ? 'REGISTERED' : 'TEMPORARY';
      const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - Math.floor(Math.random() * 5));
      const subjectId = type === 'REGISTERED' ? `USER_${Math.floor(Math.random() * 20) + 1}` : `CARD_${1000 + i}`;
      const userRole = type === 'REGISTERED' ? (userMap[subjectId] || 'LEARNER') : 'VISITOR';

      sessions.push({
        sessionId: uuidv4(),
        startTime: startTime,
        sessionStatus: 'ACTIVE',
        paymentStatus: 'UNPAID',
        type: type,
        userRole: userRole,
        vehicleType: vehicleType,
        subjectId: subjectId,
        plateNumber: `${platePrefixes[Math.floor(Math.random() * platePrefixes.length)]}-${Math.floor(10000 + Math.random() * 90000)}`,
        fee: 0
      });
    }

    // Completed Sessions (last 30 days)
    const completedSessionsCount = 500;
    const now = new Date();
    for (let i = 0; i < completedSessionsCount; i++) {
      const type = Math.random() > 0.3 ? 'REGISTERED' : 'TEMPORARY';
      const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 30));
      startTime.setHours(Math.floor(Math.random() * 24));
      
      const durationHours = Math.floor(Math.random() * 12) + 1;
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + durationHours);

      const subjectId = type === 'REGISTERED' ? `USER_${Math.floor(Math.random() * 20) + 1}` : `CARD_${2000 + i}`;
      const userRole = type === 'REGISTERED' ? (userMap[subjectId] || 'LEARNER') : 'VISITOR';

      let fee = 0;
      if (userRole === 'VISITOR') {
        fee = vehicleType === 'CAR' ? 30000 : (vehicleType === 'MOTORBIKE' ? 5000 : 2000);
      } else {
        const base = vehicleType === 'CAR' ? 10000 : (vehicleType === 'MOTORBIKE' ? 2000 : 1000);
        fee = durationHours * base;
        if (userRole === 'FACULTY') fee *= 0.5;
      }

      sessions.push({
        sessionId: uuidv4(),
        startTime: startTime,
        endTime: endTime,
        sessionStatus: 'COMPLETED',
        paymentStatus: 'PAID',
        type: type,
        userRole: userRole,
        vehicleType: vehicleType,
        subjectId: subjectId,
        plateNumber: `${platePrefixes[Math.floor(Math.random() * platePrefixes.length)]}-${Math.floor(10000 + Math.random() * 90000)}`,
        fee: fee,
        invoiceId: `INV-${Date.now()}-${i}`
      });
    }

    await ParkingSession.insertMany(sessions);
    console.log(`Created ${sessions.length} parking sessions.`);

    console.log('Seeding completed successfully with large dataset!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
