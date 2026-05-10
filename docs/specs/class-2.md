# Class: User
Attributes:
+ userId: String
+ schoolCardId: int
+ fullName: String
+ role: Enum (ADMIN, OPERATOR, USER, FINANCE_OFFICE)
+ email: String
+ userStatus: Enum (ACTIVE, INACTIVE)
+ password: String (hashed)
Methods:
+ comparePassword(plain): Boolean
+ toString()

# Class: Zone
Attributes:
+ zoneId: String
+ zoneName: String
+ capacity: int
+ currentUsage: int
Methods:
+ isFull()
+ getOccupancyRate()

# Class: ParkingSlot
Attributes:
+ slotId: String
+ zoneId: String
+ isAvailable: Boolean
Methods:
+ getStatus()
+ toString()

# Class: Gate
Attributes:
+ gateId: String
+ gateName: String
+ gateType: Enum (IN, OUT)
+ location: String
Methods:
+ isEntry()
+ isExit()
+ toString()

# Class: IoTDevice
Attributes:
+ deviceId: String
+ zoneId: String
+ deviceType: Enum (SENSOR, GATEWAY, LED_SIGN, CAMERA, BARRIER)
+ lastPing: DateTime
+ status: Enum (ONLINE, OFFLINE, ERROR)
+ locationId: String (optional)
+ deviceName: String (optional)
Methods:
+ isOnline()
+ ping()
+ toString()

# Class: Location
Attributes:
+ locationId: String
+ locationName: String
+ coordinates: Array[int] // [x, y] or [row, col]
+ locationType: Enum (GATE, SLOT, INTERSECTION, CLOSET)
Methods:
+ getCoordinates()
+ toString()

# Class: InfrastructureAlert
Attributes:
+ deviceId: String
+ alertType: Enum (OFFLINE, ERROR, WARNING)
+ message: String
+ status: Enum (ACTIVE, RESOLVED)
+ timestamp: DateTime
Methods:
+ resolve()
+ isActive()
+ toString()

# Class: AuditLog
Attributes:
+ userId: String
+ action: String
+ targetResource: String (optional)
+ details: Mixed (optional)
+ timestamp: DateTime
Methods:
+ getSummary()
+ toString()

# Class: SystemConfig
Attributes:
+ settingKey: String
+ settingValue: Mixed
+ description: String (optional)
Methods:
+ getValue()
+ update(newValue)
+ toString()