/**
 * Card processing service for lost card handling.
 * Currently loads from JSON. Replace with API when backend is ready.
 */

import type { CardLookupResult } from "@/types/cardProcessing";
import cardLookupData from "@/data/cardLookupData.json";

const data = cardLookupData as unknown as Record<string, CardLookupResult>;

/** Lookup current parking session by license plate */
export async function lookupByLicensePlate(
  licensePlate: string
): Promise<CardLookupResult | null> {
  // TODO: Replace with: const res = await fetch(`/api/cards/lookup?plate=${encodeURIComponent(licensePlate)}`); return res.json();
  const normalized = licensePlate.trim().toUpperCase().replace(/\s/g, "");
  const key = Object.keys(data).find(
    (k) => k.replace(/\s/g, "").toUpperCase() === normalized
  );
  return key ? { ...data[key] } : null;
}

/** Disable the linked card */
export async function disableLinkedCard(
  licensePlate: string
): Promise<void> {
  // TODO: Replace with API call
  const normalized = licensePlate.trim().toUpperCase().replace(/\s/g, "");
  const key = Object.keys(data).find(
    (k) => k.replace(/\s/g, "").toUpperCase() === normalized
  );
  if (key && data[key]) {
    data[key].linkedCard.status = "Disabled";
  }
}
