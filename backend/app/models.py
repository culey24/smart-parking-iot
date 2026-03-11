"""SQLModel models matching Prisma schema for dev.db."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


# =============================================================================
# IDENTITY
# =============================================================================


class Role(SQLModel, table=True):
    __tablename__ = "Role"

    id: int = Field(primary_key=True, default=None)
    name: str = Field(unique=True)


class User(SQLModel, table=True):
    __tablename__ = "User"

    id: int = Field(primary_key=True, default=None)
    mssvMscb: str = Field(unique=True)
    fullName: str
    email: str
    roleId: int = Field(foreign_key="Role.id")


class Card(SQLModel, table=True):
    __tablename__ = "Card"

    id: int = Field(primary_key=True, default=None)
    cardUid: str = Field(unique=True)
    userId: Optional[int] = Field(default=None, foreign_key="User.id")
    status: str  # Active, Disabled


# =============================================================================
# INFRASTRUCTURE
# =============================================================================


class Device(SQLModel, table=True):
    __tablename__ = "Device"

    id: int = Field(primary_key=True, default=None)
    type: str  # SENSOR, GATEWAY, CAMERA, SIGNAGE
    x: float
    y: float
    status: str = Field(default="ONLINE")  # ONLINE, OFFLINE, ERROR


class Slot(SQLModel, table=True):
    __tablename__ = "Slot"

    id: int = Field(primary_key=True, default=None)
    label: str
    deviceId: int = Field(unique=True, foreign_key="Device.id")
    status: str = Field(default="AVAILABLE")  # AVAILABLE, OCCUPIED


# =============================================================================
# TRANSACTIONS
# =============================================================================


class ParkingSession(SQLModel, table=True):
    __tablename__ = "ParkingSession"

    id: int = Field(primary_key=True, default=None)
    cardId: int = Field(foreign_key="Card.id")
    licensePlate: str
    entryTime: datetime
    exitTime: Optional[datetime] = None
    fee: float
    status: str = Field(default="ONGOING")  # ONGOING, COMPLETED


# =============================================================================
# BILLING & POLICY
# =============================================================================


class BillingCycle(SQLModel, table=True):
    __tablename__ = "BillingCycle"

    id: int = Field(primary_key=True, default=None)
    name: str
    startDate: datetime
    endDate: datetime


class PricingPolicy(SQLModel, table=True):
    __tablename__ = "PricingPolicy"

    id: int = Field(primary_key=True, default=None)
    roleId: int = Field(foreign_key="Role.id")
    vehicleType: str
    baseFee: float
    hourlyRate: float


# =============================================================================
# AUDITING
# =============================================================================


class AuditLog(SQLModel, table=True):
    __tablename__ = "AuditLog"

    id: int = Field(primary_key=True, default=None)
    actorId: int = Field(foreign_key="User.id")
    action: str
    target: str
    reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class InfrastructureAlert(SQLModel, table=True):
    __tablename__ = "InfrastructureAlert"

    id: int = Field(primary_key=True, default=None)
    deviceId: int = Field(foreign_key="Device.id")
    message: str
    severity: str  # critical, warning, error
    isResolved: bool = Field(default=False)
