import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/participants", tags=["participants"])

@router.put("/{participant_id}/mute", response_model=schemas.ParticipantOut)
def toggle_mute(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    participant.is_muted = 1 if participant.is_muted == 0 else 0
    db.commit()
    db.refresh(participant)
    return participant

@router.put("/{participant_id}/video", response_model=schemas.ParticipantOut)
def toggle_video(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    participant.is_video_on = 1 if participant.is_video_on == 0 else 0
    db.commit()
    db.refresh(participant)
    return participant

@router.put("/meeting/{meeting_id}/mute-all")
def mute_all_participants(meeting_id: int, db: Session = Depends(get_db)):
    participants = db.query(models.Participant).filter(
        models.Participant.meeting_id == meeting_id,
        models.Participant.status == "joined",
        models.Participant.role != "host"
    ).all()
    for p in participants:
        p.is_muted = 1
    db.commit()
    return {"message": "All participants muted", "count": len(participants)}

@router.delete("/{participant_id}")
def remove_participant(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    participant.status = "removed"
    participant.left_at = datetime.datetime.utcnow().isoformat()
    db.commit()
    return {"message": "Participant removed successfully"}
