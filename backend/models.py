import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    timezone = Column(String, nullable=False, default="UTC")
    created_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())
    meetings = relationship("Meeting", back_populates="host", cascade="all, delete-orphan")
    participants = relationship("Participant", back_populates="user")

class Meeting(Base):
    __tablename__ = "meetings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_code = Column(String, unique=True, nullable=False)
    invite_token = Column(String, unique=True, nullable=False)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False, default="scheduled")
    scheduled_start = Column(String, nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=40)
    timezone = Column(String, nullable=False, default="UTC")
    started_at = Column(String, nullable=True)
    ended_at = Column(String, nullable=True)
    created_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())
    __table_args__ = (
        CheckConstraint("type IN ('instant', 'scheduled')", name="check_meeting_type"),
        CheckConstraint("status IN ('scheduled', 'live', 'ended', 'cancelled')", name="check_meeting_status"),
        CheckConstraint("duration_minutes > 0", name="check_duration_minutes"),
        CheckConstraint("type = 'instant' OR scheduled_start IS NOT NULL", name="check_scheduled_start"),
        Index("idx_meetings_host_start", "host_id", "scheduled_start"),
        Index("idx_meetings_host_status", "host_id", "status"),
    )
    host = relationship("User", back_populates="meetings")
    participants = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")

class Participant(Base):
    __tablename__ = "participants"
    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    display_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="participant")
    status = Column(String, nullable=False, default="joined")
    is_muted = Column(Integer, nullable=False, default=0)
    is_video_on = Column(Integer, nullable=False, default=1)
    joined_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())
    left_at = Column(String, nullable=True)
    __table_args__ = (
        CheckConstraint("role IN ('host', 'participant')", name="check_participant_role"),
        CheckConstraint("status IN ('joined', 'left', 'removed')", name="check_participant_status"),
        Index("idx_participants_meeting", "meeting_id", "status"),
        Index("idx_participants_user", "user_id", "joined_at"),
    )
    meeting = relationship("Meeting", back_populates="participants")
    user = relationship("User", back_populates="participants")
