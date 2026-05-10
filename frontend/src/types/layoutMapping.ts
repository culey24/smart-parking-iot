/** 
 * Layout mapping - device placement on map 
 * COORDINATE SYSTEM:
 * x, y are percentages (0-100) relative to the map's structural dimensions.
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
  | "waypoint"
  | "connection";

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
  x: number; // percentage (center for icons, or start for floating lines)
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[]; // For polygon zones, roads, or CONNECTION JOINTS
  shape?: "rectangle" | "polygon" | "triangle";
  label?: string;
  connections?: string[]; // IDs of connected PlacedDevices (logical)
  
  // Connection-specific anchors
  sourceId?: string;
  targetId?: string;
  endX?: number; // percentage (for floating lines)
  endY?: number;
  
  parentId?: string; // Parent Zone ID
  metadata?: DeviceMetadata;
  tags?: string[];
}

export interface CanvasTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}
