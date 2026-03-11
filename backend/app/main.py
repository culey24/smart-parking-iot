"""FastAPI application for Smart Parking IoT API."""

from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import engine, get_session
from app.models import Slot, Device, Card, ParkingSession, AuditLog, InfrastructureAlert
from app.schemas import (
    SlotLiveItem,
    DeviceItem,
    SessionItem,
    AuditLogItem,
    DashboardStats,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Cleanup if needed


app = FastAPI(
    title="Smart Parking IoT API",
    description="API phục vụ Frontend Smart Parking SPMS",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: allow frontend at localhost:5173
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Dependencies
# =============================================================================


SessionDep = Annotated[Session, Depends(get_session)]


# =============================================================================
# Exception handling
# =============================================================================


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    from fastapi.responses import JSONResponse
    if isinstance(exc, HTTPException):
        raise exc
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


# =============================================================================
# API Endpoints
# =============================================================================


@app.get("/api/slots/live", response_model=list[SlotLiveItem])
def get_slots_live(session: SessionDep) -> list[SlotLiveItem]:
    """
    Live Map (Màn hình 4): Danh sách tất cả Slot kèm tọa độ x, y và trạng thái
    (available/occupied) từ bảng Slots và Devices.
    """
    stmt = select(Slot, Device).join(Device, Slot.deviceId == Device.id)
    rows = session.exec(stmt).all()
    result: list[SlotLiveItem] = []
    for slot, device in rows:
        status = "available" if slot.status.upper() == "AVAILABLE" else "occupied"
        result.append(
            SlotLiveItem(
                id=slot.id,
                label=slot.label,
                x=device.x,
                y=device.y,
                status=status,
            )
        )
    return result


@app.get("/api/devices", response_model=list[DeviceItem])
def get_devices(
    session: SessionDep,
    type_filter: str | None = Query(None, alias="type", description="SENSOR, GATEWAY, CAMERA, SIGNAGE"),
) -> list[DeviceItem]:
    """
    Giám sát IoT (Màn hình 9): Danh sách Gateway, Sensor, Camera kèm trạng thái
    Online/Offline.
    """
    stmt = select(Device)
    if type_filter:
        stmt = stmt.where(Device.type == type_filter)
    devices = session.exec(stmt).all()
    return [
        DeviceItem(
            id=d.id,
            type=d.type,
            x=d.x,
            y=d.y,
            status="Online" if d.status.upper() == "ONLINE" else "Offline",  # ERROR -> Offline
        )
        for d in devices
    ]


@app.get("/api/sessions/{user_id}", response_model=list[SessionItem])
def get_sessions_by_user(user_id: int, session: SessionDep) -> list[SessionItem]:
    """
    Lịch sử đỗ xe (Màn hình 2): Các phiên đỗ xe của một User cụ thể.
    """
    stmt = (
        select(ParkingSession)
        .join(Card, ParkingSession.cardId == Card.id)
        .where(Card.userId == user_id)
        .order_by(ParkingSession.entryTime.desc())
    )
    sessions = session.exec(stmt).all()
    return [
        SessionItem(
            id=s.id,
            licensePlate=s.licensePlate,
            entryTime=s.entryTime,
            exitTime=s.exitTime,
            fee=s.fee,
            status=s.status,
        )
        for s in sessions
    ]


@app.get("/api/audit-logs", response_model=list[AuditLogItem])
def get_audit_logs(
    session: SessionDep,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> list[AuditLogItem]:
    """
    Nhật ký hệ thống (Màn hình 11): Danh sách tác động vào hệ thống,
    sắp xếp theo thời gian mới nhất.
    """
    stmt = (
        select(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
    )
    logs = session.exec(stmt).all()
    return [
        AuditLogItem(
            id=log.id,
            actorId=log.actorId,
            action=log.action,
            target=log.target,
            reason=log.reason,
            timestamp=log.timestamp,
        )
        for log in logs
    ]


@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(session: SessionDep) -> DashboardStats:
    """
    Thống kê Dashboard (Màn hình 7): Tổng số xe đang đỗ, số lỗi thiết bị chưa xử lý.
    """
    from sqlmodel import func

    parked_stmt = select(func.count(ParkingSession.id)).where(
        ParkingSession.status == "ONGOING"
    )
    parked = session.exec(parked_stmt).one() or 0

    alerts_stmt = select(func.count(InfrastructureAlert.id)).where(
        InfrastructureAlert.isResolved == False
    )
    unresolved = session.exec(alerts_stmt).one() or 0

    return DashboardStats(
        totalParked=parked,
        unresolvedDeviceErrors=unresolved,
    )


# =============================================================================
# Health
# =============================================================================


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
