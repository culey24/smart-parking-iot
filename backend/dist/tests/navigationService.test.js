"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NavigationService_1 = require("../src/services/NavigationService");
const Zone_1 = require("../src/models/Zone");
jest.mock('../src/models/Zone');
describe('NavigationService', () => {
    it('should return zones sorted by usage', async () => {
        Zone_1.Zone.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([{ zoneId: 'A', currentUsage: 1 }])
            })
        });
        const zones = await NavigationService_1.NavigationService.getZonesByUsage();
        expect(zones[0].zoneId).toBe('A');
    });
    it('should return usage summary', async () => {
        Zone_1.Zone.find.mockReturnValue({
            exec: jest.fn().mockResolvedValue([
                { capacity: 10, currentUsage: 5 },
                { capacity: 20, currentUsage: 10 }
            ])
        });
        const summary = await NavigationService_1.NavigationService.getStats();
        expect(summary.totalCapacity).toBe(30);
        expect(summary.totalUsage).toBe(15);
        expect(summary.utilizationRate).toBe(0.5);
    });
});
