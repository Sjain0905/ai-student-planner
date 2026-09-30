from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Subject
from app.schemas.schemas import SubjectCreate, SubjectResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.get("", response_model=List[SubjectResponse])
def get_subjects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subjects = db.query(Subject).filter(Subject.user_id == current_user.id).all()
    return [SubjectResponse.model_validate(s) for s in subjects]

@router.post("", response_model=SubjectResponse)
def create_subject(
    subj_in: SubjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = Subject(
        user_id=current_user.id,
        name=subj_in.name,
        code=subj_in.code,
        color=subj_in.color or "#4F46E5",
        priority=subj_in.priority or "Medium"
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return SubjectResponse.model_validate(subject)
