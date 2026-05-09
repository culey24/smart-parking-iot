import { Zone } from '../models/Zone';

export class NavigationService {
  static async getZonesByUsage() {
    return await Zone.find().sort({ currentUsage: -1 }).exec();
  }

  static async getStats() {
    const zones = await Zone.find().exec();
    const totalCapacity = zones.reduce((sum, zone) => sum + (zone.capacity || 0), 0);
    const totalUsage = zones.reduce((sum, zone) => sum + (zone.currentUsage || 0), 0);
    const utilizationRate = totalCapacity > 0 ? totalUsage / totalCapacity : 0;

    return {
      totalCapacity,
      totalUsage,
      utilizationRate
    };
  }
}
