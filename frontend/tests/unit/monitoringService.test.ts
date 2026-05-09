import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMonitoringData } from "../../src/services/monitoringService";
import { apiFetch } from "../../src/config/api";

vi.mock("../../src/config/api", () => ({
  apiFetch: vi.fn(),
}));

describe("monitoringService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch monitoring data from correct endpoint", async () => {
    const mockData = {
      slots: [],
      devices: [],
      alerts: []
    };
    (apiFetch as any).mockResolvedValue(mockData);

    const result = await getMonitoringData();

    expect(apiFetch).toHaveBeenCalledWith("/api/monitoring/live");
    expect(result).toEqual(mockData);
  });
});
