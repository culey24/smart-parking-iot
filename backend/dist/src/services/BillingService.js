"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const PricingPolicy_1 = require("../models/PricingPolicy");
class BillingService {
    static async calculateFee(endTime, vehicleType) {
        try {
            const policy = await PricingPolicy_1.PricingPolicy.findOne({
                status: 'ACTIVE',
                vehicleType: vehicleType
            });
            if (!policy) {
                throw new Error(`Pricing policy (ACTIVE) not found for vehicle type: ${vehicleType}`);
            }
            const dayOfWeek = endTime.getDay(); // 0 là Chủ nhật, 1-6 là Thứ 2 - Thứ 7
            const hourOfDay = endTime.getHours(); // Trả về số từ 0 - 23
            // Nếu là Chủ nhật (0) hoặc lấy xe từ 18:00 trở đi
            if (dayOfWeek === 0 || hourOfDay >= 18) {
                return policy.nightOrSundayRate;
            }
            // Thứ 2 - Thứ 7, lấy xe trước 18:00)
            return policy.dayRate;
        }
        catch (error) {
            console.error('An error occurred during fee calculation:', error);
            throw error;
        }
    }
    static calculateCycleFee(sessions) {
        return sessions.reduce((totalAmount, session) => totalAmount + (session.fee || 0), 0);
    }
}
exports.BillingService = BillingService;
