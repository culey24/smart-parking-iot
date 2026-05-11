import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { Location } from '../models/Location';
import { ParkingSlot } from '../models/ParkingSlot';
import { IoTDevice } from '../models/IoTDevice';
import { InfrastructureAlert } from '../models/InfrastructureAlert';
import { Zone as ParkingZone } from '../models/Zone';
import { ParkingSession } from '../models/ParkingSession';
import { User } from '../models/User';
import { PricingPolicy } from '../models/PricingPolicy';
import { TemporaryCard } from '../models/TemporaryCard';
import { ReconciliationRequest } from '../models/ReconciliationRequest';
import { Invoice } from '../models/Invoice';

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
    await ParkingZone.deleteMany({});
    await ParkingSession.deleteMany({});
    await User.deleteMany({});
    await PricingPolicy.deleteMany({});
    await TemporaryCard.deleteMany({});
    await ReconciliationRequest.deleteMany({});
    await Invoice.deleteMany({});
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
      tempCards.push({ tempCardID: `CARD_TEMP_${String(i).padStart(3, '0')}`, cardStatus: 'ACTIVATING' });
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
        schoolCardId: String(100000 + i),
        fullName: `User Full Name ${i}`,
        role: role,
        email: `user${i}@example.com`,
        userStatus: 'ACTIVE',
        password: hashed,
      });
    }
    await User.insertMany(users);
    console.log('Created 20 users.');

    // 4. Create Zones and Slots
    const zoneConfigs = [
      { id: 'ZONE_A', name: 'West Wing Parking', capacity: 40, rows: 4, cols: 10 },
      { id: 'ZONE_B', name: 'East Wing Parking', capacity: 30, rows: 3, cols: 10 },
      { id: 'ZONE_C', name: 'Underground Level 1', capacity: 50, rows: 5, cols: 10 },
      { id: 'ZONE_D', name: 'Underground Level 2', capacity: 50, rows: 5, cols: 10 },
      { id: 'ZONE_E', name: 'Vip Section', capacity: 10, rows: 1, cols: 10 },
    ];

    for (const z of zoneConfigs) {
      await ParkingZone.create({
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
        status: 'ONLINE',
        lastOnline: new Date(),
        streamURL: `rtsp://cam/${z.id}/entry`,
        resolution: '1080p'
      });
      devices.push({
        deviceId: `CAM_EXIT_${z.id}`,
        zoneId: z.id,
        deviceType: 'CAMERA',
        locationId: exitGateId,
        deviceName: `${z.name} Exit Cam`,
        status: 'ONLINE',
        lastOnline: new Date(),
        streamURL: `rtsp://cam/${z.id}/exit`,
        resolution: '1080p'
      });

      // Gateway (Gate) for the zone
      devices.push({
        deviceId: `GW_${z.id}`,
        zoneId: z.id,
        deviceType: 'GATE',
        gateType: 'ENTRY',
        locationId: entryGateId,
        deviceName: `${z.name} Entrance Controller`,
        status: 'ONLINE',
        lastOnline: new Date(),
        isAutoOpen: true
      });

      // Signage for the zone
      devices.push({
        deviceId: `SIGN_${z.id}`,
        zoneId: z.id,
        deviceType: 'SIGNAGE',
        locationId: entryGateId,
        deviceName: `${z.name} Info Board`,
        status: 'ONLINE',
        lastOnline: new Date(),
        message: 'Welcome',
        brightness: 100
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
            status: status,
            lastOnline: new Date(),
            parkingSlotId: slotId,
            sensitivity: 0.8
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
      await ParkingZone.updateOne({ zoneId: z.id }, { currentUsage: occupiedCount });
    }
    console.log(`Created ${zoneConfigs.length} zones with slots and devices.`);

    // 5. Create Parking Sessions (Historical & Active)
    const sessions = [];
    const vehicleTypes = ['MOTORBIKE', 'CAR', 'BICYCLE'];
    const platePrefixes = ['29A', '30F', '51G', '43H', '92K', '64M', '75P'];

    // Collect all sensor deviceIds for binding
    const sensors = await IoTDevice.find({ deviceType: 'SENSOR', status: 'ONLINE' }).limit(100);
    const sensorPool = sensors.map(s => s.deviceId);

    // Active Sessions (ongoing) — 80 sessions bound to sensors
    const activeSessionsCount = 80;
    for (let i = 0; i < activeSessionsCount; i++) {
      const type = i < 50 ? 'REGISTERED' : 'TEMPORARY';
      const vehicleType = vehicleTypes[i % vehicleTypes.length];
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - Math.floor(Math.random() * 8));
      const userNum = (i % 20) + 1;
      const subjectID = type === 'REGISTERED' ? `USER_${userNum}` : `CARD_TEMP_${String(100 + i).padStart(3, '0')}`;
      const userRole = type === 'REGISTERED' ? (userMap[`USER_${userNum}`] || 'LEARNER') : 'VISITOR';
      const sensorId = sensorPool[i % sensorPool.length] || null;

      sessions.push({
        sessionId: uuidv4(),
        startTime: startTime,
        sessionStatus: 'ACTIVE',
        paymentStatus: 'UNPAID',
        type: type,
        userRole: userRole,
        vehicleType: vehicleType,
        subjectID: subjectID,
        plateNumber: `${platePrefixes[i % platePrefixes.length]}-${Math.floor(10000 + Math.random() * 90000)}`,
        fee: 0,
        deviceId: sensorId,
      });
    }

    // Mark some sensors as occupied
    const occupiedSensors = sensorPool.slice(0, activeSessionsCount);
    await IoTDevice.updateMany(
      { deviceId: { $in: occupiedSensors } },
      { $set: { status: 'OCCUPIED' } }
    );

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

      const subjectID = type === 'REGISTERED' ? `USER_${Math.floor(Math.random() * 20) + 1}` : `CARD_${2000 + i}`;
      const userRole = type === 'REGISTERED' ? (userMap[subjectID] || 'LEARNER') : 'VISITOR';

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
        subjectID: subjectID,
        plateNumber: `${platePrefixes[Math.floor(Math.random() * platePrefixes.length)]}-${Math.floor(10000 + Math.random() * 90000)}`,
        fee: fee,
        invoiceId: `INV-${Date.now()}-${i}`
      });
    }

    await ParkingSession.insertMany(sessions);
    console.log(`Created ${sessions.length} parking sessions.`);

    // 6. Create Invoices for completed sessions
    const invoices = sessions
      .filter(s => s.sessionStatus === 'COMPLETED' && s.invoiceId)
      .map(s => ({
        invoiceId: s.invoiceId,
        amount: s.fee, // Default to match fee
        paymentStatus: 'PAID',
        issueDate: s.endTime
      }));
    
    // Add some discrepancies for reconciliation demo
    if (invoices.length > 0) {
      invoices[0].amount += 5000; // Invoice is 5k more than calculated fee
    }

    await Invoice.insertMany(invoices);
    console.log(`Created ${invoices.length} invoices.`);

    // 7. Create Reconciliation Requests
    const completed = sessions.filter(s => s.sessionStatus === 'COMPLETED');
    if (completed.length >= 2) {
      const reconRequests = [
        {
          sessionId: completed[0].sessionId,
          userId: completed[0].subjectID,
          userName: 'John Doe (Simulated)',
          licensePlate: completed[0].plateNumber,
          description: 'Calculated fee seems lower than what I paid in BKPay.',
          status: 'pending',
          reportedAt: new Date()
        },
        {
          sessionId: completed[1].sessionId,
          userId: completed[1].subjectID,
          userName: 'Jane Smith (Simulated)',
          licensePlate: completed[1].plateNumber,
          description: 'Session is marked as PAID but I want to contest the duration.',
          status: 'pending',
          reportedAt: new Date(Date.now() - 3600000)
        }
      ];
      await ReconciliationRequest.insertMany(reconRequests);
      console.log('Created 2 reconciliation requests.');
    }

    console.log('Seeding completed successfully with large dataset!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
