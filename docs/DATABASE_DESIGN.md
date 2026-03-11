# Tóm tắt thiết kế Database – Smart Parking IoT (SPMS)

Dựa trên 16 màn hình và các Use Case, cấu trúc database được thiết kế như sau:

---

## 1. Hệ thống Định danh (Identity System)

**Nguyên tắc:** Dùng **ID tự tăng** làm khóa chính thay vì MSSV để đảm bảo tính bất biến.

| Bảng | Khóa chính | Ghi chú |
|------|------------|---------|
| `Users` | `id` (SERIAL/INT AUTO_INCREMENT) | MSSV/MSCB lưu riêng, không dùng làm PK |
| `Cards` | `id` (SERIAL) | Thẻ vật lý |
| `Parking_Sessions` | `id` (SERIAL) | Phiên đỗ xe |
| `Devices` | `id` (SERIAL) | Thiết bị IoT |

**Lý do:** MSSV có thể thay đổi (chuyển lớp, tốt nghiệp), ID tự tăng ổn định cho foreign key và audit.

---

## 2. Quản lý Thẻ (Card-Centric)

**Nguyên tắc:** Thẻ là trung tâm liên kết giữa người dùng và phiên đỗ xe.

| Bảng | Mô tả |
|------|-------|
| `Cards` | Thẻ vật lý (RFID/NFC) |
| `Users` | Tài khoản từ HCMUT_DATACORE |

**Quan hệ:**
- `Cards.user_id` → `Users.id` (nullable)
- **Thẻ sinh viên/giảng viên:** `user_id` NOT NULL
- **Thẻ tạm khách vãng lai:** `user_id` = NULL

```
Cards
├── id (PK)
├── card_number / last_four_digits
├── user_id (FK → Users.id, NULLABLE)  ← NULL = thẻ khách
├── status (Active | Disabled)
└── ...
```

---

## 3. Hạ tầng IoT & Mapping

**Nguyên tắc:** Lưu tọa độ (x, y) của từng thiết bị để hiển thị trên bản đồ bãi xe.

**Lưu ý quan trọng – Sensor:** Sensor **không có chức năng** biết xe nào đang ở sensor nào. Sensor chỉ phát hiện trạng thái chỗ đỗ (empty | occupied). Không lưu `vehicle_id` hay `license_plate` tại Slots.

| Loại thiết bị | Bảng / View | Tọa độ | Chức năng |
|---------------|-------------|--------|-----------|
| Sensor (slot) | `Slots` | row, col hoặc x, y | Chỉ status: empty/occupied |
| Gateway | `Devices` | x, y (%, px) | |
| Camera | `Devices` | x, y | |
| Signage | `Devices` | x, y | |

**Cấu trúc gợi ý:**
```
Slots (Sensor – chỗ đỗ)
├── id (PK)
├── row, col (hoặc x, y)
├── status (empty | occupied)     ← Chỉ trạng thái, KHÔNG có vehicle_id
├── device_status (online | offline | error)
└── ...

Devices (Gateway, Camera, Signage)
├── id (PK)
├── type (gateway | camera | signage)
├── label
├── x (tọa độ trên bản đồ)
├── y
├── zone
├── status (online | offline | error)
└── ...

Layout_Map
├── id
├── map_url (ảnh/SVG)
└── ...

Device_Placements (thiết bị đặt trên bản đồ)
├── device_id (FK)
├── map_id (FK)
├── x, y
└── ...
```

---

## 4. Vận hành & Đối soát

**Nguyên tắc:** Lưu vết mọi phiên đỗ xe, bao gồm biển số, giờ vào/ra và trạng thái thanh toán qua BKPay.

### Vehicles (Quản lý phương tiện)

**Lý do:** Thay vì chỉ lưu `license_plate` là chuỗi trong Sessions, cần bảng riêng để lưu danh sách xe đã đăng ký của Sinh viên/Giảng viên. Giúp Operator đối soát nhanh xem biển số xe đang vào có khớp với chủ thẻ hay không.

```
Vehicles
├── id (PK)
├── user_id (FK → Users.id)        ← Chủ xe (sinh viên/giảng viên)
├── license_plate (VARCHAR, UNIQUE)
├── vehicle_type (motorcycle | car)
├── is_primary (BOOLEAN)           ← Xe chính đăng ký
└── ...
```

**Quan hệ:** `Parking_Sessions.vehicle_id` → `Vehicles.id` (nullable cho khách vãng lai; khách vẫn dùng `license_plate` trực tiếp).

### Parking_Sessions

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | SERIAL (PK) | |
| card_id | FK → Cards | Thẻ sử dụng |
| vehicle_id | FK → Vehicles (nullable) | Xe đã đăng ký (NULL = khách) |
| license_plate | VARCHAR | Biển số xe (bắt buộc, đối soát) |
| entry_time | TIMESTAMP | Giờ vào |
| exit_time | TIMESTAMP (nullable) | Giờ ra |
| fee | DECIMAL | Phí tính toán (SPMS) |
| billing_cycle_id | FK (nullable) | Chu kỳ (chỉ Member; NULL = Visitor) |
| invoice_id | FK (nullable) | Hóa đơn chu kỳ (chỉ Member; NULL = Visitor) |
| status | ENUM | ongoing, completed |
| bkpay_transaction_id | VARCHAR (nullable) | Mã giao dịch BKPay |
| bkpay_amount | DECIMAL (nullable) | Số tiền thực nhận |
| bkpay_status | VARCHAR (nullable) | Trạng thái giao dịch |

**Lưu ý:** Không lưu `slot_id`/`sensor_id` gắn với xe – Sensor không biết xe nào đang đỗ.

### Reconciliation (UC 3.6)

| Bảng | Mô tả |
|------|-------|
| `Reconciliation_Requests` | Yêu cầu phản hồi (tính sai phí, lỗi thanh toán) |
| Liên kết | session_id → Parking_Sessions |

**Đối soát:** So sánh SPMS (calculated_amount) vs BKPay (actual_amount).

---

## 5. Tính minh bạch

### Audit_Logs

| Cột | Mô tả |
|-----|-------|
| id | PK |
| actor | Người thực hiện |
| action | Hành động (vd: "changed ticket price") |
| target | Đối tượng tác động |
| reason | Lý do (nullable, dùng cho mở barrier thủ công) |
| timestamp | Thời gian |

**Ví dụ:** "Admin A đã thay đổi giá vé", "Operator B mở barrier cổng A thủ công", "IT Team cập nhật Firmware Gateway".

### Gate_Operations (Mở barrier thủ công)

**Lý do:** Cần ghi rõ **lý do** khi Operator mở barrier thủ công (vd: Lỗi cảm biến, xe ưu tiên, khách mất thẻ).

| Cột | Mô tả |
|-----|-------|
| id | PK |
| gate_id | FK → Gates |
| operator_id | FK → Users |
| action | manual_open |
| reason | ENUM/VARCHAR – Lỗi cảm biến, Thẻ không nhận, Xe ưu tiên, Khẩn cấp, Khách mất thẻ, ... |
| timestamp | Thời gian |

### Infrastructure_Alerts

**Đối tượng:** IT Team. Cảnh báo lỗi thiết bị hạ tầng.

| Cột | Mô tả |
|-----|-------|
| id | PK |
| device_id | Thiết bị bị ảnh hưởng |
| device_type | sensor, gateway, camera, signage |
| message | Nội dung lỗi |
| severity | critical, warning, error |
| status | pending, resolved |
| timestamp | Thời gian xảy ra |

### Notifications (Thông báo người dùng)

**Lý do:** Đã có `Infrastructure_Alerts` (cho IT), nhưng thiếu nơi lưu thông báo cho **Sinh viên/Giảng viên**.

| Cột | Mô tả |
|-----|-------|
| id | PK |
| user_id | FK → Users |
| type | payment_success, warning, info, ... |
| title | Tiêu đề |
| message | Nội dung |
| read_at | TIMESTAMP (nullable) – đã đọc chưa |
| created_at | Thời gian tạo |

**Ví dụ:**
- "Thanh toán chu kỳ tháng 03/2026 thành công"
- "Cảnh báo: Xe của bạn đã đỗ quá 48 giờ"

---

## 6. Các bảng bổ sung (từ 16 màn hình)

| Bảng | Liên quan màn hình |
|------|---------------------|
| `Users` | Profile, Permissions (HCMUT_DATACORE: mssvMscb, email, faculty, country, province, timezone) |
| `User_Roles` | Phân quyền (Operator, Admin, IT Team, Finance, Super) |
| `Vehicles` | Xe đã đăng ký của Sinh viên/Giảng viên (đối soát biển số ↔ chủ thẻ) |
| `Billing_Cycles` | Chu kỳ thanh toán (Tháng 03/2026, Học kỳ 2) – cấu hình trong Pricing Policy |
| `Pricing_Policy` | Cấu hình giá theo nhóm + loại xe (Learner/Faculty/Visitor × Motorcycle/Car) |
| `System_Config` | Ngưỡng bãi đầy, timeout IoT, sync interval, hotline, alert email |
| `Gates` | Barrier Control (cổng, trạng thái open/closed) |
| `Gate_Operations` | Lịch sử mở barrier thủ công + lý do (reason) |
| `Invoices` | Hóa đơn chu kỳ – gom Parking_Sessions (giúp màn hình Đối soát ID 14) |
| `Notifications` | Thông báo cho Sinh viên/Giảng viên (khác Infrastructure_Alerts) |

---

## 6b. Invoices (Hóa đơn chu kỳ)

**Lý do:** Sinh viên thanh toán theo chu kỳ, cần bảng **Invoices** để gom các `Parking_Sessions` lại. Giúp màn hình **Đối soát (ID 14)** làm việc dễ hơn thay vì cộng dồn thủ công các session.

```
Invoices
├── id (PK)
├── user_id (FK → Users)
├── billing_cycle_id (FK → Billing_Cycles)
├── total_amount (DECIMAL)           ← Σ fee của các Sessions trong chu kỳ
├── payment_status (pending | paid | overdue)
├── paid_at (TIMESTAMP nullable)
├── bkpay_transaction_id (nullable)
└── ...
```

**Quan hệ:**
- `Parking_Sessions.invoice_id` → `Invoices.id` (mỗi session Member thuộc 1 invoice)
- `total_amount` = tổng fee các sessions trong invoice (có thể tính hoặc lưu denormalized)

---

## 6c. Billing_Cycles (Chu kỳ thanh toán)

**Lý do:** Phí gửi xe của người học được tổng hợp theo chu kỳ xác định trước. Cần bảng định nghĩa chu kỳ (vd: Tháng 03/2026, Học kỳ 2) để gom `Parking_Sessions` vào đúng hóa đơn. **Cấu hình trong màn hình Pricing Policy.**

```
Billing_Cycles
├── id (PK)
├── name (VARCHAR)           ← "Tháng 03/2026", "Học kỳ 2"
├── cycle_type (monthly | semester | custom)
├── start_date (DATE)
├── end_date (DATE)
└── ...
```

**Quan hệ:** `Invoices.billing_cycle_id` → `Billing_Cycles.id`

---

## 6d. Pricing_Policy & Vehicle_Type

**Lý do:** Chính sách giá không chỉ dựa trên vai trò (Learner/Faculty/Visitor) mà còn **loại xe** (Xe máy/Ô tô).

```
Pricing_Policy
├── id (PK)
├── audience (learner | faculty_staff | visitor)
├── vehicle_type (motorcycle | car)
├── base_price_vnd           ← Phí cơ bản (Visitor)
├── hourly_rate_vnd          ← Phí theo giờ (Visitor)
├── unit_price_vnd           ← Phí theo lượt (Member)
├── pricing_unit (per_trip | per_hour)
├── payment_cycle (daily | weekly | monthly | semester)
└── ...
```

**Ví dụ:** Sinh viên xe máy 5.000 VND/lượt, sinh viên ô tô 15.000 VND/lượt.

---

## 6e. Công thức tính phí & Thu tiền

### Khách vãng lai (Visitor)

Phí được **tính ngay khi kết thúc phiên**, thanh toán qua BKPay/cash tại chỗ:

```
Fee = BasePrice_visitor + (Duration × HourlyRate_visitor)
```

- `BasePrice_visitor`: Phí cơ bản (có thể = 0)
- `Duration`: Thời gian đỗ (giờ)
- `HourlyRate_visitor`: Phí theo giờ

### Thành viên (Learner / Faculty)

Phí được **ghi nhận vào Billing_Records** và **tổng hợp cuối chu kỳ**:

```
TotalCycleAmount = Σ (fee của các Sessions thuộc chu kỳ)
```

- Mỗi `Parking_Session` (Member) có `fee`, `billing_cycle_id`, `invoice_id`
- `Invoices` gom sessions: `total_amount = Σ(fee)` cho user + cycle
- Thanh toán qua BKPay theo chu kỳ (tháng/học kỳ) → cập nhật `Invoices.payment_status`

---

## 7. Sơ đồ quan hệ (tóm tắt)

```
Users ←── Cards (user_id nullable)
   │     ←── Vehicles (user_id)        ← Xe đăng ký
   │
   └── User_Roles

Cards ←── Parking_Sessions (card_id, vehicle_id nullable, invoice_id nullable)
   │
   └── Reconciliation_Requests (session_id → Parking_Sessions)

Billing_Cycles ←── Invoices (user_id, billing_cycle_id, total_amount, payment_status)
   │                    ↑
   │              Gom Parking_Sessions – màn hình Đối soát (ID 14) dùng trực tiếp
   └── (cấu hình trong Pricing Policy)

Users ←── Notifications (user_id)     ← Thông báo Sinh viên/Giảng viên

Pricing_Policy (audience + vehicle_type)

Gates ←── Gate_Operations (gate_id, operator_id, reason)

Devices / Slots ←── Infrastructure_Alerts
   │
   └── Layout_Map / Device_Placements (x, y)

Audit_Logs (actor, action, target, reason, timestamp)
```

---

## 8. Ghi chú triển khai

- **HCMUT_DATACORE:** Đồng bộ Users từ nguồn ngoài (mssvMscb, email, faculty, country, province, timezone).
- **BKPay:** Lưu transaction_id, actual_amount để đối soát với fee tính từ SPMS.
- **Layout Mapping:** Tọa độ (x, y) có thể lưu dạng % hoặc px tùy bản đồ.
- **Vehicles:** Operator đối soát `license_plate` ↔ `Vehicles.license_plate` + `Cards.user_id` ↔ `Vehicles.user_id`.
- **Billing_Cycles:** Cấu hình trong màn hình Pricing Policy (ID 13).
- **Gate_Operations.reason:** Danh sách lý do cố định (Sensor error, Card not recognized, Priority vehicle, Emergency, Guest lost card) – đồng bộ với `MANUAL_OPEN_REASONS` trong frontend.
- **Invoices:** Màn hình Đối soát (ID 14) dùng `Invoices` thay vì cộng dồn sessions thủ công. Đối soát SPMS vs BKPay theo từng Invoice.
- **Notifications:** Push/in-app thông báo cho Learner/Faculty (thanh toán thành công, cảnh báo đỗ quá 48h, ...). Khác `Infrastructure_Alerts` (cho IT).
