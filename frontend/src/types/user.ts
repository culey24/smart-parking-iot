import type { UserRole } from "./roles";

export type CardStatus = "Active" | "Inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  cardStatus?: CardStatus;
}
