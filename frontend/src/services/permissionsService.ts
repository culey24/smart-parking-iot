import type { PermissionsUser } from "@/types/permissions";
import type { UserRole } from "@/types/roles";
import { apiFetch } from "@/config/api";

export async function getPermissionsUsers(): Promise<PermissionsUser[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: any[] }>("/api/users");
    const users = res.data ?? [];
    
    // Map backend User model to frontend PermissionsUser interface
    return users.map(u => ({
      id: u.userId, // Map userId to id to fix the "all users update" bug
      name: u.fullName,
      email: u.email,
      mssvMscb: u.schoolCardId?.toString() || u.userId,
      role: u.role === 'FINANCE_OFFICE' ? 'FINANCE' : u.role,
      // Mock data for HCMUT fields as they aren't in the base User model yet
      faculty: "Information Technology",
      country: "Vietnam",
      province: "Ho Chi Minh City",
      timezone: "Asia/Ho_Chi_Minh",
    }));
  } catch {
    return [];
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await apiFetch(`/api/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}
