/**
 * Pricing policy service – Finance Office config.
 * Replace with API when backend is ready.
 */

import type { PricingPolicyConfig } from "@/types/pricingPolicy";
import { appendAuditLog } from "@/services/auditLogService";
import pricingData from "@/data/pricingPolicyData.json";

let config = JSON.parse(JSON.stringify(pricingData)) as PricingPolicyConfig;

export async function getPricingPolicy(): Promise<PricingPolicyConfig> {
  return JSON.parse(JSON.stringify(config));
}

export async function savePricingPolicy(
  data: PricingPolicyConfig,
  actor: string
): Promise<void> {
  config = JSON.parse(JSON.stringify(data));
  await appendAuditLog(
    actor,
    "updated pricing policy",
    "Pricing config – Learner, Faculty/Staff, Visitor"
  );
}
