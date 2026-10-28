from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ParkingBay(Base):
    __tablename__ = "parking_bays"
    __table_args__ = (
        CheckConstraint("floor IN (1, 2)", name="ck_parking_bays_floor"),
        CheckConstraint(
            "status IN ('available', 'occupied', 'reserved')",
            name="ck_parking_bays_status",
        ),
    )

    id: Mapped[str] = mapped_column(String(12), primary_key=True)
    floor: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="available", index=True
    )
    vehicle_plate: Mapped[str | None] = mapped_column(String(20), nullable=True)
    occupied_since: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    reservations: Mapped[list["Reservation"]] = relationship(
        back_populates="bay", cascade="all, delete-orphan"
    )
    sessions: Mapped[list["ParkingSession"]] = relationship(back_populates="bay")


class Reservation(Base):
    __tablename__ = "reservations"
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'fulfilled', 'cancelled', 'expired')",
            name="ck_reservations_status",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bay_id: Mapped[str] = mapped_column(
        ForeignKey("parking_bays.id", ondelete="CASCADE"), nullable=False, index=True
    )
    license_plate: Mapped[str] = mapped_column(String(20), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="active", index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    bay: Mapped[ParkingBay] = relationship(back_populates="reservations")


class ParkingSession(Base):
    __tablename__ = "parking_sessions"
    __table_args__ = (
        CheckConstraint(
            "source IN ('manual', 'sensor')", name="ck_parking_sessions_source"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bay_id: Mapped[str] = mapped_column(
        ForeignKey("parking_bays.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    license_plate: Mapped[str] = mapped_column(String(20), nullable=False)
    source: Mapped[str] = mapped_column(String(16), nullable=False)
    checked_in_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    checked_out_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    amount_inr: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bay: Mapped[ParkingBay] = relationship(back_populates="sessions")
