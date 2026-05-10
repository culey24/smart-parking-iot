import { ParkingSession } from '../models/ParkingSession';
import { InfrastructureAlert } from '../models/InfrastructureAlert';
import { ParkingSlot } from '../models/ParkingSlot';
import { PipelineStage } from 'mongoose';

// Định nghĩa form dữ liệu trả về cho Controller và Swagger
export interface DailyRevenueReport {
  _id: string; // Ngày định dạng YYYY-MM-DD
  totalRevenue: number;
  vehicleCount: number;
}

export class ReportService {
  
  // Thêm tùy chọn lọc theo ngày (rất cần thiết trong thực tế)
  static async getDailyRevenue(startDate?: Date, endDate?: Date): Promise<DailyRevenueReport[]> {
    
    // 1. Chuẩn bị bộ lọc Match
    const matchStage: any = {
      sessionStatus: 'COMPLETED'
    };

    // Nếu Frontend có gửi kèm ngày bắt đầu / kết thúc thì nhét vào bộ lọc
    if (startDate || endDate) {
      matchStage.endTime = {};
      if (startDate) matchStage.endTime.$gte = startDate;
      if (endDate) matchStage.endTime.$lte = endDate;
    }

    const pipeline: PipelineStage[] = [
      {
        $match: matchStage
      },
      {
        $group: {
          _id: { 
            // Ép múi giờ Asia/Ho_Chi_Minh để không bị lùi ngày (vì giờ UTC trễ hơn VN 7 tiếng)
            $dateToString: { format: "%Y-%m-%d", date: "$endTime", timezone: "Asia/Ho_Chi_Minh" } 
          },
          totalRevenue: { $sum: "$fee" },
          vehicleCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } 
      }
    ];

    // Trả về kết quả và ép kiểu cho nó khớp với interface DailyRevenueReport
    return await ParkingSession.aggregate<DailyRevenueReport>(pipeline);
  }

  static async getActivityStats() {
    // 1. usageByHour (Current day density)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Average occupancy rate (current)
    const totalSlots = await ParkingSlot.countDocuments();
    const occupiedSlots = await ParkingSlot.countDocuments({ isAvailable: false });
    const avgOccupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    // Device errors
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const deviceErrorsWeek = await InfrastructureAlert.countDocuments({ 
      alertType: 'ERROR', 
      timestamp: { $gte: weekAgo } 
    });
    const deviceErrorsMonth = await InfrastructureAlert.countDocuments({ 
      alertType: 'ERROR', 
      timestamp: { $gte: monthAgo } 
    });

    // Hourly usage (sessions active at that hour today)
    // For simplicity, we'll map sessions that started today by their start hour
    const sessionsToday = await ParkingSession.find({
      startTime: { $gte: startOfDay }
    }).lean();

    const hourlyStats = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      usage: sessionsToday.filter(s => {
        const startH = new Date(s.startTime).getHours();
        const endH = s.endTime ? new Date(s.endTime).getHours() : 24;
        return h >= startH && h <= endH;
      }).length,
      label: `${h}:00`
    }));

    return {
      usageByHour: hourlyStats,
      avgOccupancyRate,
      deviceErrorsWeek,
      deviceErrorsMonth
    };
  }
}