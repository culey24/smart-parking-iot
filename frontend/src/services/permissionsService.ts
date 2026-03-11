/**
 * Permissions service – user list from HCMUT_DATACORE.
 * Replace with API when backend is ready.
 */

import type { PermissionsUser } from "@/types/permissions";
import type { UserRole } from "@/types/roles";
import permissionsData from "@/data/permissionsData.json";

const users = permissionsData as PermissionsUser[];

export async function getPermissionsUsers(): Promise<PermissionsUser[]> {
  return [...users];
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<void> {
  const u = users.find((x) => x.id === userId);
  if (u) u.role = role;
}
