"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationService = void 0;
const Zone_1 = require("../models/Zone");
class NavigationService {
    static async getZonesByUsage() {
        return await Zone_1.Zone.find().sort({ currentUsage: -1 }).exec();
    }
    static async getStats() {
        const zones = await Zone_1.Zone.find().exec();
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
exports.NavigationService = NavigationService;
