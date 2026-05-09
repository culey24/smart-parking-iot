"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const ReportService_1 = require("../services/ReportService");
class ReportController {
    /**
     * @openapi
     * /api/reports/daily-revenue:
     * get:
     * tags:
     * - Reports
     * summary: Lấy báo cáo doanh thu và lưu lượng xe theo ngày
     * description: Sử dụng Mongoose Aggregation để tính tổng doanh thu và đếm số lượng xe đã hoàn thành (COMPLETED) theo từng ngày.
     * security:
     * - bearerAuth: []
     * responses:
     * 200:
     * description: Lấy báo cáo thành công
     * 401:
     * description: Lỗi xác thực Token
     * 500:
     * description: Lỗi Server nội bộ
     */
    static async getDailyRevenueReport(req, res) {
        try {
            const reportData = await ReportService_1.ReportService.getDailyRevenue();
            res.status(200).json({
                success: true,
                message: 'Lấy báo cáo doanh thu thành công',
                data: reportData
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.ReportController = ReportController;
