# Hướng dẫn API – Smart Parking IoT

Tài liệu mô tả dịch vụ API FastAPI + SQLModel phục vụ Frontend Smart Parking SPMS.

---

## 1. Tổng quan

| Thành phần | Chi tiết |
|------------|----------|
| **Framework** | FastAPI |
| **ORM** | SQLModel (SQLAlchemy) |
| **Database** | SQLite tại `backend/prisma/prisma/dev.db` (hoặc `prisma/dev.db` tùy cấu hình Prisma) |
| **CORS** | Cho phép `http://localhost:5173`, `http://127.0.0.1:5173` |

### Cấu trúc thư mục

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py        # FastAPI app, routes, CORS
│   ├── database.py    # Kết nối SQLite, session
│   ├── models.py      # SQLModel models (khớp Prisma schema)
│   └── schemas.py     # Pydantic response models
├── prisma/
│   └── dev.db
├── requirements.txt
└── package.json
```

---

## 2. Cài đặt & Chạy

### Bước 1: Cài dependency Python

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# hoặc: .venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

### Bước 2: Chạy API

```bash
cd backend
# Dùng venv đã activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Hoặc dùng npm script (cần cài uvicorn globally hoặc qua venv):

```bash
cd backend
npm run api
```

### Swagger / ReDoc

- **Swagger UI**: http://localhost:8000/docs  
- **ReDoc**: http://localhost:8000/redoc  
- **Health**: http://localhost:8000/health  

---

## 3. API Endpoints

### 3.1. Live Map (Màn hình 4)

**GET** `/api/slots/live`

Trả về danh sách tất cả Slot kèm tọa độ x, y và trạng thái (available/occupied).

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "label": "A-01",
    "x": 10.5,
    "y": 20.0,
    "status": "available"
  },
  {
    "id": 2,
    "label": "A-02",
    "x": 15.0,
    "y": 20.0,
    "status": "occupied"
  }
]
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | int | ID slot |
| `label` | string | Nhãn slot (ví dụ A-01) |
| `x` | float | Tọa độ x (% trên bản đồ) |
| `y` | float | Tọa độ y (% trên bản đồ) |
| `status` | `"available"` \| `"occupied"` | Trạng thái chỗ đỗ |

---

### 3.2. Giám sát IoT (Màn hình 9)

**GET** `/api/devices`

Trả về danh sách Gateway, Sensor, Camera kèm trạng thái Online/Offline.

**Query params (tùy chọn):**

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `type` | string | Lọc theo loại: SENSOR, GATEWAY, CAMERA, SIGNAGE |

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "type": "SENSOR",
    "x": 10.5,
    "y": 20.0,
    "status": "Online"
  },
  {
    "id": 2,
    "type": "GATEWAY",
    "x": 50.0,
    "y": 50.0,
    "status": "Offline"
  }
]
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | int | ID thiết bị |
| `type` | string | SENSOR, GATEWAY, CAMERA, SIGNAGE |
| `x` | float | Tọa độ x |
| `y` | float | Tọa độ y |
| `status` | `"Online"` \| `"Offline"` | Trạng thái kết nối |

---

### 3.3. Lịch sử đỗ xe (Màn hình 2)

**GET** `/api/sessions/{user_id}`

Truy vấn các phiên đỗ xe của một User cụ thể (qua Card.userId).

**Path params:**

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `user_id` | int | ID user |

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "licensePlate": "30A-12345",
    "entryTime": "2026-03-06T08:00:00",
    "exitTime": "2026-03-06T10:30:00",
    "fee": 15000,
    "status": "COMPLETED"
  }
]
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | int | ID phiên |
| `licensePlate` | string | Biển số xe |
| `entryTime` | datetime | Thời gian vào |
| `exitTime` | datetime \| null | Thời gian ra |
| `fee` | float | Phí đỗ xe |
| `status` | string | ONGOING, COMPLETED |

---

### 3.4. Nhật ký hệ thống (Màn hình 11)

**GET** `/api/audit-logs`

Trả về danh sách tác động vào hệ thống, sắp xếp theo thời gian mới nhất.

**Query params (tùy chọn):**

| Param | Kiểu | Mặc định | Mô tả |
|-------|------|----------|-------|
| `limit` | int | 100 | Số bản ghi (1–500) |
| `offset` | int | 0 | Vị trí bắt đầu (phân trang) |

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "actorId": 2,
    "action": "MANUAL_BARRIER_OPEN",
    "target": "Gate A",
    "reason": "Xe hỏng cần đẩy ra",
    "timestamp": "2026-03-06T14:30:00"
  }
]
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | int | ID log |
| `actorId` | int | ID user thực hiện |
| `action` | string | Hành động |
| `target` | string | Đối tượng bị tác động |
| `reason` | string \| null | Lý do (nếu có) |
| `timestamp` | datetime | Thời điểm |

---

### 3.5. Thống kê Dashboard (Màn hình 7)

**GET** `/api/dashboard/stats`

Trả về các con số: Tổng số xe đang đỗ, số lỗi thiết bị chưa xử lý.

**Response:** `200 OK`

```json
{
  "totalParked": 42,
  "unresolvedDeviceErrors": 3
}
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `totalParked` | int | Số phiên đỗ xe đang ONGOING |
| `unresolvedDeviceErrors` | int | Số InfrastructureAlert chưa resolved |

---

## 4. Xử lý lỗi

| Mã | Mô tả |
|----|-------|
| 500 | Lỗi server (exception không xử lý) |
| 422 | Validation lỗi (query/path params không hợp lệ) |

Response lỗi mẫu:

```json
{
  "detail": "Internal server error",
  "error": "..."
}
```

---

## 5. CORS

API cho phép gọi từ:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Frontend (Vite mặc định chạy tại 5173) có thể gọi API mà không bị chặn CORS.

---

## 6. Ví dụ gọi API từ Frontend

```typescript
// Live Map
const slots = await fetch('http://localhost:8000/api/slots/live').then(r => r.json());

// Dashboard stats
const stats = await fetch('http://localhost:8000/api/dashboard/stats').then(r => r.json());

// Sessions của user 1
const sessions = await fetch('http://localhost:8000/api/sessions/1').then(r => r.json());

// Audit logs (phân trang)
const logs = await fetch('http://localhost:8000/api/audit-logs?limit=50&offset=0').then(r => r.json());

// Devices (lọc theo type)
const sensors = await fetch('http://localhost:8000/api/devices?type=SENSOR').then(r => r.json());
```
