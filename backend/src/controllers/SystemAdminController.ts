import { Request, Response } from 'express';
import { SystemAdminService } from '../services/SystemAdminService';
import { AuditLog } from '../models/AuditLog';

// 1. TẠO INTERFACE: Giúp TypeScript hiểu req.user được gắn từ authMiddleware
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class SystemAdminController {
  
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
  static async updateConfig(req: AuthRequest, res: Response) {
    try {
      const { settingKey, settingValue } = req.body;
      
      // Xài Optional Chaining (?.), lỡ user bị undefined hệ thống cũng không sập
      const userId = req.user?.id || 'system'; 

      if (!settingKey || settingValue === undefined) {
        throw new Error('Thiếu thông tin settingKey hoặc settingValue');
      }

      const result = await SystemAdminService.updateConfig(settingKey, settingValue);

      await AuditLog.create({
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
    } catch (error) {
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
   * baseRate:
   * type: number
   * example: 20000
   * hourlyRate:
   * type: number
   * example: 10000
   * monthlyRate:
   * type: number
   * example: 500000
   * responses:
   * 200:
   * description: Cập nhật thành công
   */
  static async updatePricing(req: AuthRequest, res: Response) {
    try {
      const { vehicleType, baseRate, hourlyRate, monthlyRate } = req.body;
      const userId = req.user?.id || 'system';

      if (!vehicleType) {
        throw new Error('Cần xác định loại xe (vehicleType)');
      }

      const result = await SystemAdminService.updatePricing(vehicleType, {
        baseRate, hourlyRate, monthlyRate
      });

      await AuditLog.create({
        action: 'UPDATE_PRICE',
        userId: userId,
        targetResource: `PricingPolicy_${vehicleType}`
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật bảng giá thành công',
        data: result
      });
    } catch (error) {
      throw error;
    }
  }

  // --- Các hàm GET dưới đây tui rút gọn lại, ông có thể tự viết thêm JSDoc tương tự nha ---

  static async getAllConfigs(req: AuthRequest, res: Response) {
    try {
      const configs = await SystemAdminService.getAllConfigs();
      res.status(200).json({ success: true, data: configs });
    } catch (error) { throw error; }
  }

  static async getPricing(req: AuthRequest, res: Response) {
    try {
      const pricing = await SystemAdminService.getPricingPolicies();
      res.status(200).json({ success: true, data: pricing });
    } catch (error) { throw error; }
  }

  static async getLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await SystemAdminService.getAuditLogs();
      res.status(200).json({ success: true, data: logs });
    } catch (error) { throw error; }
  }
}