# Smart Parking System (IoT-SPMS1) - Backend Assignment Spec

## 1. Tổng quan dự án (Overview)
Hệ thống bãi đỗ xe thông minh (Smart Parking System) cho trường Đại học Bách Khoa (HCMUT) nhằm tự động hóa kiểm soát ra vào, quản lý phí gửi xe, đồng thời tích hợp thiết bị IoT để theo dõi tình trạng các slot đỗ xe và tích hợp toàn diện hệ thống quản trị Dashboard (Admin Panel).
Đây là một dự án mô phỏng cho bài tập lớn môn **Công nghệ phần mềm (SE252)**.

## 2. Công nghệ và Ngôn ngữ (Tech Stack)
- **Ngôn ngữ**: TypeScript (Node.js)
- **Framework**: ExpressJS
- **Database**: MongoDB (sử dụng Mongoose)
- **Testing**: Jest
- **Tools**: ESLint, Prettier, Swagger (để làm API docs - Bonus)

## 3. Kiến trúc hệ thống (Architecture)
Hệ thống tuân theo mô hình **MVC kết hợp Service Pattern**:
- `models/`: Chứa các Mongoose Schema định nghĩa cấu trúc dữ liệu.
- `controllers/`: Nhận HTTP request, gọi các Service để xử lý và trả về HTTP response.
- `services/`: Chứa logic nghiệp vụ cốt lõi.
- `routes/`: Định nghĩa các API endpoint và trỏ đến Controller tương ứng.
- `middlewares/`: Kiểm tra Authentication (JWT), Authorization (Role), Error Handling.

## 4. Các Entity Classes Chính
Dựa trên yêu cầu mới nhất (bao gồm cả Admin Dashboard, IoT, và Reports), hệ thống bao gồm:
1. **User, TemporaryCard, ParkingSession, Zone**: Các thực thể cốt lõi cho việc đỗ xe.
2. **SystemConfig, PricingPolicy, AuditLog, InfrastructureAlert, ReconciliationRequest, Gate, IoTDevice**: Các thực thể phục vụ hệ thống Dashboard, báo cáo và đối soát. *(Chi tiết các class bổ sung xem tại `docs/specs/class-1.md`)*.

## 5. Phân chia 8 Task cho 8 thành viên

Để hoàn thành toàn bộ hệ thống (kể cả phần Admin), mã nguồn backend được chia thành **8 Task** độc lập có khối lượng tương đương.

### Task 1: Core Database Models & Seeding (Data Layer)
- **Mục tiêu**: Xây dựng toàn bộ cấu trúc DB và script khởi tạo dữ liệu.
- **Chi tiết các file**:
  - `src/config/db.ts`: Cấu hình Mongoose để kết nối tới MongoDB Atlas hoặc Local.
  - `src/models/*.ts`: Định nghĩa Mongoose Schema (Data types, Validation) cho các thực thể User, Card, Session, Zone, Config, v.v.
  - `src/utils/seed.ts`: Viết script nạp dữ liệu giả lập (Mock data) cho toàn bộ 11 Models để các Task khác có dữ liệu làm việc.

### Task 2: User Authentication, Profile & Role (AuthService)
- **Mục tiêu**: Quản lý truy cập, định danh và phân quyền người dùng.
- **Chi tiết các file**:
  - `src/middlewares/authMiddleware.ts`: Lấy JWT từ Header, kiểm tra tính hợp lệ và đính kèm `user` vào request object.
  - `src/middlewares/roleMiddleware.ts`: Chặn các request nếu user không có quyền tương ứng (VD: Chỉ ADMIN mới được sửa giá).
  - `src/services/AuthService.ts`: Logic xử lý mật khẩu (bcrypt), tạo mã JWT và mô phỏng xác thực qua HCMUT_SSO.
  - `src/controllers/AuthController.ts`: Nhận request login, gọi service và trả về Token hoặc Profile.
  - `src/routes/auth.routes.ts`: Khai báo endpoint `/api/auth/login`.
  - `src/routes/users.routes.ts`: Khai báo các endpoint lấy danh sách user, xem profile và cập nhật Role.

### Task 3: Access Control & Gate Management (EntryExitController)
- **Mục tiêu**: Xử lý logic tại cổng kiểm soát (Barrier) và quản lý thẻ.
- **Chi tiết các file**:
  - `src/controllers/EntryExitController.ts`: Logic quẹt thẻ (Check-in: kiểm tra bãi trống, tạo session; Check-out: đóng session, gọi service tính phí).
  - `src/routes/gate.routes.ts`: API điều khiển cổng `/api/gates` (xem danh sách cổng, mở cổng thủ công).
  - `src/routes/cards.routes.ts`: API tra cứu thông tin thẻ qua biển số xe và vô hiệu hóa thẻ bị mất.

### Task 4: Parking Fee, Billing & Reconciliation (Billing & Reconciliation)
- **Mục tiêu**: Tính toán tài chính và đối soát dữ liệu thanh toán.
- **Chi tiết các file**:
  - `src/services/BillingService.ts`: Thực hiện logic tính tiền dựa trên thời gian gửi và `PricingPolicy` (Strategy Pattern).
  - `src/services/ReconciliationService.ts`: Logic so khớp dữ liệu giữa hệ thống bãi xe và lịch sử giao dịch từ BKPay.
  - `src/controllers/PaymentController.ts`: API trả về lịch sử hóa đơn, tổng nợ của sinh viên.
  - `src/controllers/ReconciliationController.ts`: API liệt kê và xử lý các yêu cầu đối soát bị lệch.
  - `src/routes/billing.routes.ts`: Routes liên quan đến hóa đơn và thanh toán.
  - `src/routes/reconciliation.routes.ts`: Routes phục vụ công tác đối soát.

### Task 5: IoT Sensor, Device Tracking & Alerts (IoTDataController)
- **Mục tiêu**: Quản lý thiết bị phần cứng và các cảnh báo hệ thống.
- **Chi tiết các file**:
  - `src/controllers/IoTDataController.ts`: Xử lý Webhook từ cảm biến để cập nhật trạng thái Slot, quản lý danh sách thiết bị và alerts.
  - `src/routes/iot.routes.ts`: API `/api/devices/iot-list` trả về danh sách kèm trạng thái Online/Offline.
  - `src/routes/alerts.routes.ts`: API quản lý các cảnh báo hạ tầng (Infrastructure Alerts).

### Task 6: Navigation, Live Monitoring & Dashboard Stats (Dashboard & Navigation)
- **Mục tiêu**: Cung cấp dữ liệu trực quan thời gian thực cho người dùng và quản lý.
- **Chi tiết các file**:
  - `src/services/NavigationService.ts`: Logic tìm kiếm Zone còn chỗ trống nhất để điều hướng xe.
  - `src/controllers/DashboardController.ts`: Tổng hợp dữ liệu (Aggregation) để trả về các con số thống kê nhanh cho Admin Dashboard.
  - `src/controllers/NavigationController.ts`: API cung cấp dữ liệu hiển thị cho các bảng LED điều hướng.
  - `src/routes/dashboard.routes.ts`: Routes thống kê Dashboard.
  - `src/routes/monitoring.routes.ts`: Routes lấy dữ liệu Live Monitoring.
  - `src/routes/navigation.routes.ts`: Routes phục vụ điều hướng.

### Task 7: System Configuration, Pricing & Audit Logging (System Admin)
- **Mục tiêu**: Quản lý các thiết lập hệ thống và nhật ký thay đổi.
- **Chi tiết các file**:
  - `src/services/SystemAdminService.ts`: Logic cập nhật cấu hình hệ thống và chính sách giá, đồng thời tự động tạo Audit Log.
  - `src/controllers/SystemAdminController.ts`: API CRUD cho cấu hình hệ thống, giá vé và xem Audit Logs.
  - `src/routes/admin.routes.ts`: Gom các route quản trị vào một module `/api/admin`.

### Task 8: Reports, Integration Setup & OpenAPI (Reports & Setup)
- **Mục tiêu**: Chuẩn hóa API, xử lý lỗi và báo cáo tổng hợp.
- **Chi tiết các file**:
  - `src/services/ReportService.ts`: Truy vấn dữ liệu để tạo báo cáo doanh thu và tần suất hoạt động theo thời gian.
  - `src/controllers/ReportController.ts`: API trả về dữ liệu báo cáo dạng JSON (hoặc export Excel/PDF).
  - `src/routes/reports.routes.ts`: Routes báo cáo.
  - `src/routes/index.ts`: Gom tất cả các module route con lại thành một router duy nhất gắn vào App.
  - `src/middlewares/errorHandler.ts`: Middleware bắt mọi lỗi phát sinh trong App để trả về format JSON thống nhất.
  - `src/config/swagger.ts`: Cấu hình Swagger UI để tự động tạo tài liệu API từ code comments.
  - `tests/checkin.test.ts`: Viết một bộ test hoàn chỉnh cho luồng check-in để làm mẫu.

## 6. Hướng dẫn Setup môi trường
1. Clone repo, mở terminal vào thư mục `backend`.
2. Chạy `npm install`.
3. Chạy `docker-compose up -d` để khởi động MongoDB.
4. Tạo `.env` từ `.env.example`.
5. `npm run dev` để chạy Server, hoặc `npm test` để chạy test.
