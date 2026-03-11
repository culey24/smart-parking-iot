export type BarrierStatus = "open" | "closed";

export interface Gate {
  id: string;
  label: string;
  barrierStatus: BarrierStatus;
}

export const MANUAL_OPEN_REASONS = [
  "Sensor error",
  "Card not recognized",
  "Priority vehicle",
  "Emergency",
] as const;

export type ManualOpenReason = (typeof MANUAL_OPEN_REASONS)[number];
