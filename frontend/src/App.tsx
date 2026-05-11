import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ParkingMapPage } from "@/pages/ParkingMapPage";
import { SupportPage } from "@/pages/SupportPage";
import { MonitoringPage } from "@/pages/MonitoringPage";
import { BarrierControlPage } from "@/pages/BarrierControlPage";
import { CardProcessingPage } from "@/pages/CardProcessingPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { LayoutMappingPage } from "@/pages/LayoutMappingPage";
import { IoTDevicesPage } from "@/pages/IoTDevicesPage";
import { PermissionsPage } from "@/pages/PermissionsPage";
import { AuditLogPage } from "@/pages/AuditLogPage";
import { SystemConfigPage } from "@/pages/SystemConfigPage";
import { PricingPolicyPage } from "@/pages/PricingPolicyPage";
import { FeeReconciliationPage } from "@/pages/FeeReconciliationPage";
import { RevenueStatusPage } from "@/pages/RevenueStatusPage";
import { ActivityStatsPage } from "@/pages/ActivityStatsPage";
import { AdminSessionsPage } from "@/pages/AdminSessionsPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="parking-map" element={<ParkingMapPage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="barrier-control" element={<BarrierControlPage />} />
            <Route path="card-processing" element={<CardProcessingPage />} />
            <Route path="admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="layout-mapping" element={<LayoutMappingPage />} />
            <Route path="iot-devices" element={<IoTDevicesPage />} />
            <Route path="permissions" element={<PermissionsPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="system-config" element={<SystemConfigPage />} />
            <Route path="pricing-policy" element={<PricingPolicyPage />} />
            <Route path="fee-reconciliation" element={<FeeReconciliationPage />} />
            <Route path="revenue-status" element={<RevenueStatusPage />} />
            <Route path="admin-sessions" element={<AdminSessionsPage />} />
            <Route path="activity-stats" element={<ActivityStatsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="learning" element={<PlaceholderPage />} />
            <Route path="reservations" element={<PlaceholderPage />} />
            <Route path="analytics" element={<RevenueStatusPage />} />
            <Route path="users" element={<PlaceholderPage />} />
            <Route path="settings" element={<PlaceholderPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
