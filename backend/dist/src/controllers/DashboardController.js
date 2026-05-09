"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const NavigationService_1 = require("../services/NavigationService");
class DashboardController {
    static async getZonesByUsage(req, res) {
        try {
            const zones = await NavigationService_1.NavigationService.getZonesByUsage();
            res.status(200).json({
                success: true,
                data: zones
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
}
exports.DashboardController = DashboardController;
