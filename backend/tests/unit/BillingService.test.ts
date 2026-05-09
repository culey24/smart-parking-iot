import { BillingService } from '../../src/services/BillingService';
import { PricingPolicy } from '../../src/models/PricingPolicy';

// Giả lập (Mock) Model PricingPolicy
jest.mock('../../src/models/PricingPolicy');

describe('BillingService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateFee', () => {
    const mockPolicy = {
      dayRate: 2000,
      nightOrSundayRate: 3000
    };

    it('Should return 3000 VND if the vehicle is picked up on a Sunday (regardless of the time)', async () => {
      // Ép kiểu mock function cho TypeScript khỏi báo lỗi
      (PricingPolicy.findOne as jest.Mock).mockResolvedValue(mockPolicy);

      const sundayDate = new Date('2026-05-10T10:00:00');
      const fee = await BillingService.calculateFee(sundayDate, 'MOTORBIKE');

      expect(fee).toBe(3000);
      expect(PricingPolicy.findOne).toHaveBeenCalledTimes(1);
    });

    it('Should return 3000 VND if the vehicle is picked up from 18:00 onwards (Monday - Saturday)', async () => {
      (PricingPolicy.findOne as jest.Mock).mockResolvedValue(mockPolicy);

      const mondayNightDate = new Date('2026-05-11T18:30:00');
      const fee = await BillingService.calculateFee(mondayNightDate, 'MOTORBIKE');

      expect(fee).toBe(3000);
    });

    it('Should return 2000 VND if the vehicle is picked up before 18:00 (Monday - Saturday)', async () => {
      (PricingPolicy.findOne as jest.Mock).mockResolvedValue(mockPolicy);

      const mondayAfternoonDate = new Date('2026-05-11T15:00:00');
      const fee = await BillingService.calculateFee(mondayAfternoonDate, 'MOTORBIKE');

      expect(fee).toBe(2000);
    });

    it('Should throw an error if no ACTIVE PricingPolicy is found', async () => {
      (PricingPolicy.findOne as jest.Mock).mockResolvedValue(null);
      const someDate = new Date('2026-05-11T15:00:00');

      await expect(BillingService.calculateFee(someDate, 'MOTORBIKE')).rejects.toThrow();
    });
  });

  describe('calculateCycleFee', () => {
    it('Should calculate the total fee accurately for 100 users, with each user having 30-35 sessions', () => {
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

    it('Should accurately accumulate the total from the fee fields', () => {
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

    it('Should return 0 if the array is empty', () => {
      const total = BillingService.calculateCycleFee([]);
      expect(total).toBe(0);
    });
  });
});