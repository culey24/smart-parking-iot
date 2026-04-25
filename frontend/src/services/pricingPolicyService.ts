import type { PricingPolicyConfig } from "@/types/pricingPolicy";
import { apiFetch } from "@/config/api";

export async function getPricingPolicy(): Promise<PricingPolicyConfig> {
  return apiFetch<PricingPolicyConfig>("/api/pricing-policy");
}

export async function savePricingPolicy(
  data: PricingPolicyConfig,
  actor: string
): Promise<void> {
  await apiFetch("/api/pricing-policy", {
    method: "PUT",
    body: JSON.stringify({ policies: data, actor }),
  });
}
