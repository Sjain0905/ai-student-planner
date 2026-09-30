from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    xp: int
    streak: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Student Profile ---
class ProfileCreate(BaseModel):
    branch: Optional[str] = "Computer Science"
    semester: Optional[int] = 6
    subjects_list: Optional[List[str]] = ["DSA", "DBMS", "OS", "CN"]
    available_study_hours: Optional[float] = 4.0
    preferred_study_time: Optional[str] = "Evening"
    placement_target: Optional[str] = "Software Development Engineer"
    skill_levels: Optional[Dict[str, str]] = {
        "DSA": "Intermediate",
        "DBMS": "Beginner",
        "OS": "Beginner",
        "Aptitude": "Intermediate"
    }

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    branch: Optional[str]
    semester: Optional[int]
    subjects_list: Optional[List[str]]
    available_study_hours: float
    preferred_study_time: str
    placement_target: str
    skill_levels: Optional[Dict[str, str]]
    onboarding_completed: bool

    class Config:
        from_attributes = True

# --- Subject ---
class SubjectCreate(BaseModel):
    name: str
    code: Optional[str] = None
    color: Optional[str] = "#4F46E5"
    priority: Optional[str] = "Medium"

class SubjectResponse(BaseModel):
    id: int
    user_id: int
    name: str
    code: Optional[str]
    color: str
    priority: str

    class Config:
        from_attributes = True

# --- Task ---
class TaskCreate(BaseModel):
    subject_id: Optional[int] = None
    subject_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_hours: float = 1.0
    priority: str = "Medium" # High, Medium, Low
    status: str = "Pending" # Pending, Completed, Missed

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    user_id: int
    subject_id: Optional[int]
    title: str
    description: Optional[str]
    deadline: Optional[datetime]
    estimated_hours: float
    priority: str
    status: str
    xp_reward: int
    created_at: datetime
    completed_at: Optional[datetime]
    subject: Optional[SubjectResponse] = None

    class Config:
        from_attributes = True

# --- Schedule ---
class ScheduleItemResponse(BaseModel):
    id: int
    schedule_id: int
    task_id: Optional[int]
    title: str
    subject: Optional[str]
    start_time: str
    end_time: str
    status: str
    change_type: str # added, moved, removed, unchanged
    original_time_slot: Optional[str]
    priority: str

    class Config:
        from_attributes = True

class ScheduleResponse(BaseModel):
    id: int
    user_id: int
    date: str
    summary: Optional[str]
    replan_explanation: Optional[str]
    status: str
    items: List[ScheduleItemResponse] = []

    class Config:
        from_attributes = True

class ReplanRequest(BaseModel):
    new_task_title: Optional[str] = None
    new_task_subject: Optional[str] = None
    new_task_priority: Optional[str] = "High"
    new_task_hours: Optional[float] = 2.0
    reason: Optional[str] = "Student added high priority urgent assignment"

# --- Placement ---
class PlacementGoalResponse(BaseModel):
    id: int
    user_id: int
    target_role: str
    target_company: str
    target_timeline_weeks: int
    overall_progress: float

    class Config:
        from_attributes = True

class PlacementTopicResponse(BaseModel):
    id: int
    user_id: int
    category: str # DSA, Core, Aptitude, Interview
    topic_name: str
    status: str # Not Started, In Progress, Completed
    week_number: int

    class Config:
        from_attributes = True

class TopicStatusUpdate(BaseModel):
    status: str

# --- Chat ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    agent_used: str
    action_taken: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
