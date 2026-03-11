# Smart Parking IoT

## Backend API (FastAPI + SQLModel)

### Chạy API

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Swagger**: http://localhost:8000/docs  
- **ReDoc**: http://localhost:8000/redoc  
- **Chi tiết API**: xem `docs/API_GUIDE.md`

---

## Frontend (React + Vite + Tailwind + Shadcn/ui)

### Chạy ứng dụng

```bash
cd frontend
npm install
npm run dev
```

### Cấu trúc Layout

- **Sidebar collapsible**: Thanh bên trái có thể đóng/mở bằng nút toggle
- **Navigation theo vai trò**: Các mục menu render động dựa trên `UserRole` (LEARNER, FACULTY, OPERATOR, ADMIN)
- **Màu chủ đạo**: Xanh Bách Khoa (#003087) cho icon và hover
- **User summary**: Hiển thị thông tin user ở dưới cùng Sidebar

### Đổi vai trò để test

Trong `frontend/src/contexts/AuthContext.tsx`, sửa `MOCK_USERS.ADMIN` thành `MOCK_USERS.LEARNER`, `MOCK_USERS.FACULTY`, hoặc `MOCK_USERS.OPERATOR` để xem menu khác nhau theo role.
