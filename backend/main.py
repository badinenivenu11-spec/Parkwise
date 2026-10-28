import asyncio
import logging
import math
import os
import re
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, model_validator
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import ParkingBay, ParkingSession, Reservation, utc_now


logger = logging.getLogger(__name__)
RATE_PER_HOUR_INR = int(os.getenv("PARKING_RATE_PER_HOUR_INR", "40"))
MINIMUM_CHARGE_INR = int(os.getenv("PARKING_MINIMUM_CHARGE_INR", "20"))
if RATE_PER_HOUR_INR <= 0 or MINIMUM_CHARGE_INR < 0:
    raise ValueError("Parking rate must be positive and minimum charge cannot be negative")


def _initialize_database() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.scalar(select(ParkingBay.id).limit(1)) is None:
            db.add_all(
                ParkingBay(
                    id=f"F{floor}-{number:02d}",
                    floor=floor,
                    number=number,
                    status="available",
                )
                for floor in (1, 2)
                for number in range(1, 9)
            )
            db.commit()


async def _reservation_expiry_loop() -> None:
    while True:
        await asyncio.sleep(30)
        try:
            with SessionLocal() as db:
                await _expire_and_broadcast(db)
        except SQLAlchemyError:
            logger.exception("Could not expire parking reservations")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    _initialize_database()
    expiry_task = asyncio.create_task(_reservation_expiry_loop())
    try:
        yield
    finally:
        expiry_task.cancel()
        try:
            await expiry_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="Smart Parking Management API",
    description="Live parking availability, reservations, check-in, and billing.",
    version="1.0.0",
    lifespan=lifespan,
)
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5500,http://127.0.0.1:5500,http://localhost:8080,"
        "http://127.0.0.1:8080",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)


class CheckInRequest(BaseModel):
    vehicle_plate: str = Field(min_length=2, max_length=20)
    source: Literal["manual", "sensor"] = "manual"

    @field_validator("vehicle_plate")
    @classmethod
    def normalize_plate(cls, value: str) -> str:
        plate = value.strip().upper()
        if not re.fullmatch(r"[A-Z0-9 -]{2,20}", plate):
            raise ValueError("License plate may contain only letters, numbers, spaces, and hyphens")
        return plate


class ReservationCreate(BaseModel):
    bay_id: str = Field(min_length=1, max_length=12)
    license_plate: str = Field(min_length=2, max_length=20)
    starts_at: datetime | None = None
    ends_at: datetime | None = None

    @field_validator("license_plate")
    @classmethod
    def normalize_plate(cls, value: str) -> str:
        plate = value.strip().upper()
        if not re.fullmatch(r"[A-Z0-9 -]{2,20}", plate):
            raise ValueError("License plate may contain only letters, numbers, spaces, and hyphens")
        return plate

    @model_validator(mode="after")
    def validate_reservation_window(self):
        start = self.starts_at or utc_now()
        end = self.ends_at or start + timedelta(hours=2)
        if end <= start:
            raise ValueError("ends_at must be later than starts_at")
        return self


class ConnectionManager:
    def __init__(self):
        self.connections: set[WebSocket] = set()
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self.lock:
            self.connections.add(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self.lock:
            self.connections.discard(websocket)

    async def broadcast(self, message: dict) -> None:
        async with self.lock:
            connections = tuple(self.connections)
        disconnected = []
        for connection in connections:
            try:
                await connection.send_json(message)
            except (OSError, RuntimeError, WebSocketDisconnect):
                disconnected.append(connection)
        if disconnected:
            async with self.lock:
                for connection in disconnected:
                    self.connections.discard(connection)


manager = ConnectionManager()


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _reservation_dict(reservation: Reservation) -> dict:
    return {
        "id": reservation.id,
        "bay_id": reservation.bay_id,
        "license_plate": reservation.license_plate,
        "starts_at": reservation.starts_at.isoformat(),
        "ends_at": reservation.ends_at.isoformat(),
        "status": reservation.status,
    }


def _bay_dict(db: Session, bay: ParkingBay) -> dict:
    reservation = db.scalar(
        select(Reservation)
        .where(Reservation.bay_id == bay.id, Reservation.status == "active")
        .order_by(Reservation.created_at.desc())
    )
    return {
        "id": bay.id,
        "floor": bay.floor,
        "number": bay.number,
        "status": bay.status,
        "vehicle_plate": bay.vehicle_plate,
        "occupied_since": _as_utc(bay.occupied_since).isoformat()
        if bay.occupied_since
        else None,
        "reservation": _reservation_dict(reservation) if reservation else None,
    }


def _expire_reservations(db: Session) -> list[ParkingBay]:
    now = utc_now()
    expired = list(
        db.scalars(
            select(Reservation).where(
                Reservation.status == "active", Reservation.ends_at <= now
            )
        )
    )
    changed_bays = []
    for reservation in expired:
        reservation.status = "expired"
        bay = db.get(ParkingBay, reservation.bay_id)
        if bay and bay.status == "reserved":
            bay.status = "available"
            changed_bays.append(bay)
    if expired:
        db.commit()
    return changed_bays


async def _expire_and_broadcast(db: Session) -> None:
    for bay in _expire_reservations(db):
        await manager.broadcast({"type": "BAY_UPDATE", "bay": _bay_dict(db, bay)})


def _active_session(db: Session, bay_id: str) -> ParkingSession | None:
    return db.scalar(
        select(ParkingSession)
        .where(
            ParkingSession.bay_id == bay_id,
            ParkingSession.checked_out_at.is_(None),
        )
        .order_by(ParkingSession.checked_in_at.desc())
    )


def _analytics_dict(db: Session) -> dict:
    bays = list(db.scalars(select(ParkingBay)))
    total = len(bays)
    occupied = sum(bay.status == "occupied" for bay in bays)
    reserved = sum(bay.status == "reserved" for bay in bays)
    available = sum(bay.status == "available" for bay in bays)
    return {
        "total_capacity": total,
        "occupied": occupied,
        "available": available,
        "reserved": reserved,
        "occupancy_rate": round((occupied + reserved) * 100 / total, 1) if total else 0,
        "rate_per_hour_inr": RATE_PER_HOUR_INR,
        "minimum_charge_inr": MINIMUM_CHARGE_INR,
    }


def _require_bay(db: Session, bay_id: str) -> ParkingBay:
    bay = db.get(ParkingBay, bay_id)
    if bay is None:
        raise HTTPException(status_code=404, detail="Parking bay not found")
    return bay


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/bays")
async def list_bays(db: Session = Depends(get_db)) -> list[dict]:
    await _expire_and_broadcast(db)
    bays = db.scalars(select(ParkingBay).order_by(ParkingBay.floor, ParkingBay.number))
    return [_bay_dict(db, bay) for bay in bays]


@app.get("/api/analytics")
async def get_analytics(db: Session = Depends(get_db)) -> dict:
    await _expire_and_broadcast(db)
    return _analytics_dict(db)


@app.post("/api/bays/{bay_id}/check-in")
async def check_in(
    bay_id: str,
    request: CheckInRequest,
    db: Session = Depends(get_db),
) -> dict:
    await _expire_and_broadcast(db)
    bay = _require_bay(db, bay_id)
    if bay.status == "occupied":
        raise HTTPException(status_code=409, detail="Parking bay is already occupied")

    reservation = db.scalar(
        select(Reservation).where(
            Reservation.bay_id == bay.id, Reservation.status == "active"
        )
    )
    if bay.status == "reserved":
        if reservation is None:
            raise HTTPException(
                status_code=409, detail="Parking bay reservation is unavailable"
            )
        if request.vehicle_plate != reservation.license_plate:
            raise HTTPException(
                status_code=409,
                detail="License plate does not match the reservation",
            )
        if _as_utc(reservation.starts_at) > utc_now():
            raise HTTPException(
                status_code=409, detail="Reservation has not started yet"
            )

    now = utc_now()
    bay.status = "occupied"
    bay.vehicle_plate = request.vehicle_plate
    bay.occupied_since = now
    parking_session = ParkingSession(
        bay_id=bay.id,
        license_plate=request.vehicle_plate,
        source=request.source,
        checked_in_at=now,
    )
    db.add(parking_session)
    if reservation:
        reservation.status = "fulfilled"
    db.commit()
    db.refresh(parking_session)
    bay_data = _bay_dict(db, bay)
    await manager.broadcast({"type": "BAY_UPDATE", "bay": bay_data})
    return {"bay": bay_data, "session_id": parking_session.id}


@app.post("/api/bays/{bay_id}/check-out")
async def check_out(bay_id: str, db: Session = Depends(get_db)) -> dict:
    await _expire_and_broadcast(db)
    bay = _require_bay(db, bay_id)
    if bay.status != "occupied":
        raise HTTPException(status_code=409, detail="Parking bay is not occupied")
    parking_session = _active_session(db, bay.id)
    if parking_session is None:
        raise HTTPException(
            status_code=409, detail="No active parking session exists for this bay"
        )

    now = utc_now()
    duration_seconds = max(
        0, int((now - _as_utc(parking_session.checked_in_at)).total_seconds())
    )
    duration_minutes = max(1, math.ceil(duration_seconds / 60))
    charge = max(
        MINIMUM_CHARGE_INR,
        math.ceil(duration_seconds * RATE_PER_HOUR_INR / 3600),
    )
    parking_session.checked_out_at = now
    parking_session.duration_minutes = duration_minutes
    parking_session.amount_inr = charge
    bay.status = "available"
    bay.vehicle_plate = None
    bay.occupied_since = None
    db.commit()
    bay_data = _bay_dict(db, bay)
    await manager.broadcast({"type": "BAY_UPDATE", "bay": bay_data})
    return {
        "bay": bay_data,
        "receipt": {
            "session_id": parking_session.id,
            "bay_id": bay.id,
            "license_plate": parking_session.license_plate,
            "checked_in_at": _as_utc(parking_session.checked_in_at).isoformat(),
            "checked_out_at": now.isoformat(),
            "duration_minutes": duration_minutes,
            "rate_per_hour_inr": RATE_PER_HOUR_INR,
            "minimum_charge_inr": MINIMUM_CHARGE_INR,
            "amount_inr": charge,
        },
    }


@app.get("/api/reservations")
async def list_reservations(db: Session = Depends(get_db)) -> list[dict]:
    await _expire_and_broadcast(db)
    reservations = db.scalars(
        select(Reservation)
        .where(Reservation.status == "active")
        .order_by(Reservation.starts_at)
    )
    return [_reservation_dict(reservation) for reservation in reservations]


@app.post("/api/reservations", status_code=201)
async def create_reservation(
    request: ReservationCreate,
    db: Session = Depends(get_db),
) -> dict:
    await _expire_and_broadcast(db)
    bay = _require_bay(db, request.bay_id)
    if bay.status != "available":
        raise HTTPException(
            status_code=409, detail="Only available parking bays can be reserved"
        )

    starts_at = request.starts_at or utc_now()
    ends_at = request.ends_at or starts_at + timedelta(hours=2)
    if ends_at <= starts_at:
        raise HTTPException(status_code=422, detail="ends_at must be later than starts_at")
    if ends_at <= utc_now():
        raise HTTPException(
            status_code=422, detail="Reservation end time must be in the future"
        )

    reservation = Reservation(
        bay_id=bay.id,
        license_plate=request.license_plate,
        starts_at=starts_at,
        ends_at=ends_at,
        status="active",
    )
    db.add(reservation)
    bay.status = "reserved"
    db.commit()
    db.refresh(reservation)
    bay_data = _bay_dict(db, bay)
    await manager.broadcast({"type": "BAY_UPDATE", "bay": bay_data})
    return _reservation_dict(reservation)


@app.delete("/api/reservations/{reservation_id}")
async def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
) -> dict:
    await _expire_and_broadcast(db)
    reservation = db.get(Reservation, reservation_id)
    if reservation is None or reservation.status != "active":
        raise HTTPException(status_code=404, detail="Active reservation not found")
    bay = _require_bay(db, reservation.bay_id)
    reservation.status = "cancelled"
    if bay.status == "reserved":
        bay.status = "available"
    db.commit()
    bay_data = _bay_dict(db, bay)
    await manager.broadcast({"type": "BAY_UPDATE", "bay": bay_data})
    return {"reservation_id": reservation_id, "bay": bay_data}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
