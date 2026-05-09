"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const DashboardController_1 = require("../src/controllers/DashboardController");
const NavigationService_1 = require("../src/services/NavigationService");
jest.mock('../src/services/NavigationService');
const app = (0, express_1.default)();
app.get('/zones', DashboardController_1.DashboardController.getZonesByUsage);
describe('DashboardController', () => {
    it('GET /zones should return zones', async () => {
        NavigationService_1.NavigationService.getZonesByUsage.mockResolvedValue([
            { zoneId: 'A', zoneName: 'Zone A', capacity: 10, currentUsage: 2 }
        ]);
        const response = await (0, supertest_1.default)(app).get('/zones');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data[0].zoneId).toBe('A');
    });
});
