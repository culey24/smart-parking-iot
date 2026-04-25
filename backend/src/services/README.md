# Services Module (`src/services/`)

## 1. Vai trò (Purpose)
Thư mục này đóng vai trò là **Business Logic Layer** (Bộ não của hệ thống). 
Controller rất "ngu", nó chỉ biết nhận Request và gọi hàm. Mọi thuật toán tính toán phức tạp (tính tiền, so khớp chuỗi, đối soát số liệu, sinh JWT token, thống kê) đều bắt buộc phải được viết ở trong Services. 

**Tại sao phải tách ra Services?** Để code tái sử dụng được (nhiều Controller có thể gọi chung 1 Service) và cực kỳ dễ viết Unit Test (chỉ cần đưa Input vào Service và kiểm tra Output mà không cần giả lập HTTP Request).

## 2. Hướng dẫn Implement (Implementation Guide)
**Quy tắc khai báo:**
- Khai báo dưới dạng Class với các hàm `static`.
- Các hàm ở đây KHÔNG được nhận `req` và `res` của Express. Nó chỉ nhận các tham số thuần túy (VD: `calculateFee(startTime, endTime)`).
- Nó sẽ gọi trực tiếp các Mongoose Models để tương tác với Database.

## 3. Danh sách các Services

- **`AuthService.ts`** *(Task 2)*: Chứa logic gọi hệ thống SSO nội bộ (Mock), verify mật khẩu và sinh ra mã JWT.
- **`BillingService.ts`** *(Task 4)*: Thuật toán tính tiền đỗ xe. Nó sẽ lấy `hourlyRate` từ DB nhân với chênh lệch giờ giữa `startTime` và `endTime`.
- **`ReconciliationService.ts`** *(Task 4)*: Chứa logic kết nối Mock với ngân hàng BKPay để lấy dữ liệu, sau đó thực hiện thuật toán so khớp xem giao dịch nào bị lệch.
- **`NavigationService.ts`** *(Task 6)*: Thuật toán tìm xem trong các `Zone`, khu vực nào có khoảng trống nhiều nhất để gợi ý cho bảng LED ngoài cổng.
- **`SystemAdminService.ts`** *(Task 7)*: Chứa logic cập nhật cấu hình kèm theo việc gọi hàm ghi lại `AuditLog`.
- **`ReportService.ts`** *(Task 7)*: Các lệnh truy vấn Mongoose Aggregation phức tạp (group by ngày, sum tiền) để tạo biểu đồ báo cáo.
