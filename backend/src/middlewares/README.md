# Middlewares Module
Thuộc **Task 2**.
Chứa các middleware Express:
- `authMiddleware.ts`: Lấy JWT token từ header, verify và nhét user payload vào `req.user`.
- `roleMiddleware.ts`: Kiểm tra role của `req.user` có quyền gọi API không (ví dụ: chỉ ADMIN mới được gọi `/api/users`).
- `errorHandler.ts`: (Thuộc Task 7) Bắt các error throw ra từ hệ thống và trả về format chung `{ success: false, error: '...' }`.
