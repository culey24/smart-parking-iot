import { PricingPolicy } from '../models/PricingPolicy';

export class BillingService {
  static async calculateFee(endTime: Date, vehicleType: string): Promise<number> {
    try {   
      const policy = await PricingPolicy.findOne({ 
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

    } catch (error) {
      console.error('An error occurred during fee calculation:', error);
      throw error;
    }
  }

  static calculateCycleFee(sessions: any[]): number {
    return sessions.reduce((totalAmount, session) => totalAmount + (session.fee || 0), 0);
  }
}