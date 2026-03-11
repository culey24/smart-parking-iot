/**
 * User roles - có thể mở rộng từ backend sau này
 */
export type UserRole = "LEARNER" | "FACULTY" | "OPERATOR" | "ADMIN" | "IT_TEAM" | "FINANCE" | "SUPER";

/** Roles assignable by admin in Permissions screen */
export const ASSIGNABLE_ROLES: UserRole[] = ["OPERATOR", "ADMIN", "IT_TEAM", "FINANCE"];

export const ROLES: Record<string, UserRole> = {
  LEARNER: "LEARNER",
  FACULTY: "FACULTY",
  OPERATOR: "OPERATOR",
  ADMIN: "ADMIN",
  IT_TEAM: "IT_TEAM",
  FINANCE: "FINANCE",
  SUPER: "SUPER",
} as const;
