import type { PermissionsUser } from "@/types/permissions";
import type { UserRole } from "@/types/roles";
import { apiFetch } from "@/config/api";

export async function getPermissionsUsers(): Promise<PermissionsUser[]> {
  return apiFetch<PermissionsUser[]>("/api/users");
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await apiFetch(`/api/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}
