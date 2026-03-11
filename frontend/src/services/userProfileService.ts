/**
 * User profile service (HCMUT_DATACORE).
 * Currently loads from JSON. Replace with API/DB calls when backend is ready.
 */

import type { UserProfileRecord } from "@/types/api";
import userProfileData from "@/data/userProfile.json";

/** Get user profile from HCMUT datacore */
export async function getUserProfile(
  _userId?: string
): Promise<UserProfileRecord> {
  // TODO: Replace with: const res = await fetch(`/api/users/${userId}/profile`); return res.json();
  return userProfileData as UserProfileRecord;
}
