# Smart Parking System (IoT-SPMS1) - Backend Assignment Spec

## 1. Tổng quan dự án (Overview)
Hệ thống bãi đỗ xe thông minh (Smart Parking System) mô phỏng với các luồng giao tiếp ngoại vi (IoT, Thanh toán BKPay, Xác thực SSO) được tinh gọn dưới dạng **Mockup**.
Dự án phục vụ bài tập lớn môn **Công nghệ phần mềm (SE252)**.

## 2. Công nghệ và Ngôn ngữ (Tech Stack)
- **Framework**: ExpressJS (TypeScript)
- **Database**: MongoDB (Mongoose)
- **Testing**: Jest & Supertest
- **Tools**: ESLint, Prettier, Makefile

## 3. Phân chia 7 Task cho 7 thành viên
Dự án được chia làm 7 module độc lập. Mỗi thành viên sẽ phụ trách logic, API và **viết Unit Test** cho module của mình.

---

### Task 1: Core Database Models & Seeding (Data Layer)
- **Mục tiêu**: Thiết lập bộ khung Database và script nạp dữ liệu.
- **Chi tiết các file**: `src/config/db.ts`, `src/models/*.ts`, `src/utils/seed.ts`.
- **💻 Hướng dẫn cách code**:
  - Mở thư mục `src/models/`, tham khảo cấu trúc file `User.ts` đã có sẵn.
  - Định nghĩa kiểu dữ liệu Mongoose cho các thuộc tính (VD: `String`, `Number`, `Date`). Nhớ thêm `timestamps: true` để tự động có ngày tạo.
  - Mở `src/utils/seed.ts`, viết các mảng Object (Mock Data) và dùng lệnh `Model.insertMany()` để tự động bơm dữ liệu giả vào Database khi gõ lệnh `make seed`.
- **🧪 Hướng dẫn viết Test Case (Jest)**:
  - Viết test kiểm tra tính hợp lệ của Schema (Validation rules).
  - Test xem tạo một `User` bị trùng userId có ném lỗi không.

### Task 2: User Authentication & Role Management
- **Mục tiêu**: Xử lý định danh và bảo mật API.
- **Chi tiết các file**: `src/services/AuthService.ts`, `src/controllers/AuthController.ts`, `auth.routes.ts`, `authMiddleware.ts`, `roleMiddleware.ts`.
- **💻 Hướng dẫn cách code**:
  - **Dịch vụ**: Tại `AuthService.ts`, viết hàm `login(userId)`. Dùng `User.findOne({ userId })` tìm trong DB. Nếu có, dùng thư viện `jsonwebtoken` để `jwt.sign(...)` tạo token rồi trả về.
  - **Middleware**: Mở `authMiddleware.ts`, đọc token từ `req.headers.authorization`. Dùng `jwt.verify` để giải mã. Nếu đúng thì nhét data vào `req.user` và gọi `next()`.
- **🧪 Hướng dẫn viết Test Case**:
  - Test gọi API `/api/auth/login` với user đúng -> kì vọng trả về JWT Token.
  - Test gọi API cần quyền nhưng token sai -> kì vọng HTTP 401 Unauthorized.

### Task 3: Access Control & Gate Management
- **Mục tiêu**: Điều khiển logic kiểm soát Barrier và Thẻ.
- **Chi tiết các file**: `src/controllers/EntryExitController.ts`, `gate.routes.ts`, `cards.routes.ts`.
- **💻 Hướng dẫn cách code**:
  - **Check-in**: Nhận `plateNumber` từ `req.body`. Dùng hàm `new ParkingSession({...}).save()` để lưu một phiên đỗ xe trạng thái `ACTIVE` vào DB. Phải kiểm tra bảng `Zone` xem còn chỗ (`currentUsage < capacity`) không.
  - **Check-out**: Nhận `sessionId`. Tìm session bằng `ParkingSession.findOne()`. Đổi trạng thái thành `COMPLETED`, cập nhật `endTime = Date.now()`.
- **🧪 Hướng dẫn viết Test Case**:
  - Test flow Check-in: Gửi payload hợp lệ -> kì vọng trong DB có thêm 1 `ParkingSession` `ACTIVE`.
  - Test lỗi Check-in khi bãi đỗ đã đầy (Mock DB Zone max capacity).

### Task 4: Parking Fee & Bank Reconciliation (BKPay)
- **Mục tiêu**: Tính toán tài chính và đối soát dữ liệu (Mock).
- **Chi tiết các file**: `src/services/BillingService.ts`, `src/controllers/PaymentController.ts`, `ReconciliationController.ts`.
- **💻 Hướng dẫn cách code**:
  - **Tính phí**: Tại `BillingService.ts`, nhận đầu vào là thời gian đỗ. Dùng lệnh IF/ELSE nhân số giờ đỗ với `hourlyRate` lấy từ bảng `PricingPolicy`. Trả về con số VNĐ.
  - **Đối soát**: API đối soát trong `ReconciliationController.ts` không cần gọi DB, chỉ cần `res.json()` trả về một mảng tĩnh chứa số tiền giả (Mockup) để Frontend có dữ liệu hiển thị.
- **🧪 Hướng dẫn viết Test Case**:
  - Đưa đầu vào đỗ 2 tiếng xe máy -> Kì vọng `BillingService` tính ra đúng số tiền.

### Task 5: IoT Webhook & Infrastructure Alerts
- **Mục tiêu**: Nhận dữ liệu thiết bị và quản lý trạng thái hạ tầng.
- **Chi tiết các file**: `src/controllers/IoTDataController.ts`, `iot.routes.ts`, `alerts.routes.ts`.
- **💻 Hướng dẫn cách code**:
  - **Webhook**: API `/api/iot/webhook` sẽ nhận tín hiệu giả lập. Trong controller, lấy `req.body.status` và dùng `Zone.updateOne` để cộng/trừ số `currentUsage`.
  - **Alerts**: API tạo Alert đơn giản là tạo ra 1 document mới bằng `InfrastructureAlert.create({ message: "Lỗi thiết bị" })`.
- **🧪 Hướng dẫn viết Test Case**:
  - Test API Webhook: Gửi payload xe đi ra -> Kì vọng `currentUsage` của Zone trong DB bị giảm đi 1.

### Task 6: Live Monitoring & Dashboard Aggregation
- **Mục tiêu**: Cung cấp dữ liệu thời gian thực và biểu đồ.
- **Chi tiết các file**: `src/services/NavigationService.ts`, `src/controllers/DashboardController.ts`, các routes liên quan.
- **💻 Hướng dẫn cách code**:
  - **Thống kê Dashboard**: Dùng lệnh `ParkingSession.countDocuments({ sessionStatus: 'ACTIVE' })` để đếm số xe đang đỗ. Trả về Frontend.
  - **Điều hướng LED**: Viết logic ở `NavigationService` query bảng `Zone`, tìm xem Zone nào có `currentUsage` nhỏ nhất thì gợi ý cho sinh viên.
- **🧪 Hướng dẫn viết Test Case**:
  - Test API `/api/dashboard/stats`: Mock DB có 5 xe đang đỗ -> API trả về số 5.

### Task 7: System Admin, Reports & Error Handling
- **Mục tiêu**: Quản trị hệ thống, báo cáo và chuẩn hóa App.
- **Chi tiết các file**: `src/services/SystemAdminService.ts`, `ReportService.ts`, `SystemAdminController.ts`, `errorHandler.ts`.
- **💻 Hướng dẫn cách code**:
  - **Audit Log**: Mỗi khi xử lý API cập nhật `SystemConfig` hay `PricingPolicy`, thêm dòng code `AuditLog.create({ action: "UPDATE_PRICE", userId: req.user.id })` trước khi gửi Response.
  - **Error Handler**: Middleware đã viết sẵn. Bạn cần chủ động dùng lệnh `throw new Error("Thông báo lỗi")` trong mọi Controller khác để Middleware này "tóm" được.
- **🧪 Hướng dẫn viết Test Case**:
  - Test sửa giá -> Kì vọng giá trị trong DB đổi VÀ sinh ra 1 record `AuditLog`.
  - Test Error: Bắn API sai format -> Middleware trả về status 500 JSON.

---

## 4. Cách chạy Test Case (Với Jest)
1. Trong file `package.json`, đảm bảo có `"test": "jest"`.
2. Thành viên viết test trong thư mục `tests/` với đuôi file là `.test.ts` (ví dụ `auth.test.ts`).
3. Dùng thư viện `supertest` để giả lập gọi HTTP request mà không cần mở server thật.
4. Chạy lệnh `npm test`.
