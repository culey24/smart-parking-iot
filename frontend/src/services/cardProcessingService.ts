import type { CardLookupResult } from "@/types/cardProcessing";
import { apiFetch } from "@/config/api";

/** Lookup current parking session by license plate */
export async function lookupByLicensePlate(
  licensePlate: string
): Promise<CardLookupResult | null> {
  const plate = encodeURIComponent(licensePlate.trim().toUpperCase());
  return apiFetch<CardLookupResult | null>(`/api/cards/lookup?plate=${plate}`);
}

/** Disable the linked card */
export async function disableLinkedCard(cardId: string): Promise<void> {
  await apiFetch(`/api/cards/${cardId}/disable`, { method: "PUT" });
}
