import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Schedule, ScheduleItem, StudentProfile, Task
from app.schemas.schemas import ScheduleResponse, ReplanRequest
from app.core.dependencies import get_current_user
from app.agents.graph import agent_graph

router = APIRouter(prefix="/planner", tags=["AI Planner"])

def get_or_create_today_schedule(user: User, db: Session) -> Schedule:
    today_str = datetime.date.today().isoformat()
    schedule = db.query(Schedule).filter(Schedule.user_id == user.id, Schedule.date == today_str).first()
    
    if not schedule:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        pref_time = profile.preferred_study_time if profile else "Evening"
        
        schedule = Schedule(
            user_id=user.id,
            date=today_str,
            summary=f"Daily Study Plan ({pref_time})",
            replan_explanation="Initial baseline schedule generated based on your profile & current task priorities.",
            status="Active"
        )
        db.add(schedule)
        db.commit()
        db.refresh(schedule)

        # Populate initial baseline schedule items
        default_items = [
            {"title": "DSA Array Algorithms & Problem Solving", "subject": "DSA", "start_time": "05:00 PM", "end_time": "07:00 PM", "priority": "High", "change_type": "unchanged"},
            {"title": "OS Process Management & Scheduling Notes", "subject": "OS", "start_time": "07:30 PM", "end_time": "08:30 PM", "priority": "Medium", "change_type": "unchanged"},
            {"title": "DBMS SQL Practice & Joins", "subject": "DBMS", "start_time": "09:00 PM", "end_time": "10:00 PM", "priority": "High", "change_type": "unchanged"},
        ]
        for item in default_items:
            si = ScheduleItem(
                schedule_id=schedule.id,
                title=item["title"],
                subject=item["subject"],
                start_time=item["start_time"],
                end_time=item["end_time"],
                priority=item["priority"],
                change_type=item["change_type"],
                status="Pending"
            )
            db.add(si)
        db.commit()
        db.refresh(schedule)
        
    return schedule

@router.get("/today", response_model=ScheduleResponse)
def get_today_schedule(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    schedule = get_or_create_today_schedule(current_user, db)
    return ScheduleResponse.model_validate(schedule)

@router.post("/replan", response_model=ScheduleResponse)
def replan_schedule(
    replan_in: Optional[ReplanRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedule = get_or_create_today_schedule(current_user, db)
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.status == "Pending").all()

    profile_dict = {
        "preferred_study_time": profile.preferred_study_time if profile else "Evening",
        "available_study_hours": profile.available_study_hours if profile else 4.0
    }
    
    tasks_list = [{"title": t.title, "subject": t.subject.name if t.subject else "General", "priority": t.priority} for t in tasks]

    new_task_info = None
    if replan_in and replan_in.new_task_title:
        new_task_info = {
            "title": replan_in.new_task_title,
            "subject": replan_in.new_task_subject or "Academic Subject",
            "priority": replan_in.new_task_priority or "High",
            "hours": replan_in.new_task_hours or 2.0
        }

    # Execute LangGraph Workflow
    initial_state = {
        "messages": [],
        "user_id": current_user.id,
        "user_name": current_user.full_name,
        "user_profile": profile_dict,
        "user_tasks": tasks_list,
        "current_schedule": [{"title": i.title, "start_time": i.start_time} for i in schedule.items],
        "intent": "schedule_replan",
        "new_task_info": new_task_info,
        "agent_used": "",
        "action_taken": "",
        "replan_result": None,
        "placement_result": None,
        "final_response": ""
    }

    graph_res = agent_graph.invoke(initial_state)
    replan_data = graph_res.get("replan_result") or {}

    items = replan_data.get("items", [])
    explanation = replan_data.get("explanation", "Schedule was dynamically updated based on priority.")

    # Update Database Schedule
    schedule.replan_explanation = explanation
    db.query(ScheduleItem).filter(ScheduleItem.schedule_id == schedule.id).delete()
    db.commit()

    for item_data in items:
        si = ScheduleItem(
            schedule_id=schedule.id,
            title=item_data.get("title", "Study Task"),
            subject=item_data.get("subject", "General"),
            start_time=item_data.get("start_time", "05:00 PM"),
            end_time=item_data.get("end_time", "06:00 PM"),
            status=item_data.get("status", "Pending"),
            priority=item_data.get("priority", "Medium"),
            change_type=item_data.get("change_type", "unchanged"),
            original_time_slot=item_data.get("original_time_slot")
        )
        db.add(si)

    db.commit()
    db.refresh(schedule)
    return ScheduleResponse.model_validate(schedule)
