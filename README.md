# Smart Parking IoT — SPMS

## Backend (Node.js + TypeScript + Express + MongoDB)

### Prerequisites
- Node.js >= 18
- MongoDB running locally (`mongodb://localhost:27017`)

### Chạy backend

```bash
cd backend
npm install
npm run dev        # dev server on http://localhost:8000
```

### Seed dữ liệu mẫu (chạy 1 lần)

```bash
cd backend
npm run seed
```

Seed tạo sẵn: 10 users (các roles), 30 slots, 8+ devices, 35 parking sessions, 6 invoices, alerts, audit logs.

### API Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/health` | Health check |
| GET | `/api/slots/live` | Live map – slot status + tọa độ |
| GET | `/api/slots/stats` | Tổng/available/occupied |
| GET | `/api/monitoring/live` | Slots + devices + alerts tổng hợp |
| GET | `/api/devices?type=SENSOR` | Danh sách thiết bị IoT |
| GET | `/api/devices/iot-list` | IoT table (sensors + devices merged) |
| GET | `/api/sessions` | Tất cả sessions |
| GET | `/api/sessions/recent` | Sessions gần nhất |
| GET | `/api/sessions/user/:userId` | Sessions của user |
| GET | `/api/audit-logs` | Nhật ký hệ thống |
| POST | `/api/audit-logs` | Ghi audit log mới |
| GET | `/api/dashboard/stats` | Dashboard stats |
| GET | `/api/users` | Danh sách users |
| GET | `/api/users/:id/profile` | Profile user |
| PUT | `/api/users/:id/role` | Cập nhật role |
| GET | `/api/cards/lookup?plate=` | Tra cứu thẻ qua biển số |
| PUT | `/api/cards/:id/disable` | Vô hiệu hoá thẻ |
| GET | `/api/billing/history?userId=` | Lịch sử hoá đơn |
| GET | `/api/billing/debt?userId=` | Công nợ chu kỳ hiện tại |
| GET | `/api/alerts` | Infrastructure alerts |
| PUT | `/api/alerts/:id/status` | Cập nhật trạng thái alert |
| GET | `/api/gates` | Barrier control – danh sách cổng |
| POST | `/api/gates/:id/open` | Mở cổng thủ công |
| GET | `/api/pricing-policy` | Chính sách giá |
| PUT | `/api/pricing-policy` | Cập nhật giá |
| GET | `/api/reconciliation/requests` | Yêu cầu đối soát |
| PUT | `/api/reconciliation/requests/:id` | Cập nhật trạng thái đối soát |
| GET | `/api/reports/revenue` | Báo cáo doanh thu |
| GET | `/api/reports/activity` | Thống kê hoạt động |
| GET | `/api/system-config` | Cấu hình hệ thống |
| PUT | `/api/system-config` | Lưu cấu hình |

### IoT Simulator

Backend tự chạy background task mô phỏng IoT:
- **Mỗi 15 giây**: 1–3 slots ngẫu nhiên đổi trạng thái (occupied ↔ available)
- **Mỗi 45 giây**: 1 device ngẫu nhiên đổi ONLINE/OFFLINE/ERROR
- **Mỗi 2 phút**: Sinh ra 1 InfrastructureAlert mới
- **Mỗi 5 phút**: Tự resolve alert cũ nhất

---

## Frontend (React + Vite + Tailwind + Shadcn/ui)

### Chạy frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại http://localhost:5173, gọi API tới http://localhost:8000.

### Cấu trúc Layout

- **Sidebar collapsible**: Thanh bên trái có thể đóng/mở
- **Navigation theo vai trò**: Menu render động theo `UserRole`
- **Màu chủ đạo**: Xanh Bách Khoa (#003087)

### Đổi vai trò để test

Trong `frontend/src/contexts/AuthContext.tsx`, sửa mock user để xem menu theo role khác nhau: `LEARNER`, `FACULTY`, `OPERATOR`, `ADMIN`, `IT_TEAM`, `FINANCE`, `SUPER`.
