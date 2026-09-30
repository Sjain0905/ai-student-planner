import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=1)
    last_active_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    subjects = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="user", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="user", cascade="all, delete-orphan")
    placement_goal = relationship("PlacementGoal", back_populates="user", uselist=False, cascade="all, delete-orphan")
    placement_topics = relationship("PlacementTopic", back_populates="user", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    branch = Column(String, nullable=True)
    semester = Column(Integer, nullable=True)
    subjects_list = Column(JSON, nullable=True) # e.g. ["DSA", "OS", "DBMS", "CN"]
    available_study_hours = Column(Float, default=4.0)
    preferred_study_time = Column(String, default="Evening") # Morning, Afternoon, Evening, Night
    placement_target = Column(String, default="Software Development Engineer")
    skill_levels = Column(JSON, nullable=True) # e.g. {"DSA": "Beginner", "DBMS": "Intermediate"}
    onboarding_completed = Column(Boolean, default=False)

    user = relationship("User", back_populates="profile")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)
    color = Column(String, default="#4F46E5") # indigo default
    priority = Column(String, default="Medium") # High, Medium, Low

    user = relationship("User", back_populates="subjects")
    tasks = relationship("Task", back_populates="subject")
    exams = relationship("Exam", back_populates="subject")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=True)
    estimated_hours = Column(Float, default=1.0)
    priority = Column(String, default="Medium") # High, Medium, Low
    status = Column(String, default="Pending") # Pending, Completed, Missed
    xp_reward = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="tasks")
    subject = relationship("Subject", back_populates="tasks")
    schedule_items = relationship("ScheduleItem", back_populates="task")
    study_sessions = relationship("StudySession", back_populates="task")


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    exam_date = Column(DateTime, nullable=False)
    total_marks = Column(Integer, default=100)

    user = relationship("User", back_populates="exams")
    subject = relationship("Subject", back_populates="exams")


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(String, nullable=False) # e.g. YYYY-MM-DD
    summary = Column(Text, nullable=True)
    replan_explanation = Column(Text, nullable=True) # AI explanation for "Why was my schedule changed?"
    status = Column(String, default="Active") # Active, Archived
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="schedules")
    items = relationship("ScheduleItem", back_populates="schedule", cascade="all, delete-orphan")


class ScheduleItem(Base):
    __tablename__ = "schedule_items"

    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    start_time = Column(String, nullable=False) # e.g. "05:00 PM"
    end_time = Column(String, nullable=False)   # e.g. "07:00 PM"
    status = Column(String, default="Pending") # Pending, Completed, Missed
    change_type = Column(String, default="unchanged") # added, moved, removed, unchanged
    original_time_slot = Column(String, nullable=True) # e.g. "08:00 PM" before move
    priority = Column(String, default="Medium")

    schedule = relationship("Schedule", back_populates="items")
    task = relationship("Task", back_populates="schedule_items")


class PlacementGoal(Base):
    __tablename__ = "placement_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    target_role = Column(String, nullable=False, default="Software Engineer")
    target_company = Column(String, default="Top Tech / Product Companies")
    target_timeline_weeks = Column(Integer, default=4)
    overall_progress = Column(Float, default=0.0) # 0 to 100%

    user = relationship("User", back_populates="placement_goal")


class PlacementTopic(Base):
    __tablename__ = "placement_topics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False) # DSA, Core, Aptitude, Interview
    topic_name = Column(String, nullable=False)
    status = Column(String, default="Not Started") # Not Started, In Progress, Completed
    week_number = Column(Integer, default=1)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="placement_topics")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="study_sessions")
    task = relationship("Task", back_populates="study_sessions")
