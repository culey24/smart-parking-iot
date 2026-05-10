/** System configuration for Smart Parking */

export interface SystemConfig {
  /** Operations */
  occupancyThresholdPercent: number;
  iotDeviceTimeoutSeconds: number;
  syncIntervalSeconds: number;
  enableOccupancyAlerts: boolean;
  enableIotTimeoutMonitoring: boolean;

  /** Notifications */
  hotlineSupport: string;
  alertEmail: string;
  enableEmailAlerts: boolean;
  pricingCycleDays: number;
}
