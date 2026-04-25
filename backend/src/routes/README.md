# Routes Module (`src/routes/`)

## 1. Vai trò (Purpose)
Thư mục này đóng vai trò như một **Bản đồ giao thông**. Nó định nghĩa các URL endpoint (VD: `/api/users/login`) và điều phối HTTP Request (GET/POST/PUT/DELETE) chạy tới đúng Controller tương ứng.

Ngoài ra, Routes cũng là nơi gắn các **Middlewares** chặn ngang để bảo vệ API (Ví dụ: phải kẹp middleware `authMiddleware` vào route `/profile` để chặn những ai chưa đăng nhập).

## 2. Hướng dẫn Implement (Implementation Guide)
**Quy tắc khai báo:**
- Mỗi phân hệ (Domain) sẽ có một file route riêng (VD: `gate.routes.ts`, `users.routes.ts`) để tránh file bị phình to.
- Sử dụng `express.Router()`.
- File **`index.ts`** trong thư mục này đóng vai trò gom tất cả các file route con lại và xuất ra một Router duy nhất để file `app.ts` gọi vào.

## 3. Danh sách các Routes

- **`auth.routes.ts`**: `/api/auth/login`, `/api/auth/profile`
- **`users.routes.ts`**: `/api/users` (Xem danh sách, Cập nhật Role)
- **`gate.routes.ts`**: `/api/gates/check-in`, `/api/gates/check-out`, `/api/gates/:id/open`
- **`cards.routes.ts`**: `/api/cards/lookup`, `/api/cards/:id/disable`
- **`billing.routes.ts`**: `/api/billing/history`, `/api/billing/debt`
- **`reconciliation.routes.ts`**: `/api/reconciliation/*`
- **`iot.routes.ts` & `alerts.routes.ts`**: `/api/devices/*`, `/api/alerts/*`
- **`dashboard.routes.ts`, `monitoring.routes.ts`, `navigation.routes.ts`**: Các API cho biểu đồ, live stream trạng thái bãi và điều hướng LED.
- **`admin.routes.ts`, `reports.routes.ts`**: Quản lý cấu hình, bảng giá, log và xuất file báo cáo.
