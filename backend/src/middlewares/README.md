# Middlewares Module (`src/middlewares/`)

## 1. Vai trò (Purpose)
Middlewares là những hàm "đứng giữa" (chặn ngang) một HTTP Request trước khi nó kịp đi tới Controller. 
Nó thường dùng để kiểm tra tính hợp lệ của Request: "Anh là ai? Anh có đưa thẻ (token) không? Thẻ có đúng không? Anh có quyền vào phòng này (API này) không?". Nếu không hợp lệ, Middleware sẽ đuổi (trả về lỗi HTTP 4xx) ngay lập tức mà không thèm gọi Controller.

## 2. Hướng dẫn Implement (Implementation Guide)
**Quy tắc khai báo:**
- Nhận 3 tham số: `req`, `res`, `next`.
- Nếu mọi thứ ÔK, bắt buộc phải gọi `next()` để request đi tiếp.
- Lỗi phát sinh nên văng ra hoặc `res.status().json()`.

## 3. Danh sách các Middlewares

- **`authMiddleware.ts`** *(Task 2)*: Lấy JWT token từ `req.headers.authorization`, dùng `jwt.verify` để giải mã và gắn thông tin user vào `req.user`.
- **`roleMiddleware.ts`** *(Task 2)*: Hàm bọc nhận mảng `allowedRoles`. Kiểm tra xem `req.user.role` có nằm trong mảng đó không. VD: Chỉ cho phép `['ADMIN', 'OPERATOR']`.
- **`errorHandler.ts`** *(Task 7)*: Đây là một Global Error Handler đặc biệt (nhận 4 tham số `err, req, res, next`). Nó được gắn cuối cùng trong `app.ts` để bắt mọi lỗi `throw new Error()` rơi ra từ toàn bộ hệ thống và format thành chuẩn `{ success: false, message: ... }`.
