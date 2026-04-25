# Class: User
Attributes:
+ userId: String
+ schoolCardId: int
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
+ cardID: int
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
+ subjectID: String
+ plateNumber: String
+ invoiceId: String // Liên kết với hóa đơn
Methods:
+ isActive()
+ getDuration()
+ updateStatus()
// Các class điều hướng và IoT device
# Class: FeeStrategy

# CycleFeeStrategy
