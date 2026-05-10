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
  await apiFetch("/api/admin/pricing", {
    method: "PUT",
    body: JSON.stringify({
      userRole: data.userRole,
      vehicleType: data.vehicleType,
      calculationType: data.calculationType,
      billingIntervalMinutes: data.billingIntervalMinutes,
      specialRules: data.specialRules,
      discountPercent: data.discountPercent,
    }),
  });
}
