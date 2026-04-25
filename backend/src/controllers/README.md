# Controllers Module (`src/controllers/`)

## 1. Vai trò (Purpose)
Thư mục này đóng vai trò là **Presentation Layer** (ở khía cạnh API). Các file Controllers có nhiệm vụ:
- Tiếp nhận HTTP Request (GET, POST, PUT, DELETE) từ Client.
- Trích xuất dữ liệu đầu vào (từ `req.body`, `req.query`, `req.params`, `req.user`).
- Gọi sang thư mục `services/` để thực thi logic nghiệp vụ.
- Nhận kết quả từ Services và định dạng lại thành chuỗi JSON phản hồi (HTTP Response) về cho Client.

## 2. Hướng dẫn Implement (Implementation Guide)
**Quy tắc khai báo:**
- Sử dụng cú pháp `export class TênController` và định nghĩa các hàm dạng `static async tenHam(req: Request, res: Response)`.
- Luôn đặt logic nhận/trả request trong khối `try...catch(error)`.
- Nếu có lỗi, KHÔNG dùng `res.status(500)` trực tiếp mà dùng lệnh `throw error` để Middleware Global (`errorHandler.ts`) tự động bắt lấy.
- Phản hồi luôn tuân theo chuẩn: `{ success: true, data: ..., message: ... }`.

## 3. Danh sách các Controllers

- **`AuthController.ts`** *(Task 2)*: Xử lý đăng nhập (`/api/auth/login`) và lấy thông tin User (`/api/auth/profile`).
- **`EntryExitController.ts`** *(Task 3)*: Xử lý quẹt thẻ lúc xe vào (`checkIn`) và lúc xe ra (`checkOut`). Mở/đóng cổng (`openGate`).
- **`PaymentController.ts`** *(Task 4)*: Cung cấp API lịch sử hóa đơn (`getHistory`) và công nợ (`getDebt`).
- **`ReconciliationController.ts`** *(Task 4)*: Trả về dữ liệu đối soát ngân hàng (`getRequests`, `resolveRequest`).
- **`IoTDataController.ts`** *(Task 5)*: Cung cấp API Webhook nhận data từ phần cứng (`receiveSensorData`) và danh sách cảnh báo.
- **`DashboardController.ts`** *(Task 6)*: Cung cấp các con số tổng hợp cho giao diện Admin (`getStats`, `getLiveMonitoring`).
- **`SystemAdminController.ts`** *(Task 7)*: Các API CRUD dành cho cài đặt cấu hình, thay đổi bảng giá và tra cứu log.
- **`ReportController.ts`** *(Task 7)*: API phục vụ xuất báo cáo (doanh thu, lưu lượng xe).
