"""Pydantic schemas for API request/response models."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


# =============================================================================
# Live Map (Màn hình 4)
# =============================================================================


class SlotLiveItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    x: float
    y: float
    status: Literal["available", "occupied"]


# =============================================================================
# IoT Devices (Màn hình 9)
# =============================================================================


class DeviceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str  # SENSOR, GATEWAY, CAMERA, SIGNAGE
    x: float
    y: float
    status: Literal["Online", "Offline"]


# =============================================================================
# Parking Sessions (Màn hình 2)
# =============================================================================


class SessionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    licensePlate: str
    entryTime: datetime
    exitTime: Optional[datetime]
    fee: float
    status: str


# =============================================================================
# Audit Logs (Màn hình 11)
# =============================================================================


class AuditLogItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    actorId: int
    action: str
    target: str
    reason: Optional[str]
    timestamp: datetime


# =============================================================================
# Dashboard Stats (Màn hình 7)
# =============================================================================


class DashboardStats(BaseModel):
    totalParked: int
    unresolvedDeviceErrors: int
