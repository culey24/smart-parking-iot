import type { UserProfileRecord } from "@/types/api";
import { apiFetch } from "@/config/api";

/** Get user profile from HCMUT datacore */
export async function getUserProfile(userId: string): Promise<UserProfileRecord> {
  return apiFetch<UserProfileRecord>(`/api/users/${userId}/profile`);
}
