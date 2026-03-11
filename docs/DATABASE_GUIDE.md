# Hướng dẫn Database – Smart Parking SPMS

Tài liệu này mô tả cách kết nối, lấy dữ liệu và thao tác database sử dụng Prisma + SQLite.

---

## 1. Tổng quan

| Thành phần | Chi tiết |
|------------|----------|
| **Provider** | SQLite |
| **ORM** | Prisma |
| **Vị trí** | `backend/prisma/dev.db` |
| **Schema** | `backend/prisma/schema.prisma` |

### Cấu trúc thư mục

```
backend/
├── .env                 ← DATABASE_URL
├── prisma/
│   ├── schema.prisma
│   └── dev.db
├── package.json
└── node_modules/
```

---

## 2. Cài đặt & Khởi tạo

### Bước 1: Cài dependency

```bash
cd backend
npm install
```

### Bước 2: Cấu hình .env

Tạo file `backend/.env` (hoặc copy từ `.env.example`):

```env
DATABASE_URL="file:./prisma/dev.db"
```

### Bước 3: Tạo database & Generate client

```bash
cd backend
npm run db:push      # Tạo/sync schema với database
npm run db:generate  # Generate Prisma Client
```

### Lệnh hữu ích

| Lệnh | Mô tả |
|------|-------|
| `npm run db:push` | Đồng bộ schema → database (dev) |
| `npm run db:migrate` | Tạo migration (production) |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:studio` | Mở Prisma Studio (GUI) |

---

## 3. Kết nối Database

### Tạo Prisma Client (singleton)

Tạo file `backend/src/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Sử dụng trong code

```typescript
import { prisma } from './db';

// Ví dụ: lấy tất cả users
const users = await prisma.user.findMany();
```

---

## 4. Lấy dữ liệu (Read / Query)

### 4.1. Find Many – Lấy danh sách

```typescript
// Tất cả users
const users = await prisma.user.findMany();

// Có điều kiện
const learners = await prisma.user.findMany({
  where: {
    role: { name: 'Learner' },
  },
});

// Có include (join)
const usersWithCards = await prisma.user.findMany({
  include: {
    role: true,
    cards: true,
  },
});

// Có select (chọn cột)
const userNames = await prisma.user.findMany({
  select: {
    id: true,
    fullName: true,
    email: true,
  },
});

// Sắp xếp & phân trang
const sessions = await prisma.parkingSession.findMany({
  orderBy: { entryTime: 'desc' },
  take: 20,
  skip: 0,
});
```

### 4.2. Find Unique – Lấy 1 bản ghi theo unique field

```typescript
// Theo id
const user = await prisma.user.findUnique({
  where: { id: 1 },
});

// Theo mssvMscb (unique)
const user = await prisma.user.findUnique({
  where: { mssvMscb: '2252123' },
});

// Theo cardUid
const card = await prisma.card.findUnique({
  where: { cardUid: 'ABC123' },
  include: { user: true },
});
```

### 4.3. Find First – Lấy bản ghi đầu tiên thỏa điều kiện

```typescript
const ongoingSession = await prisma.parkingSession.findFirst({
  where: {
    cardId: 1,
    status: 'ONGOING',
  },
});
```

### 4.4. Query có quan hệ

```typescript
// User + Role + Cards
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    role: true,
    cards: true,
  },
});

// ParkingSession + Card + User
const session = await prisma.parkingSession.findUnique({
  where: { id: 1 },
  include: {
    card: {
      include: { user: true },
    },
  },
});

// Device + Slot + InfrastructureAlerts
const device = await prisma.device.findMany({
  where: { type: 'SENSOR' },
  include: {
    slot: true,
    infrastructureAlerts: {
      where: { isResolved: false },
    },
  },
});
```

---

## 5. Thao tác (Create, Update, Delete)

### 5.1. Create – Tạo mới

```typescript
// Tạo Role
const role = await prisma.role.create({
  data: {
    name: 'Learner',
  },
});

// Tạo User
const user = await prisma.user.create({
  data: {
    mssvMscb: '2252123',
    fullName: 'Quach Gia Bao',
    email: 'quachgiabao@hcmut.edu.vn',
    roleId: 1,
  },
});

// Tạo Card (thẻ khách – userId = null)
const visitorCard = await prisma.card.create({
  data: {
    cardUid: 'VISITOR-001',
    userId: null,
    status: 'Active',
  },
});

// Tạo ParkingSession
const session = await prisma.parkingSession.create({
  data: {
    cardId: 1,
    licensePlate: '59A1-12345',
    entryTime: new Date(),
    fee: 0,
    status: 'ONGOING',
  },
});

// Create many
await prisma.role.createMany({
  data: [
    { name: 'Admin' },
    { name: 'Operator' },
    { name: 'IT' },
    { name: 'Learner' },
    { name: 'Faculty' },
  ],
});
```

### 5.2. Update – Cập nhật

```typescript
// Update một bản ghi
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@hcmut.edu.vn',
  },
});

// Update ParkingSession khi xe ra
const session = await prisma.parkingSession.update({
  where: { id: 1 },
  data: {
    exitTime: new Date(),
    fee: 22500,
    status: 'COMPLETED',
  },
});

// Update many
await prisma.infrastructureAlert.updateMany({
  where: { deviceId: 1 },
  data: { isResolved: true },
});
```

### 5.3. Delete – Xóa

```typescript
// Xóa một bản ghi
await prisma.auditLog.delete({
  where: { id: 1 },
});

// Xóa nhiều
await prisma.infrastructureAlert.deleteMany({
  where: { isResolved: true },
});
```

### 5.4. Upsert – Tạo hoặc cập nhật

```typescript
const card = await prisma.card.upsert({
  where: { cardUid: 'ABC123' },
  create: {
    cardUid: 'ABC123',
    userId: 1,
    status: 'Active',
  },
  update: {
    status: 'Active',
  },
});
```

---

## 6. Transaction – Giao dịch

Khi cần thực hiện nhiều thao tác cùng lúc, dùng transaction:

```typescript
await prisma.$transaction(async (tx) => {
  const session = await tx.parkingSession.create({
    data: {
      cardId: 1,
      licensePlate: '59A1-12345',
      entryTime: new Date(),
      fee: 0,
      status: 'ONGOING',
    },
  });

  await tx.auditLog.create({
    data: {
      actorId: 1,
      action: 'session_started',
      target: `ParkingSession ${session.id}`,
    },
  });

  return session;
});
```

---

## 7. Ví dụ theo Use Case

### UC: Bắt đầu phiên đỗ xe (Visitor)

```typescript
const session = await prisma.parkingSession.create({
  data: {
    cardId: visitorCardId,  // Thẻ tạm, userId = null
    licensePlate: '59A1-99999',
    entryTime: new Date(),
    fee: 0,
    status: 'ONGOING',
  },
});
```

### UC: Kết thúc phiên & tính phí (Visitor)

```typescript
const session = await prisma.parkingSession.update({
  where: { id: sessionId },
  data: {
    exitTime: new Date(),
    fee: calculatedFee,  // BasePrice + Duration * HourlyRate
    status: 'COMPLETED',
  },
});
```

### UC: Tra cứu thẻ (Card Processing)

```typescript
const card = await prisma.card.findUnique({
  where: { cardUid: scannedCardUid },
  include: {
    user: {
      include: { role: true },
    },
    parkingSessions: {
      where: { status: 'ONGOING' },
      take: 1,
    },
  },
});
```

### UC: Ghi Audit Log (mở barrier thủ công)

```typescript
await prisma.auditLog.create({
  data: {
    actorId: operatorId,
    action: 'manual_barrier_open',
    target: 'Gate A',
    reason: 'Sensor error',
  },
});
```

### UC: Lấy danh sách cảnh báo chưa xử lý

```typescript
const alerts = await prisma.infrastructureAlert.findMany({
  where: { isResolved: false },
  include: { device: true },
  orderBy: { id: 'desc' },
});
```

---

## 8. Kết nối từ Frontend (API)

Frontend **không** kết nối trực tiếp với database. Cần backend API (Express, Fastify, Hono, ...):

```
Frontend (React)  →  HTTP API  →  Backend (Node)  →  Prisma  →  SQLite
```

Ví dụ endpoint:

```typescript
// GET /api/users
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({
    include: { role: true },
  });
  res.json(users);
});

// POST /api/parking-sessions
app.post('/api/parking-sessions', async (req, res) => {
  const session = await prisma.parkingSession.create({
    data: req.body,
  });
  res.json(session);
});
```

---

## 9. Tham khảo

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) – Thiết kế chi tiết
