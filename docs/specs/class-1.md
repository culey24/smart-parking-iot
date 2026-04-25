# Bổ sung thiết kế lớp (Models & Controllers) từ Frontend Admin

Dựa trên cấu trúc API được sử dụng trong giao diện Dashboard/Admin của Frontend, đây là các Class bổ sung cần được thiết kế ở phía Backend để đáp ứng yêu cầu.

---

## 1. Nhóm Entity Classes (Database Models)

### # Class: SystemConfig
**Mô tả:** Lưu trữ các cấu hình động của hệ thống (VD: Thời gian chờ thẻ, số lượng xe tối đa, trạng thái bảo trì).
**Cách khởi tạo (Init):** Được load lên Cache khi server startup và được cập nhật thông qua Admin Dashboard.
**Attributes:**
+ configId: String
+ settingKey: String
+ settingValue: Any
+ lastUpdated: DateTime
**Methods:**
- updateConfig()
- getConfig()

### # Class: PricingPolicy
**Mô tả:** Định nghĩa các mức giá cho từng loại xe (xe máy, ô tô) theo từng chu kỳ (giờ, ngày, tháng).
**Cách khởi tạo (Init):** Fetch từ DB khi BillingService cần tính phí. Có thể được cache lại.
**Attributes:**
+ policyId: String
+ vehicleType: Enum(MOTORBIKE, CAR, BICYCLE)
+ baseRate: Number
+ hourlyRate: Number
+ monthlyRate: Number
+ effectiveDate: DateTime
**Methods:**
- calculateFee(duration: int): Number
- updatePolicy()

### # Class: AuditLog
**Mô tả:** Lưu vết (log) mọi thao tác thay đổi quan trọng trong hệ thống (VD: Admin mở barrier thủ công, cập nhật giá).
**Cách khởi tạo (Init):** Được khởi tạo (new) mỗi khi có một thay đổi dữ liệu hoặc hành động nhạy cảm xảy ra ở Controller/Service.
**Attributes:**
+ logId: String
+ timestamp: DateTime
+ userId: String
+ action: String
+ targetResource: String
+ details: JSON
**Methods:**
- createLog()
- fetchLogs(limit: int, offset: int)

### # Class: InfrastructureAlert
**Mô tả:** Cảnh báo liên quan đến hạ tầng kỹ thuật (cảm biến mất kết nối, gateway hỏng).
**Cách khởi tạo (Init):** Được hệ thống IoTDataController tự động khởi tạo khi phát hiện thiết bị quá thời gian ping hoặc gửi mã lỗi.
**Attributes:**
+ alertId: String
+ deviceId: String
+ alertType: Enum(OFFLINE, ERROR, WARNING)
+ message: String
+ status: Enum(ACTIVE, RESOLVED)
+ timestamp: DateTime
**Methods:**
- triggerAlert()
- resolveAlert()

### # Class: ReconciliationRequest
**Mô tả:** Đại diện cho một phiên yêu cầu đối soát số liệu giao dịch giữa hệ thống bãi xe (SPMS) và Cổng thanh toán (BKPay).
**Cách khởi tạo (Init):** Được sinh tự động vào mỗi cuối chu kỳ (ví dụ cuối ngày/cuối tuần) hoặc do Kế toán tạo thủ công.
**Attributes:**
+ requestId: String
+ date: Date
+ totalSPMS: Number
+ totalBKPay: Number
+ status: Enum(PENDING, MATCHED, DISCREPANCY)
**Methods:**
- startReconciliation()
- approveReconciliation()

### # Class: Gate
**Mô tả:** Đại diện cho một cổng ra/vào (Barrier) vật lý.
**Cách khởi tạo (Init):** Khởi tạo sẵn trong DB (Data Seeding).
**Attributes:**
+ gateId: String
+ gateName: String
+ type: Enum(ENTRY, EXIT)
+ ipAddress: String
+ status: Enum(ONLINE, OFFLINE)
**Methods:**
- openGate()
- closeGate()
- checkStatus()

### # Class: IoTDevice
**Mô tả:** Thiết bị cảm biến hoặc Gateway gửi dữ liệu chỗ trống.
**Cách khởi tạo (Init):** Lưu sẵn trong DB.
**Attributes:**
+ deviceId: String
+ zoneId: String
+ deviceType: Enum(SENSOR, GATEWAY, LED_SIGN)
+ lastPing: DateTime
+ status: Enum(ONLINE, OFFLINE, ERROR)
**Methods:**
- ping()
- updateStatus()

---

## 2. Nhóm Business Classes (Services)

### # Class: ReportService
**Mô tả:** Xử lý tính toán thống kê, báo cáo doanh thu và báo cáo hoạt động.
**Cách khởi tạo (Init):** Singleton service inject vào Controller.
**Methods:**
- generateRevenueReport(startDate, endDate)
- generateActivityStats(date)

### # Class: ReconciliationService
**Mô tả:** So sánh dữ liệu giao dịch của SPMS và BKPay để tìm ra chênh lệch.
**Cách khởi tạo (Init):** Singleton service.
**Methods:**
- fetchBKPayData(sessionId)
- compareSessions()

### # Class: SystemAdminService
**Mô tả:** Quản lý thay đổi cấu hình, lưu Audit Log.
**Cách khởi tạo (Init):** Singleton service.
**Methods:**
- saveConfig()
- savePricing()

---

## 3. Nhóm Controller Classes

### # Class: AdminDashboardController
**Mô tả:** Chứa các API phục vụ trang Dashboard (Alerts, Audit Logs, Users, System Config).

### # Class: ReportController
**Mô tả:** Chứa các API `/api/reports/revenue` và `/api/reports/activity`.

### # Class: ReconciliationController
**Mô tả:** Chứa các API liên quan đến đối soát `/api/reconciliation/*`.
