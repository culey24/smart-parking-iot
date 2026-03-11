/** Layout mapping - device placement on map */

export type MappedDeviceType = "sensor" | "gateway";

export interface PlacedDevice {
  id: string;
  type: MappedDeviceType;
  x: number; // percentage or px
  y: number;
  label?: string;
}
