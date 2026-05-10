import { Schema, model, Document } from 'mongoose';

// --- Base Interface & Schema ---
export interface IIoTDevice extends Document {
  deviceId: string;
  locationId?: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTAINANCE' | 'ERROR'; // Spec spelling: MAINTAINANCE
  lastOnline: Date;
  zoneId: string;
  deviceType: string;
  deviceName?: string;
  updatedAt: Date;
  createdAt: Date;
}

const IoTDeviceSchema = new Schema({
  deviceId: { type: String, required: true, unique: true },
  locationId: { type: String },
  status: { 
    type: String, 
    enum: ['ONLINE', 'OFFLINE', 'MAINTAINANCE', 'ERROR'], 
    default: 'ONLINE' 
  },
  lastOnline: { type: Date, default: Date.now },
  zoneId: { type: String, required: true },
  deviceType: { 
    type: String, 
    required: true,
    enum: ['SENSOR', 'GATE', 'LED_SIGN', 'SIGNAGE', 'CAMERA'] 
  },
  deviceName: { type: String },
}, { 
  timestamps: true,
  discriminatorKey: 'deviceType',
  collection: 'iotdevices'
});

export const IoTDevice = model<IIoTDevice>('IoTDevice', IoTDeviceSchema);

// --- Inherited Class: Sensor ---
export interface ISensorDevice extends IIoTDevice {
  parkingSlotId?: string;
  sensitivity?: number;
}

export const SensorDevice = IoTDevice.discriminator<ISensorDevice>('SENSOR', new Schema({
  parkingSlotId: { type: String },
  sensitivity: { type: Number, default: 0.5 },
}));

// --- Inherited Class: Gate ---
export interface IGateDevice extends IIoTDevice {
  gateType: 'ENTRY' | 'EXIT';
  ipAddress?: string;
  isAutoOpen?: boolean;
}

export const GateDevice = IoTDevice.discriminator<IGateDevice>('GATE', new Schema({
  gateType: { type: String, enum: ['ENTRY', 'EXIT'], required: true },
  ipAddress: { type: String },
  isAutoOpen: { type: Boolean, default: true },
}));

// --- Inherited Class: Signage ---
export interface ISignageDevice extends IIoTDevice {
  message?: string;
  brightness?: number;
}

export const SignageDevice = IoTDevice.discriminator<ISignageDevice>('SIGNAGE', new Schema({
  message: { type: String },
  brightness: { type: Number, default: 100 },
}));

// --- Inherited Class: Camera ---
export interface ICameraDevice extends IIoTDevice {
  streamURL?: string; // Spec casing: streamURL
  resolution?: string;
}

export const CameraDevice = IoTDevice.discriminator<ICameraDevice>('CAMERA', new Schema({
  streamURL: { type: String },
  resolution: { type: String, default: '1080p' },
}));
