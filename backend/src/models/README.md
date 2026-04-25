# Models Module (`src/models/`)

## 1. Vai trò (Purpose)
Thư mục này đóng vai trò là **Data Layer**. Nó chứa các Mongoose Schemas (định nghĩa cấu trúc dữ liệu) và Models để giao tiếp trực tiếp với MongoDB. Mọi thay đổi về cấu trúc bảng, kiểu dữ liệu (`String`, `Number`), các giá trị mặc định (`default`), hay ràng buộc (`required`, `unique`) đều phải được khai báo ở đây.

## 2. Hướng dẫn Implement (Implementation Guide)
Mỗi một thực thể (Entity) trong hệ thống sẽ tương ứng với một file `.ts` trong thư mục này. 

**Quy tắc khai báo:**
- Import `Schema` và `model` từ thư viện `mongoose`.
- Luôn truyền option `{ timestamps: true }` vào cuối mỗi Schema để Mongoose tự động tạo ra hai trường `createdAt` và `updatedAt`.
- Export duy nhất Model (VD: `export const User = model('User', UserSchema);`).

## 3. Danh sách các Models (Phân bổ theo Task)

- **`User.ts`**: Thông tin sinh viên, nhân viên, admin (Tên, mã số, role, email). *(Task 1)*
- **`Zone.ts`**: Định nghĩa các khu vực đỗ xe (sức chứa tối đa, số lượng xe hiện tại). *(Task 1)*
- **`ParkingSession.ts`**: Lưu mỗi lượt xe ra/vào (biển số, giờ vào/ra, tổng tiền, trạng thái). *(Task 1)*
- **`TemporaryCard.ts`**: Lưu các thẻ từ vật lý cấp cho khách vãng lai. *(Task 1)*
- **`SystemConfig.ts`**: Lưu các cấu hình động của phần mềm (VD: timeout, thời gian mở cổng). *(Task 7)*
- **`PricingPolicy.ts`**: Bảng giá đỗ xe theo giờ, ngày, tháng. *(Task 7)*
- **`AuditLog.ts`**: Nhật ký ghi lại các hành động sửa xóa của Admin. *(Task 7)*
- **`InfrastructureAlert.ts`**: Lưu các cảnh báo khi thiết bị phần cứng (camera, barrier) gặp sự cố. *(Task 5)*
- **`Gate.ts`**: Định nghĩa các cổng (vị trí cổng, IP của cổng). *(Task 3)*
- **`IoTDevice.ts`**: Lưu trạng thái kết nối của các cảm biến. *(Task 5)*
- **`ReconciliationRequest.ts`**: Phiên bản đối soát dữ liệu với ngân hàng BKPay. *(Task 4)*
