import { useLocation } from "react-router-dom";

const PATH_TITLES: Record<string, string> = {
  "/learning": "Learning",
  "/parking": "Parking Lot",
  "/reservations": "Reservations",
  "/analytics": "Analytics",
  "/users": "User Management",
  "/settings": "Settings",
  "/barrier-control": "Barrier Control",
  "/card-processing": "Card Processing",
  "/admin-dashboard": "Admin Dashboard",
  "/layout-mapping": "Layout Mapping",
  "/iot-devices": "IoT Devices",
  "/permissions": "Permissions",
  "/audit-log": "Audit Log",
  "/system-config": "System Configuration",
  "/pricing-policy": "Pricing Policy",
  "/fee-reconciliation": "Fee Reconciliation",
  "/revenue-status": "Revenue Status",
  "/activity-stats": "Activity Statistics",
};

export function PlaceholderPage() {
  const { pathname } = useLocation();
  const title = PATH_TITLES[pathname] ?? "Page";
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#003087]">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        This page will be developed later.
      </p>
    </div>
  );
}
