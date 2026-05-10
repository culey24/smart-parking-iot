import { Request, Response } from 'express';
import { ReportService } from '../services/ReportService';

export class ReportController {
  
  /**
   * @openapi
   * /api/reports/daily-revenue:
   *   get:
   *     tags:
   *       - Reports
   *     summary: Lấy báo cáo doanh thu và lưu lượng xe theo ngày
   *     description: Sử dụng Mongoose Aggregation để tính tổng doanh thu và đếm số lượng xe đã hoàn thành (COMPLETED) theo từng ngày.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lấy báo cáo thành công
   *       401:
   *         description: Lỗi xác thực Token
   *       500:
   *         description: Lỗi Server nội bộ
   */
  static async getDailyRevenueReport(req: Request, res: Response) {
    try {
      const reportData = await ReportService.getDailyRevenue();
      
      res.status(200).json({
        success: true,
        message: 'Lấy báo cáo doanh thu thành công',
        data: reportData 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  static async getActivityStats(req: Request, res: Response) {
    try {
      const stats = await ReportService.getActivityStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}