import type { UserRole } from "./roles";

/** User account from HCMUT_DATACORE for permissions management */
export interface PermissionsUser {
  id: string;
  name: string;
  email: string;
  mssvMscb: string; // MSSV for students, MSCB for staff
  faculty: string;
  country: string;
  province: string;
  timezone: string;
  role: UserRole;
}
