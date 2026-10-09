import random
import string
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

def generate_meeting_code() -> str:
    nums = [str(random.randint(0, 9)) for _ in range(11)]
    return "".join(nums)

def generate_invite_token(length: int = 16) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))

def get_default_user(db: Session) -> models.User:
    user = db.query(models.User).first()
    if not user:
        user = models.User(
            email="alex.morgan@zoomclone.local",
            display_name="Alex Morgan",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb",
            timezone="UTC"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/", response_model=List[schemas.MeetingOut])
def list_meetings(
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Meeting)
    if status:
        query = query.filter(models.Meeting.status == status)
    if type:
        query = query.filter(models.Meeting.type == type)
    return query.order_by(models.Meeting.created_at.desc()).all()

@router.post("/instant", response_model=schemas.MeetingOut)
def create_instant_meeting(
    payload: schemas.MeetingCreateInstant,
    db: Session = Depends(get_db)
):
    user = get_default_user(db)
    meeting_code = generate_meeting_code()
    invite_token = generate_invite_token()
    now_str = datetime.datetime.utcnow().isoformat()

    meeting = models.Meeting(
        meeting_code=meeting_code,
        invite_token=invite_token,
        host_id=user.id,
        title=payload.title or f"{user.display_name} Personal Meeting Room",
        description=payload.description or "Instant Zoom Meeting",
        type="instant",
        status="live",
        started_at=now_str,
        duration_minutes=40,
        timezone="UTC"
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    host_participant = models.Participant(
        meeting_id=meeting.id,
        user_id=user.id,
        display_name=user.display_name,
        role="host",
        status="joined",
        is_muted=0,
        is_video_on=1,
        joined_at=now_str
    )
    db.add(host_participant)
    db.commit()
    db.refresh(meeting)
    return meeting

@router.post("/schedule", response_model=schemas.MeetingOut)
def schedule_meeting(
    payload: schemas.MeetingCreateSchedule,
    db: Session = Depends(get_db)
):
    user = get_default_user(db)
    meeting_code = generate_meeting_code()
    invite_token = generate_invite_token()

    meeting = models.Meeting(
        meeting_code=meeting_code,
        invite_token=invite_token,
        host_id=user.id,
        title=payload.title,
        description=payload.description or "",
        type="scheduled",
        status="scheduled",
        scheduled_start=payload.scheduled_start,
        duration_minutes=payload.duration_minutes or 40,
        timezone=payload.timezone or "UTC"
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting

@router.get("/{identifier}", response_model=schemas.MeetingOut)
def get_meeting(identifier: str, db: Session = Depends(get_db)):
    clean_id = identifier.replace("-", "").replace(" ", "").strip()
    meeting = db.query(models.Meeting).filter(
        or_(
            models.Meeting.meeting_code == clean_id,
            models.Meeting.invite_token == identifier,
            models.Meeting.id == int(identifier) if identifier.isdigit() else False
        )
    ).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.post("/{identifier}/start", response_model=schemas.MeetingOut)
def start_meeting(identifier: str, db: Session = Depends(get_db)):
    meeting = get_meeting(identifier, db)
    if meeting.status != "live":
        meeting.status = "live"
        if not meeting.started_at:
            meeting.started_at = datetime.datetime.utcnow().isoformat()
        db.commit()
        db.refresh(meeting)
    return meeting

@router.post("/{identifier}/end", response_model=schemas.MeetingOut)
def end_meeting(identifier: str, db: Session = Depends(get_db)):
    meeting = get_meeting(identifier, db)
    meeting.status = "ended"
    meeting.ended_at = datetime.datetime.utcnow().isoformat()
    for p in meeting.participants:
        if p.status == "joined":
            p.status = "left"
            p.left_at = datetime.datetime.utcnow().isoformat()
    db.commit()
    db.refresh(meeting)
    return meeting

@router.post("/{identifier}/join", response_model=schemas.ParticipantOut)
def join_meeting(
    identifier: str,
    payload: schemas.MeetingJoinRequest,
    db: Session = Depends(get_db)
):
    meeting = get_meeting(identifier, db)
    if meeting.status == "ended":
        raise HTTPException(status_code=400, detail="Meeting has already ended")
    if meeting.status == "cancelled":
        raise HTTPException(status_code=400, detail="Meeting has been cancelled")

    if meeting.status == "scheduled":
        meeting.status = "live"
        meeting.started_at = datetime.datetime.utcnow().isoformat()

    now_str = datetime.datetime.utcnow().isoformat()
    existing = db.query(models.Participant).filter(
        models.Participant.meeting_id == meeting.id,
        models.Participant.display_name == payload.display_name
    ).first()

    if existing:
        existing.status = "joined"
        existing.left_at = None
        db.commit()
        db.refresh(existing)
        return existing

    user = get_default_user(db)
    is_host = (payload.user_id == meeting.host_id) or (payload.display_name == user.display_name)
    role = "host" if is_host else "participant"

    participant = models.Participant(
        meeting_id=meeting.id,
        user_id=payload.user_id,
        display_name=payload.display_name,
        role=role,
        status="joined",
        is_muted=0,
        is_video_on=1,
        joined_at=now_str
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant

@router.post("/{identifier}/leave", response_model=schemas.ParticipantOut)
def leave_meeting(
    identifier: str,
    payload: schemas.MeetingJoinRequest,
    db: Session = Depends(get_db)
):
    meeting = get_meeting(identifier, db)
    participant = db.query(models.Participant).filter(
        models.Participant.meeting_id == meeting.id,
        models.Participant.display_name == payload.display_name,
        models.Participant.status == "joined"
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Joined participant not found")

    participant.status = "left"
    participant.left_at = datetime.datetime.utcnow().isoformat()
    db.commit()
    db.refresh(participant)
    return participant

@router.get("/{identifier}/participants", response_model=List[schemas.ParticipantOut])
def get_meeting_participants(identifier: str, db: Session = Depends(get_db)):
    meeting = get_meeting(identifier, db)
    return [p for p in meeting.participants if p.status == "joined"]
