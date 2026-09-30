import re
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, StudentProfile, Task, Schedule, ScheduleItem
from app.schemas.schemas import ChatRequest, ChatResponse
from app.core.dependencies import get_current_user
from app.agents.graph import agent_graph
from app.routers.planner import get_or_create_today_schedule

router = APIRouter(prefix="/chat", tags=["AI Chat Agent"])

@router.post("", response_model=ChatResponse)
def chat_with_agent(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_msg = req.message.strip()
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.status == "Pending").all()
    schedule = get_or_create_today_schedule(current_user, db)

    profile_dict = {
        "preferred_study_time": profile.preferred_study_time if profile else "Evening",
        "available_study_hours": profile.available_study_hours if profile else 4.0,
        "placement_target": profile.placement_target if profile else "Software Engineer"
    }

    tasks_list = [{"title": t.title, "subject": t.subject.name if t.subject else "General", "priority": t.priority} for t in tasks]

    # Detect if user message mentions adding an assignment or moving a schedule
    new_task_info = None
    lower_msg = user_msg.lower()

    if any(k in lower_msg for k in ["assignment", "due tomorrow", "urgent", "move my", "replan"]):
        # Extract title or subject if mentioned
        subj = "DBMS" if "dbms" in lower_msg else ("DSA" if "dsa" in lower_msg else ("OS" if "os" in lower_msg else "Academic Subject"))
        new_task_info = {
            "title": f"{subj} Assignment",
            "subject": subj,
            "priority": "High",
            "hours": 2.0
        }

    # Execute LangGraph Workflow
    initial_state = {
        "messages": [{"role": "user", "content": user_msg}],
        "user_id": current_user.id,
        "user_name": current_user.full_name,
        "user_profile": profile_dict,
        "user_tasks": tasks_list,
        "current_schedule": [{"title": i.title, "start_time": i.start_time} for i in schedule.items],
        "intent": "schedule_replan" if new_task_info else None,
        "new_task_info": new_task_info,
        "agent_used": "Coordinator Agent",
        "action_taken": None,
        "replan_result": None,
        "placement_result": None,
        "final_response": ""
    }

    graph_res = agent_graph.invoke(initial_state)

    agent_used = graph_res.get("agent_used", "Coordinator Agent")
    action_taken = graph_res.get("action_taken")
    response_text = graph_res.get("final_response", "Processed request.")
    data = None

    # If dynamic replan happened, persist to DB and attach data
    if graph_res.get("replan_result"):
        replan_data = graph_res["replan_result"]
        items = replan_data.get("items", [])
        explanation = replan_data.get("explanation", "")

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

        data = {
            "schedule_updated": True,
            "explanation": explanation
        }

    return ChatResponse(
        response=response_text,
        agent_used=agent_used,
        action_taken=action_taken,
        data=data
    )
