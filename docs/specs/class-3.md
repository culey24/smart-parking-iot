# Class Diagram — Smart Parking IoT

> Document type: Technical Reference
> Last updated: 2026-05-11

## 1. Domain Model (Mongoose Documents)

### 1.1 Core Entities

```
┌─────────────────────────┐     ┌─────────────────────────┐
│         User            │     │    ParkingSession        │
├─────────────────────────┤     ├─────────────────────────┤
│ - userId: string PK     │     │ - sessionId: string PK  │
│ - schoolCardId?: number │     │ - startTime: Date       │
│ - fullName: string      │     │ - endTime?: Date       │
│ - role: enum            │     │ - sessionStatus: enum  │
│ - email: string         │     │ - paymentStatus: enum    │
│ - userStatus: enum      │     │ - type: enum            │
│ - password: string      │     │ - userRole: string      │
│ - createdAt: Date       │     │ - vehicleType: string   │
│ - updatedAt: Date       │     │ - subjectID: string     │
├─────────────────────────┤     │ - plateNumber: string   │
│ + comparePassword()      │     │ - fee?: number          │
└─────────────────────────┘     │ - invoiceId?: string   │
         │                      │ - createdAt: Date      │
         │ 1                    │ - updatedAt: Date      │
         │ ┌────────────────────┴─────────────────────────┘
         │ │
┌────────┴─┴──────────────┐      ┌─────────────────────────┐
│       Zone              │◄─────│     ParkingSlot          │
├─────────────────────────┤      ├─────────────────────────┤
│ - zoneId: string PK     │ 1   │ - slotId: string PK     │
│ - zoneName: string      │ *   │ - zoneId: string FK     │
│ - capacity: number      │────►│ - isAvailable: boolean   │
│ - currentUsage: number  │      │ - createdAt: Date        │
│ - createdAt: Date       │      │ - updatedAt: Date        │
│ - updatedAt: Date       │      └─────────────────────────┘
└─────────────────────────┘
```

```
┌─────────────────────────┐
│       IoTDevice         │  ← Abstract base (discriminator pattern)
├─────────────────────────┤
│ - deviceId: string PK    │
│ - locationId?: string   │
│ - status: enum          │
│ - lastOnline: Date      │
│ - zoneId: string        │
│ - deviceType: string    │  ← discriminatorKey
│ - deviceName?: string   │
│ - createdAt: Date       │
│ - updatedAt: Date       │
└─────────────────────────┘
         △
    (discriminators)
┌────────┼──────────────┐
│        │              │
│ ┌──────┴──────┐  ┌────┴─────────┐  ┌──────────┐  ┌──────────┐
│ │   Sensor    │  │    Gate      │  │ Signage   │  │  Camera  │
│ ├────────────┤  ├──────────────┤  ├───────────┤  ├──────────┤
│ │ parkingSlot│  │ gateType     │  │ message   │  │ streamURL│
│ │   Id?: str │  │ ipAddress?:  │  │ brightness│  │resolution│
│ │sensitivity │  │ isAutoOpen   │  │  ?: num   │  │  ?: str  │
│ │  ?: num    │  │              │  │           │  │          │
│ └────────────┘  └──────────────┘  └───────────┘  └──────────┘
```

```
┌─────────────────────────┐     ┌─────────────────────────┐
│    PricingPolicy        │     │       Invoice           │
├─────────────────────────┤     ├─────────────────────────┤
│ - userRole: enum        │     │ - invoiceId: string PK  │
│ - vehicleType: enum     │     │ - amount: number        │
│ - calculationType: enum│     │ - paymentStatus: enum   │
│ - billingIntervalMin:  │     │ - issueDate: Date       │
│   number                │     │ - createdAt: Date       │
│ - specialRules: []      │     │ - updatedAt: Date       │
│ - discountPercent?:num │     └─────────────────────────┘
│ - effectiveDate: Date  │              ▲
│ - createdAt: Date       │              │ 1
│ - updatedAt: Date       │         ┌────┴────────────┐
└─────────────────────────┘         │ ParkingSession  │
                                    │ (invoiceId FK) │
                                    └────────────────┘
```

### 1.2 Supporting Entities

```
┌─────────────────────────┐     ┌─────────────────────────┐
│    TemporaryCard        │     │        Location          │
├─────────────────────────┤     ├─────────────────────────┤
│ - tempCardID: string PK │     │ - locationId: string PK│
│ - cardStatus: enum      │     │ - locationName: string │
│ - createdAt: Date       │     │ - coordinates: [x,y]   │
│ - updatedAt: Date       │     │ - locationType: enum   │
└─────────────────────────┘     │ - createdAt: Date      │
                                │ - updatedAt: Date      │
                                └─────────────────────────┘

┌─────────────────────────┐     ┌─────────────────────────┐
│     MappingConfig        │     │   InfrastructureAlert   │
├─────────────────────────┤     ├─────────────────────────┤
│ - facilityId: string PK│     │ - deviceId: string      │
│ - layout: PlacedDevice[]│    │ - alertType: enum       │
│ - updatedAt: Date       │     │ - message: string       │
│ - createdAt: Date       │     │ - status: enum         │
└─────────────────────────┘     │ - timestamp: Date      │
                                │ - createdAt: Date      │
                                │ - updatedAt: Date      │
                                └─────────────────────────┘

┌─────────────────────────┐     ┌─────────────────────────┐
│     SystemConfig        │     │      AuditLog           │
├─────────────────────────┤     ├─────────────────────────┤
│ - settingKey: string PK│     │ - userId: string        │
│ - settingValue: Mixed  │     │ - action: string        │
│ - description?: string │     │ - targetResource?: str │
│ - createdAt: Date       │     │ - details?: Mixed      │
│ - updatedAt: Date       │     │ - timestamp: Date       │
└─────────────────────────┘     │ - createdAt: Date      │
                                │ - updatedAt: Date      │
                                └─────────────────────────┘

┌─────────────────────────┐
│      SystemLog          │
├─────────────────────────┤
│ - logId: string PK      │
│ - timestamp: Date       │
│ - level: enum           │
│ - source: string        │
│ - message: string       │
│ - sessionId?: string    │
│ - deviceId?: string     │
│ - metadata?: Mixed      │
│ TTL: 7 days             │
└─────────────────────────┘
```

---

## 2. Service Layer

```
┌───────────────────────────┐     ┌───────────────────────────┐
│       AuthService          │     │      BillingService        │
├───────────────────────────┤     ├───────────────────────────┤
│ + login(cardId, pwd)      │     │ + calculateFee() → number │
│   → { token, user }       │     │ + calculateCycleFee() →  │
│                           │     │     number                │
└───────────────────────────┘     └───────────────────────────┘
         │                                    │
         │ uses                              │ uses
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│      User       │                  │  PricingPolicy  │
│   (Mongoose)    │                  │    (Mongoose)   │
└─────────────────┘                  └─────────────────┘

┌───────────────────────────┐     ┌───────────────────────────┐
│     NavigationService      │     │      ReportService        │
├───────────────────────────┤     ├───────────────────────────┤
│ + getZonesByUsage()       │     │ + getDailyRevenue() →    │
│ + getStats() → {totalCap,│     │     DailyRevenueReport[] │
│     totalUsage, utilRate}│     │ + getActivityStats() →   │
│                           │     │     { usageByHour,       │
│                           │     │       avgOccupancyRate,  │
│                           │     │       deviceErrors* }    │
└───────────────────────────┘     └───────────────────────────┘
         │                                    │
         │ uses                              │ uses
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────────────┐
│      Zone       │                  │ ParkingSession,         │
│   (Mongoose)   │                  │ ParkingSlot,             │
└─────────────────┘                  │ InfrastructureAlert     │
                                      └─────────────────────────┘

┌───────────────────────────┐     ┌───────────────────────────┐
│   SystemAdminService      │     │    SystemLogService       │
├───────────────────────────┤     ├───────────────────────────┤
│ + getAllConfigs()        │     │ + log(level, src, msg)   │
│ + updateConfig()         │     │ + getRecent(limit) → []  │
│ + updatePricing()        │     │                           │
│ + getPricingPolicies()   │     │   emits to → EventBus     │
│ + getAuditLogs()         │     │   persists to → SystemLog │
└───────────────────────────┘     └───────────────────────────┘
         │                                    │
         │ uses                              ▼
         ▼                            ┌─────────────────┐
┌─────────────────────────────┐     │   EventBus      │
│ SystemConfig, PricingPolicy, │     │ (singleton)    │
│ AuditLog (Mongoose)         │     └─────────────────┘
└─────────────────────────────┘
```

---

## 3. Controller Layer

```
┌─────────────────────────────┐
│     EntryExitController     │
├─────────────────────────────┤
│ + checkIn(req, res)         │
│ + checkOut(req, res)        │
│ + openGate(req, res)        │
└─────────────┬───────────────┘
              │ orchestrates
    ┌─────────┼───────────────┬──────────────┐
    │ uses    │ uses          │ uses         │ uses
    ▼         ▼              ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐
│Parking  │ │  Zone    │ │  User    │ │BillingSvc │
│Session  │ │          │ │          │ │           │
└─────────┘ └──────────┘ └──────────┘ └───────────┘
    │                   │
    │ produces          │ updates
    ▼                   ▼
┌──────────────┐   ┌──────────┐
│SystemLogSvc   │   │  Zone    │
│              │◄──│(current  │
└──────────────┘   │Usage++)  │
                   └──────────┘

┌────────────────────────────┐     ┌────────────────────────────┐
│    PaymentController       │     │    SessionController         │
├────────────────────────────┤     ├────────────────────────────┤
│ + initiateCyclePayment() │     │ + getAll(req, res)         │
│ + mockBKPayCallback()    │     │ + getByUser(req, res)      │
│ + getHistory(req, res)   │     │ + getRecent(req, res)      │
│ + getHistoryAdmin()       │     │                           │
│ + getDebt(req, res)       │     └────────────────────────────┘
└────────────────────────────┘
```

---

## 4. Frontend Types (Layout Mapping)

```
┌─────────────────────────────────────────────────┐
│               MappedDeviceType                    │
│  "sensor" | "gateway" | "signage" | "barrier"   │
│  | "entrance" | "exit" | "zone" | "road"         │
│  | "waypoint"                                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────┐   ┌─────────────────────────────┐
│       PlacedDevice           │   │     CanvasTransform         │
├─────────────────────────────┤   ├─────────────────────────────┤
│ - id: string               │   │ - scale: number             │
│ - type: MappedDeviceType   │   │ - offsetX: number           │
│ - x: number (% coords)     │   │ - offsetY: number           │
│ - y: number                │   └─────────────────────────────┘
│ - width?: number           │
│ - height?: number          │
│ - points?: {x,y}[]         │   ┌─────────────────────────────┐
│ - shape?: "rect"|"polygon" │   │     ParkingMap               │
│ - label?: string           │   ├─────────────────────────────┤
│ - connections?: string[]  │   │ - mapName: string            │
│ - parentId?: string        │   │ - dimensions: {w,h,unit}    │
└─────────────────────────────┘   │ - zones: ParkingZone[]       │
                                └─────────────────────────────┘
```

---

## 5. Key Relationships Summary

| Relationship | Type | Notes |
|---|---|---|
| `ParkingSession.subjectID` → `User.userId` | FK (string) | Loose reference; not enforced at DB level |
| `ParkingSession.invoiceId` → `Invoice.invoiceId` | FK (string) | Not enforced at DB level |
| `ParkingSlot.zoneId` → `Zone.zoneId` | FK | Enforced at application level |
| `IoTDevice.zoneId` → `Zone.zoneId` | FK | All device types belong to a zone |
| `Sensor.parkingSlotId` → `ParkingSlot.slotId` | FK (optional) | Sensor → specific slot |
| `Gate.gateType` | Enum | `'ENTRY' \| 'EXIT'` — entry direction only |
| `PlacedDevice.parentId` → self | Hierarchy | Entrance/exit → parent zone (unused in code) |
| `PlacedDevice.connections[]` | Graph | Unidirectional edges; no reverse index |
| `SystemLog` TTL | Auto-delete | 7-day retention via MongoDB TTL index |
| `PricingPolicy` | Unique compound | `(userRole, vehicleType)` enforced at DB level |
| `BillingService` → `PricingPolicy` | Read-only | Service fetches policy; never writes |
| `EntryExitController` → `SystemLogService` → `EventBus` | Emit | SSE broadcast on check-in/check-out |

---

## 6. Data Flow: Check-In → Check-Out

```
Card Reader → checkIn()
  ├── Zone.findOne(zoneId) → check capacity
  ├── Zone.currentUsage++
  ├── User.findOne(userId) → resolve userRole
  ├── ParkingSession.create()
  ├── SystemLogService.log('SUCCESS')
  └── eventBus.emit('monitoring:snapshot')

Card Reader → checkOut()
  ├── ParkingSession.findOne(sessionId, ACTIVE)
  ├── BillingService.calculateFee(startTime, endTime, vehicleType, userRole)
  │   └── PricingPolicy.findOne(userRole, vehicleType)
  ├── ParkingSession.save(fee)
  ├── Zone.currentUsage--  (if zoneId)
  ├── SystemLogService.log('INFO')
  └── eventBus.emit('monitoring:snapshot')

PaymentController → initiateCyclePayment()
  ├── ParkingSession.find(UNPAID, cycle range)
  ├── BillingService.calculateCycleFee(sessions)
  ├── ParkingSession.updateMany(→ PENDING, invoiceId)
  └── return mock BKPay URL

mockBKPayCallback()
  └── ParkingSession.updateMany(→ PAID)
```

---

## 7. Pending / Incomplete Patterns

- `MappingConfig.layout` typed as `any[]` — should be `PlacedDevice[]`
- `PlacedDevice.deviceId` field missing — no link to real `IoTDevice` model
- `PlacedDevice.parentId` exists but never referenced in business logic
- `connections[]` is unidirectional only — no reverse lookup utility
- `BillingService.calculateCycleFee` takes `any[]` — should be typed as `ParkingSession[]`
- `PricingPolicy.discountPercent` only applied to FACULTY role
- `Zone` and `ParkingZone` are same model (alias) — source of confusion
