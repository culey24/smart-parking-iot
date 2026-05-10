# *ENTITY CLASSES
# Class: User
Attributes:
+ userId: String
+ schoolCardId: String
+ fullName: String
+ role: Enum ()
+ email: String
+ userStatus: Enum ()
Methods:
- syncProfileData()
+ authenticateSSO()
+ toString()
# Class: TemporaryCard
Attributes:
+ tempCardID: int
+ cardStatus: Enum (ACTIVATING, DEACTIVATED)
Methods:
+ getCardId()
+ toString()
# Class: ParkingSession
Attributes:
+ sessionId: String 
+ startTime: DateTime
+ endTime: DateTime
+ sessionStatus: Enum
+ type: Enum(REGISTERED, TEMPORARY)
+ subjectID: String // Liên kết với tempCardID hoặc schoolCardId
+ plateNumber: String
+ invoiceId: String // Liên kết với hóa đơn
Methods:
+ isActive()
+ getDuration()
+ updateStatus()
# Class: Invoice
Attributes:
- invoiceId: String
- amount: Double
- paymentStatus: Enum()
- issueDate: DateTime
Methods:
- 
# Abstract Class: IoTDevice
Attributes:
- deviceId: String
- locationId: String
- status: Enum DeviceStatus(ONLINE, OFFLINE, MAINTAINANCE, ERROR)
- lastOnline: DateTime
Methods:
- getStatus(): DeviceStatus
- reboot(): void
## Inherited Class: Sensor
Attributes:
- parkingSlotId: String
- sensitivity: double
Methods: 
- detectOcupancy(): Boolean
## Inherited Class: Signage
Attributes:
- message: String
- brightness: int
Methods: 
- updateText(text: String)
## Inherited Class: Gate
Attributes:
- gateType: Enum(ENTRY, EXIT)
Methods:
- openGate()
- closeGate()
## Inherited Class: Camera
Attributes: 
- resolution: String
- streamURL: String
Methods:
- captureSnapshot()
- detectPlate()
- getLiveStream()
# Class: Location
Attributes:
- locationId: String
- locationName: String
- coordinates: [x, y]
- locationType: Enum(GATE, SLOT, INTERSECTION, CLOSET)
Methods:
- getCoordinates()
- toString()
- toJson()
- getLocationType()
# Class: ParkingSlot
Attributes:
- slotId: String
- zoneId: String
- isAvailable: Boolean
Methods:
- updateStatus()
- getOccupancy()
# Class: ParkingZone
Attributes:
- zoneId: String
- zoneName: String
- capacity: int
- currentUsage: int
Methods:
- calculateAvailability()
- isFull()
# *BUSINESS CLASSES
# Class: ParkingManager
Attributes:
Methods:
# Class: BillingService
# Class: NavigationService
# Class: AuthService
# CONTROLLER CLASSES
# Class: EntryExitController
# Class: PaymentController
# Class: IoTDataController
# Class: DashboardController