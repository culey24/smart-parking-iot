import { BillingService } from '../src/services/BillingService';
import { PricingPolicy } from '../src/models/PricingPolicy';

// Giả lập (Mock) Model PricingPolicy
jest.mock('../src/models/PricingPolicy');

describe('BillingService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateFee', () => {
    const mockPolicy = {
      dayRate: 2000,
      nightOrSundayRate: 3000
    };

    it('Nên trả về 3000đ nếu lấy xe vào ngày Chủ nhật (bất kể giờ nào)', async () => {
      // Ép kiểu mock function cho TypeScript khỏi báo lỗi
      (PricingPolicy.findOne as jest.Mock).mockResolvedValue(mockPolicy);
      
      const sundayDate = new Date('2026-05-10T10:00:00'); 
      const fee = await BillingService.calculateFee(sundayDate, 'MOTORBIKE');
      
      expect(fee).toBe(3000);
      expect(PricingPolicy.findOne).toHaveBeenCalledTimes(1);
    });

    it('Nên trả về 3000đ nếu lấy xe từ 18:00 trở đi (Thứ 2 - Thứ 7)', async () => {
      (PricingPolicy.findOne as jest.Mock).mockResolvedValue(mockPolicy);
      
      const mondayNightDate = new Date('2026-05-11T18:30:00'); 
      const fee = await BillingService.calculateFee(mondayNightDate, 'MOTORBIKE');
      
      expect(fee).toBe(3000);
    });

    it('Nên trả về 2000đ nếu lấy xe trước 18:00 (Thứ 2 - Thứ 7)', async () => {
      (PricingPolicy.findOne as jest.Mock).mockResolvedValue(mockPolicy);
      
      const mondayAfternoonDate = new Date('2026-05-11T15:00:00'); 
      const fee = await BillingService.calculateFee(mondayAfternoonDate, 'MOTORBIKE');
      
      expect(fee).toBe(2000);
    });

    it('Nên ném lỗi nếu không tìm thấy PricingPolicy (ACTIVE)', async () => {
      (PricingPolicy.findOne as jest.Mock).mockResolvedValue(null);
      const someDate = new Date('2026-05-11T15:00:00');
      
      await expect(BillingService.calculateFee(someDate, 'MOTORBIKE')).rejects.toThrow();
    });
  });

  describe('calculateCycleFee', () => {
    it('Nên tính toán chính xác tổng phí cho 100 user, mỗi user có 30-35 lượt gửi', () => {
      const mockUsers = Array.from({ length: 100 }, (_, i) => `SV_${i + 1}`);

      mockUsers.forEach(userId => {
        const mockSessions = [];
        let expectedTotalFee = 0;

        const sessionCount = Math.floor(Math.random() * 6) + 30; 

        for (let i = 0; i < sessionCount; i++) {
          const fee = Math.random() > 0.3 ? 3000 : 2000;
          mockSessions.push({ subjectId: userId, fee: fee });
          expectedTotalFee += fee; 
        }

        const calculatedTotal = BillingService.calculateCycleFee(mockSessions);

        // --- ĐOẠN CODE THÊM VÀO ĐỂ XEM OUTPUT ---
        if (userId === 'SV_1' || userId === 'SV_25' || userId === 'SV_50') {
          console.log(`👤 User: ${userId} | Số lượt gửi: ${sessionCount} | Output Service: ${calculatedTotal}đ | Output Kỳ vọng: ${expectedTotalFee}đ`);
        }
        // ----------------------------------------

        expect(calculatedTotal).toBe(expectedTotalFee);
      });
    });

    it('Nên tính tổng cộng dồn các trường fee chính xác', () => {
      const mockSessions = [
        { fee: 2000 },
        { fee: 3000 },
        { fee: 2000 },
        { fee: 0 },
        {} // Session mất dữ liệu fee
      ];

      const total = BillingService.calculateCycleFee(mockSessions);
      expect(total).toBe(7000);
    });

    it('Nên trả về 0 nếu mảng rỗng', () => {
      const total = BillingService.calculateCycleFee([]);
      expect(total).toBe(0);
    });
  });
});