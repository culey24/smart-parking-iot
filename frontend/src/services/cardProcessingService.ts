import type { CardLookupResult } from "@/types/cardProcessing";
import { apiFetch } from "@/config/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/** Lookup current parking session by license plate */
export async function lookupByLicensePlate(
  licensePlate: string
): Promise<CardLookupResult | null> {
  const plate = encodeURIComponent(licensePlate.trim().toUpperCase());
  const res = await apiFetch<ApiResponse<CardLookupResult | null>>(`/api/cards/lookup?plate=${plate}`);
  return res.data;
}

/** Disable the linked card */
export async function disableLinkedCard(cardId: string): Promise<void> {
  await apiFetch(`/api/cards/${cardId}/disable`, { method: "PUT" });
}
