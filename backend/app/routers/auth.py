from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, StudentProfile, PlacementGoal, Subject
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        xp=100, # Initial welcome bonus XP
        streak=1
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default student profile
    profile = StudentProfile(
        user_id=user.id,
        branch="Computer Science & Engineering",
        semester=6,
        subjects_list=["DSA", "DBMS", "OS", "Computer Networks"],
        available_study_hours=4.0,
        preferred_study_time="Evening",
        placement_target="Software Development Engineer",
        onboarding_completed=False
    )
    db.add(profile)

    # Initialize default placement goal
    placement_goal = PlacementGoal(
        user_id=user.id,
        target_role="Software Engineer",
        target_company="Top Tech & Product Companies",
        target_timeline_weeks=4,
        overall_progress=15.0
    )
    db.add(placement_goal)

    # Default Subjects
    default_subjects = [
        Subject(user_id=user.id, name="Data Structures & Algorithms", code="DSA", color="#6366F1", priority="High"),
        Subject(user_id=user.id, name="Database Management Systems", code="DBMS", color="#3B82F6", priority="High"),
        Subject(user_id=user.id, name="Operating Systems", code="OS", color="#10B981", priority="Medium"),
        Subject(user_id=user.id, name="Computer Networks", code="CN", color="#F59E0B", priority="Medium")
    ]
    for subj in default_subjects:
        db.add(subj)

    db.commit()

    access_token = create_access_token({"sub": str(user.id)})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token({"sub": str(user.id)})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
