import { ParkingSession } from '../models/ParkingSession';
import { PricingPolicy } from '../models/PricingPolicy';

export class BillingService {
  static async calculateSingleSessionFee(endTime: Date, vehicleType: string): Promise<number> {
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
      console.error('An error occurred during per-session charging:', error);
      throw error; // Ném lỗi để Middleware xử lý theo Task 7
    }
  }

  static async calculateTotalCycleFee(userId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      const sessions = await ParkingSession.find({
        userId: userId,
        sessionStatus: 'COMPLETED',
        endTime: { $gte: startDate, $lte: endDate }
      });

      let totalAmount = 0;

      for (const session of sessions) {
        if (session.endTime) {
          const vehicleType = (session as any).vehicleType || 'MOTORBIKE'; 
          const fee = await this.calculateSingleSessionFee(session.endTime, vehicleType);
          totalAmount += fee;
        }
      }

      return totalAmount;

    } catch (error) {
      console.error('An error occurred during the total cycle fee calculation:', error);
      throw error;
    }
  }
}