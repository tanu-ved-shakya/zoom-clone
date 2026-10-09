from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from routers.meetings import get_default_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
def get_current_user(db: Session = Depends(get_db)):
    return get_default_user(db)
