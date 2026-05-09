"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemAdminController = void 0;
const SystemAdminService_1 = require("../services/SystemAdminService");
const AuditLog_1 = require("../models/AuditLog");
class SystemAdminController {
    /**
     * @openapi
     * /api/admin/config:
     * put:
     * tags:
     * - System Admin
     * summary: Cập nhật hoặc tạo mới cấu hình hệ thống
     * security:
     * - bearerAuth: []
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * type: object
     * properties:
     * settingKey:
     * type: string
     * example: "MAX_PARKING_CAPACITY"
     * settingValue:
     * type: string
     * example: "500"
     * responses:
     * 200:
     * description: Cập nhật thành công
     */
    static async updateConfig(req, res) {
        try {
            const { settingKey, settingValue } = req.body;
            // Xài Optional Chaining (?.), lỡ user bị undefined hệ thống cũng không sập
            const userId = req.user?.id || 'system';
            if (!settingKey || settingValue === undefined) {
                throw new Error('Thiếu thông tin settingKey hoặc settingValue');
            }
            const result = await SystemAdminService_1.SystemAdminService.updateConfig(settingKey, settingValue);
            await AuditLog_1.AuditLog.create({
                action: 'UPDATE_CONFIG',
                userId: userId,
                targetResource: `SystemConfig_${settingKey}`,
                details: { newValue: settingValue }
            });
            res.status(200).json({
                success: true,
                message: 'Cập nhật cấu hình thành công',
                data: result
            });
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * @openapi
     * /api/admin/pricing:
     * put:
     * tags:
     * - System Admin
     * summary: Cập nhật bảng giá giữ xe
     * security:
     * - bearerAuth: []
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * type: object
     * properties:
     * vehicleType:
     * type: string
     * example: "CAR"
     * dayRate:
     * type: number
     * example: 3000
     * nightOrSundayRate:
     * type: number
     * example: 5000
     * responses:
     * 200:
     * description: Cập nhật thành công
     */
    static async updatePricing(req, res) {
        try {
            const { vehicleType, dayRate, nightOrSundayRate } = req.body;
            const userId = req.user?.id || 'system';
            if (!vehicleType) {
                throw new Error('Cần xác định loại xe (vehicleType)');
            }
            const result = await SystemAdminService_1.SystemAdminService.updatePricing(vehicleType, {
                dayRate, nightOrSundayRate
            });
            await AuditLog_1.AuditLog.create({
                action: 'UPDATE_PRICE',
                userId: userId,
                targetResource: `PricingPolicy_${vehicleType}`
            });
            res.status(200).json({
                success: true,
                message: 'Cập nhật bảng giá thành công',
                data: result
            });
        }
        catch (error) {
            throw error;
        }
    }
    // --- Các hàm GET dưới đây tui rút gọn lại, ông có thể tự viết thêm JSDoc tương tự nha ---
    static async getAllConfigs(req, res) {
        try {
            const configs = await SystemAdminService_1.SystemAdminService.getAllConfigs();
            res.status(200).json({ success: true, data: configs });
        }
        catch (error) {
            throw error;
        }
    }
    static async getPricing(req, res) {
        try {
            const pricing = await SystemAdminService_1.SystemAdminService.getPricingPolicies();
            res.status(200).json({ success: true, data: pricing });
        }
        catch (error) {
            throw error;
        }
    }
    static async getLogs(req, res) {
        try {
            const logs = await SystemAdminService_1.SystemAdminService.getAuditLogs();
            res.status(200).json({ success: true, data: logs });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.SystemAdminController = SystemAdminController;
