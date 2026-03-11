import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BarChart3,
  ParkingCircle,
  History,
  User,
  Activity,
  CreditCard,
  ShieldAlert,
  Map,
  Cpu,
  Shield,
  FileText,
  SlidersHorizontal,
  Banknote,
} from "lucide-react";
import type { UserRole } from "@/types/roles";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  /** Các vai trò được phép truy cập mục này */
  roles: UserRole[];
  /** Mục con (nested) */
  children?: NavItem[];
}

/**
 * Cấu hình navigation - render động theo vai trò người dùng.
 * Có thể fetch từ backend API sau này.
 */
export const navigationConfig: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    roles: ["LEARNER", "FACULTY", "OPERATOR", "ADMIN"],
    children: [
      {
        label: "Parking History",
        icon: History,
        path: "/history",
        roles: ["LEARNER", "FACULTY", "OPERATOR", "ADMIN", "SUPER"],
      },
      {
        label: "Personal Info",
        icon: User,
        path: "/profile",
        roles: ["LEARNER", "FACULTY", "OPERATOR", "ADMIN", "SUPER"],
      },
    ],
  },
  {
    label: "Live Monitoring",
    icon: Activity,
    path: "/monitoring",
    roles: ["OPERATOR", "ADMIN", "SUPER"],
    children: [
      {
        label: "Barrier Control",
        icon: ParkingCircle,
        path: "/barrier-control",
        roles: ["OPERATOR", "ADMIN", "SUPER"],
      },
      {
        label: "Card Processing",
        icon: CreditCard,
        path: "/card-processing",
        roles: ["OPERATOR", "ADMIN", "SUPER"],
      },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/revenue-status",
    roles: ["OPERATOR", "ADMIN", "SUPER"],
    children: [
      {
        label: "Revenue Status",
        icon: BarChart3,
        path: "/revenue-status",
        roles: ["OPERATOR", "ADMIN", "SUPER"],
      },
      {
        label: "Activity Stats",
        icon: Activity,
        path: "/activity-stats",
        roles: ["OPERATOR", "ADMIN", "SUPER"],
      },
    ],
  },
  {
    label: "Pricing",
    icon: Banknote,
    path: "/pricing-policy",
    roles: ["ADMIN", "FINANCE", "SUPER"],
    children: [
      {
        label: "Pricing Policy",
        icon: Banknote,
        path: "/pricing-policy",
        roles: ["ADMIN", "FINANCE", "SUPER"],
      },
      {
        label: "Fee Reconciliation",
        icon: CreditCard,
        path: "/fee-reconciliation",
        roles: ["ADMIN", "FINANCE", "SUPER"],
      },
    ],
  },
  {
    label: "Admin Dashboard",
    icon: ShieldAlert,
    path: "/admin-dashboard",
    roles: ["ADMIN", "IT_TEAM", "FINANCE", "SUPER"],
    children: [
      {
        label: "Layout Mapping",
        icon: Map,
        path: "/layout-mapping",
        roles: ["ADMIN", "IT_TEAM", "SUPER"],
      },
      {
        label: "IoT Devices",
        icon: Cpu,
        path: "/iot-devices",
        roles: ["ADMIN", "IT_TEAM", "SUPER"],
      },
      {
        label: "Permissions",
        icon: Shield,
        path: "/permissions",
        roles: ["ADMIN", "SUPER"],
      },
      {
        label: "Audit Log",
        icon: FileText,
        path: "/audit-log",
        roles: ["ADMIN", "IT_TEAM", "SUPER"],
      },
      {
        label: "System Config",
        icon: SlidersHorizontal,
        path: "/system-config",
        roles: ["ADMIN", "SUPER"],
      },
    ],
  },
];

/**
 * Lọc các mục navigation theo vai trò người dùng.
 * SUPER có quyền truy cập tất cả.
 * Lọc cả parent và children theo roles.
 */
export function getNavItemsForRole(role: UserRole): NavItem[] {
  const hasAccess = (roles: UserRole[]) =>
    role === "SUPER" || roles.includes(role);
  return navigationConfig
    .filter((item) => hasAccess(item.roles))
    .map((item) => ({
      ...item,
      children: item.children?.filter((c) => hasAccess(c.roles)),
    }));
}
