import type { UserProfileRecord } from "@/types/api";
import { apiFetch } from "@/config/api";

/** Get user profile from HCMUT datacore */
export async function getUserProfile(userId: string): Promise<UserProfileRecord | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: UserProfileRecord }>(`/api/users/${userId}/profile`);
    return res.data ?? null;
  } catch {
    return null;
  }
}
