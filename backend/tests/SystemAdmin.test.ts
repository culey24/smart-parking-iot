import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';

// Kéo Models vào để kiểm soát
import { PricingPolicy } from '../src/models/PricingPolicy';
import { SystemConfig } from '../src/models/SystemConfig';
import { AuditLog } from '../src/models/AuditLog';

// Mock toàn bộ các Models liên quan đến Task 7
jest.mock('../src/models/PricingPolicy');
jest.mock('../src/models/SystemConfig');
jest.mock('../src/models/AuditLog');

describe('Test Task 7: System Admin & Error Handling', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(() => {
    // Token xịn của ADMIN
    adminToken = jwt.sign({ id: 'admin_123', role: 'ADMIN' }, process.env.JWT_SECRET || 'secret');
    // Token "cùi" của sinh viên bình thường để test phân quyền
    userToken = jwt.sign({ id: 'user_456', role: 'USER' }, process.env.JWT_SECRET || 'secret');
  });

  afterEach(() => {
    jest.clearAllMocks(); // Dọn dẹp chiến trường sau mỗi bài test
  });

  // ==========================================
  // SUITE 1: API Cập nhật bảng giá (Pricing Policy)
  // ==========================================
  describe('PUT /api/admin/pricing', () => {

    it('1. [Happy Path] Nên cập nhật bảng giá và sinh ra 1 record AuditLog', async () => {
      (PricingPolicy.findOneAndUpdate as jest.Mock).mockResolvedValue({
        vehicleType: 'CAR',
        baseRate: 25000,
      });
      (AuditLog.create as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .put('/api/admin/pricing')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vehicleType: 'CAR',
          baseRate: 25000,
          hourlyRate: 12000,
          monthlyRate: 600000
        });

      expect(response.status).toBe(200);
      expect(PricingPolicy.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(AuditLog.create).toHaveBeenCalledTimes(1);
      expect(AuditLog.create).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE_PRICE' }));
    });

    it('2. [Corner Case] Nên trả về status 500 khi cố tình gửi thiếu vehicleType', async () => {
      const response = await request(app)
        .put('/api/admin/pricing')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ baseRate: 20000 }); // Thiếu vehicleType

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cần xác định loại xe (vehicleType)');
    });

    it('3. [Corner Case] Nên chặn (Status 403) nếu người dùng có Role là USER', async () => {
      const response = await request(app)
        .put('/api/admin/pricing')
        .set('Authorization', `Bearer ${userToken}`) // Dùng token của USER
        .send({ vehicleType: 'CAR', baseRate: 10000 });

      // Kì vọng roleMiddleware sẽ đá văng ra
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
      // Kì vọng DB hoàn toàn không bị đụng tới
      expect(PricingPolicy.findOneAndUpdate).not.toHaveBeenCalled(); 
    });

    it('4. [Corner Case] Nên chặn (Status 401) nếu quên gửi Token', async () => {
      const response = await request(app)
        .put('/api/admin/pricing')
        .send({ vehicleType: 'CAR', baseRate: 10000 }); // Không set Header Authorization

      // Kì vọng authMiddleware đá văng
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('5. [Corner Case] Nên bắt được lỗi 500 nếu DB bị Crash lúc đang ghi AuditLog', async () => {
      // Bảng giá lưu thành công
      (PricingPolicy.findOneAndUpdate as jest.Mock).mockResolvedValue({ vehicleType: 'CAR' });
      // Nhưng lúc ghi Log thì DB đứt cáp
      (AuditLog.create as jest.Mock).mockRejectedValue(new Error('MongoDB Connection Lost'));

      const response = await request(app)
        .put('/api/admin/pricing')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ vehicleType: 'CAR', baseRate: 10000 });

      // Kì vọng errorHandler.ts chộp được cái lỗi rớt mạng này
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('MongoDB Connection Lost');
    });
  });

  // ==========================================
  // SUITE 2: API Cập nhật cấu hình hệ thống (System Config)
  // ==========================================
  describe('PUT /api/admin/config', () => {

    it('1. [Happy Path] Nên cập nhật Config và sinh AuditLog', async () => {
      (SystemConfig.findOneAndUpdate as jest.Mock).mockResolvedValue({ settingKey: 'MAX_CAPACITY' });
      (AuditLog.create as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .put('/api/admin/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          settingKey: 'MAX_CAPACITY',
          settingValue: 500
        });

      expect(response.status).toBe(200);
      expect(SystemConfig.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('2. [Corner Case] Nên báo lỗi nếu gửi thiếu thông tin cấu hình', async () => {
      const response = await request(app)
        .put('/api/admin/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ settingKey: 'MAX_CAPACITY' }); // Cố tình quên gửi settingValue

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Thiếu thông tin settingKey hoặc settingValue');
    });

    it('nên cho phép FINANCE_OFFICE cập nhật bảng giá', async () => {
      // Tạo token giả cho Finance
      const financeToken = jwt.sign({ id: 'fin_001', role: 'FINANCE_OFFICE' }, 'secret');
  
      const response = await request(app)
        .put('/api/admin/pricing')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({ vehicleType: 'CAR', baseRate: 30000 });

      expect(response.status).toBe(200); // Phải trả về 200 OK
    });
  });
});