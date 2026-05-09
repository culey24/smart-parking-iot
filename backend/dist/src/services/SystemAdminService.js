"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemAdminService = void 0;
const SystemConfig_1 = require("../models/SystemConfig");
const PricingPolicy_1 = require("../models/PricingPolicy");
const AuditLog_1 = require("../models/AuditLog");
class SystemAdminService {
    // Trả về mảng các ISystemConfig, dùng .lean() để tăng tốc độ
    static async getAllConfigs() {
        return await SystemConfig_1.SystemConfig.find().lean();
    }
    static async updateConfig(settingKey, settingValue) {
        return await SystemConfig_1.SystemConfig.findOneAndUpdate({ settingKey }, { settingValue }, { new: true, upsert: true });
    }
    // Thay vì dùng (newRates: any), dùng Partial<IPricingPolicy> để TypeScript hiểu đây là 1 phần của bảng giá
    static async updatePricing(vehicleType, newRates) {
        return await PricingPolicy_1.PricingPolicy.findOneAndUpdate({ vehicleType }, { ...newRates, effectiveDate: new Date() }, { new: true, upsert: true });
    }
    static async getPricingPolicies() {
        return await PricingPolicy_1.PricingPolicy.find().lean();
    }
    // Tra cứu log thường rất nhiều, nên thêm .limit(100) để tránh bị tràn RAM server
    static async getAuditLogs() {
        return await AuditLog_1.AuditLog.find().sort({ timestamp: -1 }).limit(100).lean();
    }
}
exports.SystemAdminService = SystemAdminService;
