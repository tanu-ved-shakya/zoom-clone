from typing import Optional, List
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    email: str
    display_name: str
    avatar_url: Optional[str] = None
    timezone: str = "UTC"

class UserOut(UserBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

class ParticipantBase(BaseModel):
    display_name: str
    role: str = "participant"
    is_muted: int = 0
    is_video_on: int = 1

class ParticipantCreate(ParticipantBase):
    user_id: Optional[int] = None

class ParticipantUpdate(BaseModel):
    is_muted: Optional[int] = None
    is_video_on: Optional[int] = None
    status: Optional[str] = None

class ParticipantOut(BaseModel):
    id: int
    meeting_id: int
    user_id: Optional[int] = None
    display_name: str
    role: str
    status: str
    is_muted: int
    is_video_on: int
    joined_at: str
    left_at: Optional[str] = None

    class Config:
        from_attributes = True

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int = 40
    timezone: str = "UTC"

class MeetingCreateInstant(BaseModel):
    title: Optional[str] = "Instant Meeting"
    description: Optional[str] = ""

class MeetingCreateSchedule(MeetingBase):
    scheduled_start: str # ISO-8601 UTC

class MeetingOut(BaseModel):
    id: int
    meeting_code: str
    invite_token: str
    host_id: int
    title: str
    description: Optional[str] = None
    type: str
    status: str
    scheduled_start: Optional[str] = None
    duration_minutes: int
    timezone: str
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    created_at: str
    host: Optional[UserOut] = None
    participants: Optional[List[ParticipantOut]] = []

    class Config:
        from_attributes = True

class MeetingJoinRequest(BaseModel):
    display_name: str
    user_id: Optional[int] = None
