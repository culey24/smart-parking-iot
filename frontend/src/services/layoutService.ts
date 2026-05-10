import { apiFetch } from "../config/api";
import type { PlacedDevice } from "../types/layoutMapping";

const API_PATH = "/api/layout";

export const layoutService = {
  getMapping: async (facilityId: string = "CAMPUS_PARKING_ALPHA"): Promise<{ layout: PlacedDevice[] }> => {
    try {
      const data = await apiFetch<{ layout: PlacedDevice[] }>(`${API_PATH}/mapping?facilityId=${facilityId}`);
      return data;
    } catch (e) {
      console.error("Layout fetch failed:", e);
      return { layout: [] };
    }
  },

  updateMapping: async (layout: PlacedDevice[], facilityId: string = "CAMPUS_PARKING_ALPHA") => {
    return apiFetch(`${API_PATH}/mapping`, {
      method: "POST",
      body: JSON.stringify({ layout, facilityId }),
    });
  }
};
