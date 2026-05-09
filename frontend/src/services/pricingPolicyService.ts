import type { PricingPolicy, PricingPolicyConfig } from "@/types/pricingPolicy";
import { apiFetch } from "@/config/api";

export async function getPricingPolicy(): Promise<PricingPolicyConfig> {
  // Backend returns { success: true, data: pricing } where pricing is IPricingPolicy[]
  const res = await apiFetch<{ success: boolean; data: PricingPolicyConfig }>("/api/admin/pricing");
  return res.data || [];
}

export async function savePricingPolicy(
  data: PricingPolicy
): Promise<void> {
  // We don't send the actor in the body for the pricing policy update endpoint
  // because the backend SystemAdminController.updatePricing doesn't read it (it reads req.user.id).
  // It only expects vehicleType, dayRate, nightOrSundayRate.
  await apiFetch("/api/admin/pricing", {
    method: "PUT",
    body: JSON.stringify({
      vehicleType: data.vehicleType,
      dayRate: data.dayRate,
      nightOrSundayRate: data.nightOrSundayRate,
    }),
  });
}
