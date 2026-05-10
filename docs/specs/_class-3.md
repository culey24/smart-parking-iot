# Final System Class Specifications (V3)

This document provides the consolidated class definitions after the IoT model refactoring and inheritance implementation.

---

## 1. Entity Models (Database)

### # Class: User
Attributes:
+ userId: String (Unique)
+ schoolCardId: String (Unique)
+ fullName: String
+ role: Enum (ADMIN, OPERATOR, LEARNER, FACULTY, IT_TEAM, FINANCE_OFFICE)
+ email: String (Unique)
+ userStatus: Enum (ACTIVE, INACTIVE)
+ password: String (Hashed)

### # Class: TemporaryCard
Attributes:
+ tempCardID: String (Unique)
+ cardStatus: Enum (ACTIVATING, DEACTIVATED)

### # Class: ParkingSession
Attributes:
+ sessionId: String (Unique)
+ startTime: DateTime
+ endTime: DateTime (Optional)
+ sessionStatus: Enum (ACTIVE, COMPLETED, CANCELLED)
+ paymentStatus: Enum (UNPAID, PENDING, PAID)
+ type: Enum (REGISTERED, TEMPORARY)
+ subjectID: String (Reference to User.userId or TemporaryCard.tempCardID)
+ plateNumber: String
+ fee: Number
+ invoiceId: String (Optional)
+ userRole: String (Role of the subject at time of session)
+ vehicleType: String (MOTORBIKE, CAR, etc.)

### # Class: ParkingZone
Attributes:
+ zoneId: String (Unique)
+ zoneName: String
+ capacity: int
+ currentUsage: int

### # Class: ParkingSlot
Attributes:
+ slotId: String (Unique, references Location.locationId)
+ zoneId: String (References ParkingZone.zoneId)
+ isAvailable: Boolean

### # Class: Location
Attributes:
+ locationId: String (Unique)
+ locationName: String
+ coordinates: [Number, Number] // [x, y] or [row, col]
+ locationType: Enum (GATE, SLOT, INTERSECTION, CLOSET)

### # Class: Invoice
Attributes:
+ invoiceId: String (Unique)
+ amount: Number
+ paymentStatus: Enum (PENDING, PAID, CANCELLED)
+ issueDate: DateTime

---

## 2. IoT Hardware Hierarchy (Inheritance)

### # Abstract Class: IoTDevice
*Base model for all hardware entities.*
Attributes:
+ deviceId: String (Unique)
+ locationId: String (Optional)
+ status: Enum (ONLINE, OFFLINE, MAINTAINANCE, ERROR)
+ lastOnline: DateTime
+ zoneId: String
+ deviceType: Enum (SENSOR, GATE, SIGNAGE, CAMERA)
+ deviceName: String (Optional)

#### ## Inherited Class: Sensor
Attributes:
+ parkingSlotId: String (Links to ParkingSlot.slotId)
+ sensitivity: Number (0.0 - 1.0)

#### ## Inherited Class: Gate
*Unified model for Entry/Exit Gates and Barriers.*
Attributes:
+ gateType: Enum (ENTRY, EXIT)
+ ipAddress: String (Hardware IP)
+ isAutoOpen: Boolean

#### ## Inherited Class: Signage
Attributes:
+ message: String (Current displayed text)
+ brightness: int (0 - 100)

#### ## Inherited Class: Camera
Attributes:
+ streamURL: String
+ resolution: String (e.g., "1080p")

---

## 3. Infrastructure & Management

### # Class: InfrastructureAlert
Attributes:
+ deviceId: String (References IoTDevice.deviceId)
+ alertType: Enum (OFFLINE, ERROR, WARNING)
+ message: String
+ status: Enum (ACTIVE, RESOLVED)
+ timestamp: DateTime

### # Class: AuditLog
Attributes:
+ userId: String (References User.userId)
+ action: String
+ targetResource: String (Optional)
+ details: JSON/Mixed (Optional context)
+ timestamp: DateTime

### # Class: SystemConfig
Attributes:
+ settingKey: String (Unique)
+ settingValue: Mixed
+ description: String (Optional)
---

## 4. Business Logic Classes (Services)

### # Class: AuthService
Methods:
+ authenticate(credentials): Token
+ validateSession(token): User
+ register(userData): User

### # Class: BillingService
Methods:
+ calculateFee(session: ParkingSession): Number
+ applyPricingPolicy(userRole, vehicleType): Policy
+ processInvoice(sessionID): Invoice

### # Class: NavigationService
Methods:
+ findOptimalSlot(zoneId): ParkingSlot
+ getGuidingPath(startNode, endNode): Array[Location]

### # Class: ReportService
Methods:
+ generateRevenueReport(startDate, endDate): JSON
+ generateActivityReport(zoneId, date): JSON

### # Class: SystemAdminService
Methods:
+ updateSystemConfig(key, value): void
+ updatePricingPolicy(policyData): void
+ fetchAuditLogs(filters): Array[AuditLog]

---

## 5. Interface Classes (Controllers)

### # Class: EntryExitController
Methods:
+ checkIn(plateNumber, cardID/schoolID): Session
+ checkOut(sessionID): Invoice
+ manualOpenGate(gateId, reason): void

### # Class: IoTDataController
Methods:
+ handleSensorUpdate(deviceId, status): void
+ handleGateHeartbeat(deviceId, lastOnline): void
+ getFleetStatus(): JSON

### # Class: PaymentController
Methods:
+ createPaymentRequest(invoiceId): URL
+ handlePaymentWebhook(payload): void

### # Class: DashboardController
Methods:
+ getRealtimeOccupancy(): JSON
+ getActiveAlerts(): Array[InfrastructureAlert]
