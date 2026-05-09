import { ParkingSession } from '../models/ParkingSession';
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
}