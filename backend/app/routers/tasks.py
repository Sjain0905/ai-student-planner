import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Task, Subject, StudySession
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Task).filter(Task.user_id == current_user.id)
    if status:
        query = query.filter(Task.status == status)
    tasks = query.order_by(Task.created_at.desc()).all()
    return [TaskResponse.model_validate(t) for t in tasks]

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find or attach subject if name supplied
    subject_id = task_in.subject_id
    if not subject_id and task_in.subject_name:
        subj = db.query(Subject).filter(
            Subject.user_id == current_user.id,
            Subject.name.ilike(f"%{task_in.subject_name}%")
        ).first()
        if subj:
            subject_id = subj.id
        else:
            new_subj = Subject(user_id=current_user.id, name=task_in.subject_name)
            db.add(new_subj)
            db.commit()
            db.refresh(new_subj)
            subject_id = new_subj.id

    task = Task(
        user_id=current_user.id,
        subject_id=subject_id,
        title=task_in.title,
        description=task_in.description,
        deadline=task_in.deadline,
        estimated_hours=task_in.estimated_hours,
        priority=task_in.priority,
        status=task_in.status,
        xp_reward=50
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_in.title is not None: task.title = task_in.title
    if task_in.description is not None: task.description = task_in.description
    if task_in.deadline is not None: task.deadline = task_in.deadline
    if task_in.estimated_hours is not None: task.estimated_hours = task_in.estimated_hours
    if task_in.priority is not None: task.priority = task_in.priority
    if task_in.status is not None: task.status = task_in.status

    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return None

@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status != "Completed":
        task.status = "Completed"
        task.completed_at = datetime.datetime.utcnow()

        # Award XP to user
        current_user.xp += task.xp_reward or 50

        # Update streak
        today_str = datetime.date.today().isoformat()
        if current_user.last_active_date != today_str:
            current_user.streak += 1
            current_user.last_active_date = today_str

        # Record study session
        session = StudySession(
            user_id=current_user.id,
            task_id=task.id,
            duration_minutes=int(task.estimated_hours * 60)
        )
        db.add(session)

    db.commit()
    db.refresh(task)
    db.refresh(current_user)
    return TaskResponse.model_validate(task)

@router.patch("/{task_id}/missed", response_model=TaskResponse)
def mark_task_missed(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "Missed"
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)
