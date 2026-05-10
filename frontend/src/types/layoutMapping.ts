/** 
 * Layout mapping - device placement on map 
 * COORDINATE SYSTEM:
 * x, y are percentages (0-100) relative to the map's structural dimensions.
 * This ensures responsiveness across different screen sizes and zoom levels.
 * Conversion to pixels is handled by (percentage / 100) * mapDimensionPx.
 */

export type MappedDeviceType = 
  | "sensor" 
  | "gateway" 
  | "signage" 
  | "barrier" 
  | "entrance" 
  | "exit" 
  | "zone"
  | "road"
  | "waypoint";

export interface DeviceMetadata {
  status?: "online" | "offline" | "error";
  lastSeen?: string;
  battery?: number;
  firmware?: string;
  manufacturer?: string;
}

export interface PlacedDevice {
  id: string; // Internal UUID for the layout element
  deviceId?: string; // Reference to the real IoTDevice MongoDB _id
  type: MappedDeviceType;
  x: number; // percentage
  y: number;
  width?: number; // for rectangular zones
  height?: number; // for rectangular zones
  points?: { x: number; y: number }[]; // For polygon zones or multi-segment roads
  shape?: "rectangle" | "polygon" | "triangle";
  label?: string;
  connections?: string[]; // IDs of connected PlacedDevices
  parentId?: string; // Parent Zone ID or Facility ID
  metadata?: DeviceMetadata;
  tags?: string[];
}

export interface CanvasTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}
