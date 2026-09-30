from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, StudentProfile, PlacementGoal
from app.schemas.schemas import ProfileCreate, ProfileResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["Student Profile"])

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return ProfileResponse.model_validate(profile)

@router.post("", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    profile.branch = profile_in.branch
    profile.semester = profile_in.semester
    profile.subjects_list = profile_in.subjects_list
    profile.available_study_hours = profile_in.available_study_hours
    profile.preferred_study_time = profile_in.preferred_study_time
    profile.placement_target = profile_in.placement_target
    profile.skill_levels = profile_in.skill_levels
    profile.onboarding_completed = True

    # Also update placement goal target role
    placement = db.query(PlacementGoal).filter(PlacementGoal.user_id == current_user.id).first()
    if placement:
        placement.target_role = profile_in.placement_target

    db.commit()
    db.refresh(profile)
    return ProfileResponse.model_validate(profile)
