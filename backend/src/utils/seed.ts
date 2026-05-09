import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Location } from '../models/Location';
import { ParkingSlot } from '../models/ParkingSlot';
import { IoTDevice } from '../models/IoTDevice';
import { InfrastructureAlert } from '../models/InfrastructureAlert';
import { Zone } from '../models/Zone';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/smart-parking?authSource=admin';

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
    console.log('Cleared existing collections.');

    // 1. Create a Zone
    const zoneA = await Zone.create({
      zoneId: 'ZONE_A',
      zoneName: 'Main Campus Parking',
      capacity: 50,
      currentUsage: 2
    });

    // 2. Create Locations (Slots and Gateways)
    const locSlot1 = await Location.create({
      locationId: 'LOC_S1',
      locationName: 'Slot 1',
      coordinates: [1, 1], // row 1, col 1
      locationType: 'SLOT'
    });
    
    const locSlot2 = await Location.create({
      locationId: 'LOC_S2',
      locationName: 'Slot 2',
      coordinates: [1, 2], // row 1, col 2
      locationType: 'SLOT'
    });

    const locGate1 = await Location.create({
      locationId: 'LOC_G1',
      locationName: 'Main Entry Gate',
      coordinates: [0, 0],
      locationType: 'GATE'
    });

    // 3. Create Parking Slots mapping to Slot Locations
    await ParkingSlot.create({
      slotId: 'LOC_S1',
      zoneId: zoneA.zoneId,
      isAvailable: false // occupied
    });

    await ParkingSlot.create({
      slotId: 'LOC_S2',
      zoneId: zoneA.zoneId,
      isAvailable: true // empty
    });

    // 4. Create IoT Devices mapping to Locations
    const devCam1 = await IoTDevice.create({
      deviceId: 'CAM_01',
      zoneId: zoneA.zoneId,
      deviceType: 'CAMERA',
      locationId: 'LOC_G1',
      deviceName: 'Entry Camera A',
      status: 'ONLINE'
    });

    const devSensor1 = await IoTDevice.create({
      deviceId: 'SENS_01',
      zoneId: zoneA.zoneId,
      deviceType: 'SENSOR',
      locationId: 'LOC_S1',
      deviceName: 'Slot 1 Sensor',
      status: 'ONLINE'
    });
    
    const devSensor2 = await IoTDevice.create({
      deviceId: 'SENS_02',
      zoneId: zoneA.zoneId,
      deviceType: 'SENSOR',
      locationId: 'LOC_S2',
      deviceName: 'Slot 2 Sensor',
      status: 'ERROR'
    });

    // 5. Create an Infrastructure Alert
    await InfrastructureAlert.create({
      deviceId: devSensor2.deviceId,
      alertType: 'ERROR',
      message: 'Sensor misaligned',
      status: 'ACTIVE'
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
