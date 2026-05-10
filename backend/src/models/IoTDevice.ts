import { Schema, model } from 'mongoose';

const IoTDeviceSchema = new Schema({
  deviceId: { type: String, required: true, unique: true },
  zoneId: { type: String, required: true },
  deviceType: { type: String, enum: ['SENSOR', 'GATEWAY', 'LED_SIGN', 'SIGNAGE', 'CAMERA', 'BARRIER'], required: true },
  lastPing: { type: Date, default: Date.now },
  status: { type: String, enum: ['ONLINE', 'OFFLINE', 'ERROR'], default: 'ONLINE' },
  // Adding location reference to map devices to the UI map
  locationId: { type: String }, // Optional link to a Location
  deviceName: { type: String }, // Optional descriptive name
}, { timestamps: true });

export const IoTDevice = model('IoTDevice', IoTDeviceSchema);
