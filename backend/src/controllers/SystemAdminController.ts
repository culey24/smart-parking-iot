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
   *   put:
   *     tags:
   *       - System Admin
   *     summary: Cập nhật hoặc tạo mới cấu hình hệ thống
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               settingKey:
   *                 type: string
   *                 example: "MAX_PARKING_CAPACITY"
   *               settingValue:
   *                 type: string
   *                 example: "500"
   *     responses:
   *       200:
   *         description: Cập nhật thành công
   */
  static async updateConfig(req: AuthRequest, res: Response) {
    try {
      const configData = req.body;
      const userId = req.user?.id || 'system'; 

      // Iteratively update all keys provided in the body
      const keys = Object.keys(configData);
      for (const key of keys) {
        await SystemAdminService.updateConfig(key, configData[key]);
      }

      await AuditLog.create({
        action: 'UPDATE_SYSTEM_CONFIG',
        userId: userId,
        targetResource: `SystemConfig_ALL`,
        details: { keysUpdated: keys }
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật cấu hình hệ thống thành công'
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * @openapi
   * /api/admin/pricing:
   *   put:
   *     tags:
   *       - System Admin
   *     summary: Cập nhật bảng giá giữ xe
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               vehicleType:
   *                 type: string
   *                 example: "CAR"
   *               dayRate:
   *                 type: number
   *                 example: 3000
   *               nightOrSundayRate:
   *                 type: number
   *                 example: 5000
   *     responses:
   *       200:
   *         description: Cập nhật thành công
   */
  static async updatePricing(req: AuthRequest, res: Response) {
    try {
      const { 
        userRole, 
        vehicleType, 
        calculationType, 
        billingIntervalMinutes,
        specialRules,
        discountPercent,
      } = req.body;
      const userId = req.user?.id || 'system';

      if (!userRole || !vehicleType) {
        throw new Error('Cần xác định đối tượng (userRole) và loại xe (vehicleType)');
      }

      const result = await SystemAdminService.updatePricing(userRole, vehicleType, {
        calculationType, 
        billingIntervalMinutes,
        specialRules,
        discountPercent,
      });

      await AuditLog.create({
        action: 'UPDATE_PRICE',
        userId: userId,
        targetResource: `PricingPolicy_${userRole}_${vehicleType}`
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
      
      // Transform array of {settingKey, settingValue} to a single object
      const configObj: Record<string, any> = {};
      configs.forEach(c => {
        configObj[c.settingKey] = c.settingValue;
      });

      // Default values for missing keys
      const defaults = {
        occupancyThresholdPercent: 90,
        iotDeviceTimeoutSeconds: 60,
        syncIntervalSeconds: 30,
        enableOccupancyAlerts: true,
        enableIotTimeoutMonitoring: true,
        hotlineSupport: "028-3865-1234",
        alertEmail: "parking-alerts@hcmut.edu.vn",
        enableEmailAlerts: false,
        pricingCycleDays: 30
      };

      const finalConfig = { ...defaults, ...configObj };

      res.status(200).json({ success: true, data: finalConfig });
    } catch (error: any) { 
      res.status(500).json({ success: false, message: error.message });
    }
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