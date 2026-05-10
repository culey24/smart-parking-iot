import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPricingPolicy, savePricingPolicy } from '../../src/services/pricingPolicyService';
import { apiFetch } from '../../src/config/api';

// Mock the apiFetch function
vi.mock('../../src/config/api', () => ({
  apiFetch: vi.fn(),
}));

describe('pricingPolicyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPricingPolicy', () => {
    it('should return data from apiFetch', async () => {
      const mockData = [
        { vehicleType: 'CAR', dayRate: 2000, nightOrSundayRate: 3000, status: 'ACTIVE' },
      ];
      (apiFetch as any).mockResolvedValue({ success: true, data: mockData });

      const result = await getPricingPolicy();

      expect(apiFetch).toHaveBeenCalledWith('/api/admin/pricing');
      expect(result).toEqual(mockData);
    });

    it('should return empty array if data is missing', async () => {
      (apiFetch as any).mockResolvedValue({ success: true });

      const result = await getPricingPolicy();

      expect(result).toEqual([]);
    });
  });

  describe('savePricingPolicy', () => {
    it('should call apiFetch with PUT method and correct body', async () => {
      const policy = {
        vehicleType: 'MOTORBIKE',
        dayRate: 1000,
        nightOrSundayRate: 2000,
        status: 'ACTIVE',
      } as any;
      (apiFetch as any).mockResolvedValue({ success: true });

      await savePricingPolicy(policy);

      expect(apiFetch).toHaveBeenCalledWith('/api/admin/pricing', {
        method: 'PUT',
        body: JSON.stringify({
          vehicleType: 'MOTORBIKE',
          dayRate: 1000,
          nightOrSundayRate: 2000,
        }),
      });
    });
  });
});
