import { SystemConfig, ISystemConfig } from '../models/SystemConfig';
import { PricingPolicy, IPricingPolicy } from '../models/PricingPolicy';
import { AuditLog, IAuditLog } from '../models/AuditLog';

export class SystemAdminService {
  
  // Trả về mảng các ISystemConfig, dùng .lean() để tăng tốc độ
  static async getAllConfigs(): Promise<ISystemConfig[]> {
    return await SystemConfig.find().lean();
  }

  static async updateConfig(settingKey: string, settingValue: any): Promise<ISystemConfig | null> {
    return await SystemConfig.findOneAndUpdate(
      { settingKey }, 
      { settingValue },
      { new: true, upsert: true } 
    );
  }

  // Thay vì dùng (newRates: any), dùng Partial<IPricingPolicy> để TypeScript hiểu đây là 1 phần của bảng giá
  static async updatePricing(vehicleType: string, newRates: Partial<IPricingPolicy>): Promise<IPricingPolicy | null> {
    return await PricingPolicy.findOneAndUpdate(
      { vehicleType },
      { ...newRates, effectiveDate: new Date() },
      { new: true, upsert: true }
    );
  }

  static async getPricingPolicies(): Promise<IPricingPolicy[]> {
    return await PricingPolicy.find().lean();
  }

  // Tra cứu log thường rất nhiều, nên thêm .limit(100) để tránh bị tràn RAM server
  static async getAuditLogs(): Promise<IAuditLog[]> {
    return await AuditLog.find().sort({ timestamp: -1 }).limit(100).lean();
  }
}