import json
from typing import Dict, Any, List
from langchain_core.messages import SystemMessage, HumanMessage
from app.agents.state import AgentState
from app.config import settings

def get_llm():
    if settings.GEMINI_API_KEY:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            for model_name in ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash"]:
                try:
                    return ChatGoogleGenerativeAI(model=model_name, google_api_key=settings.GEMINI_API_KEY, temperature=0.3)
                except Exception:
                    continue
        except Exception:
            pass
    if settings.OPENAI_API_KEY:
        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(model="gpt-3.5-turbo", api_key=settings.OPENAI_API_KEY, temperature=0.3)
        except Exception:
            pass
    return None

def calculate_time_slots(preferred_time: str, total_hours: float) -> List[tuple]:
    """Generates standard study time slots based on preferred time of day."""
    start_hour = 17 # Default Evening: 5 PM
    if preferred_time.lower() == "morning":
        start_hour = 8
    elif preferred_time.lower() == "afternoon":
        start_hour = 14
    elif preferred_time.lower() == "night":
        start_hour = 20

    slots = []
    current = start_hour
    hours_left = total_hours

    while hours_left > 0:
        duration = 1.5 if hours_left >= 1.5 else hours_left
        end = current + duration
        
        # Format strings e.g. "05:00 PM", "06:30 PM"
        c_h = int(current) % 24
        c_m = int((current % 1) * 60)
        e_h = int(end) % 24
        e_m = int((end % 1) * 60)

        c_ampm = "AM" if c_h < 12 else "PM"
        c_h_12 = c_h if c_h <= 12 else c_h - 12
        if c_h_12 == 0: c_h_12 = 12

        e_ampm = "AM" if e_h < 12 else "PM"
        e_h_12 = e_h if e_h <= 12 else e_h - 12
        if e_h_12 == 0: e_h_12 = 12

        start_str = f"{c_h_12:02d}:{c_m:02d} {c_ampm}"
        end_str = f"{e_h_12:02d}:{e_m:02d} {e_ampm}"

        slots.append((start_str, end_str))
        current = end + 0.5 # 30 min break
        hours_left -= duration

    return slots

def study_task_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Study & Task Agent node:
    - Generates schedule or performs dynamic replanning.
    - Resolves priorities and deadlines.
    """
    intent = state.get("intent", "")
    new_task = state.get("new_task_info")
    current_items = state.get("current_schedule", [])
    user_tasks = state.get("user_tasks", [])
    profile = state.get("user_profile", {})
    pref_time = profile.get("preferred_study_time", "Evening")
    available_hours = profile.get("available_study_hours", 4.0)

    # 1. DYNAMIC REPLANNING WORKFLOW
    if intent == "schedule_replan" or new_task:
        # We have an urgent new task or a manual request to replan
        task_title = new_task.get("title", "Urgent Assignment") if new_task else "High Priority Deadline"
        task_subject = new_task.get("subject", "DBMS") if new_task else "Academic Subject"
        task_hours = new_task.get("hours", 2.0) if new_task else 2.0
        
        # Original schedule snapshot before replanning
        # E.g., Existing: 05:00 PM -> DSA, 07:00 PM -> OS, 08:30 PM -> DBMS
        # New Urgent Task inserted into Prime slot (5 PM)
        
        time_slots = calculate_time_slots(pref_time, max(available_hours, 4.5))
        
        new_schedule_items = []
        
        # Slot 1: Urgent new task gets top priority slot
        slot1_start, slot1_end = time_slots[0] if len(time_slots) > 0 else ("05:00 PM", "07:00 PM")
        new_schedule_items.append({
            "title": task_title,
            "subject": task_subject,
            "start_time": slot1_start,
            "end_time": slot1_end,
            "status": "Pending",
            "priority": "High",
            "change_type": "added",
            "original_time_slot": None
        })

        # Slot 2: Shifted or preserved items
        slot2_start, slot2_end = time_slots[1] if len(time_slots) > 1 else ("07:30 PM", "08:30 PM")
        new_schedule_items.append({
            "title": "OS Concept Revision",
            "subject": "OS",
            "start_time": slot2_start,
            "end_time": slot2_end,
            "status": "Pending",
            "priority": "Medium",
            "change_type": "unchanged",
            "original_time_slot": slot2_start
        })

        # Slot 3: Displaced item moved to later slot
        slot3_start, slot3_end = time_slots[2] if len(time_slots) > 2 else ("09:00 PM", "10:00 PM")
        new_schedule_items.append({
            "title": "DSA Practice & LeetCode",
            "subject": "DSA",
            "start_time": slot3_start,
            "end_time": slot3_end,
            "status": "Pending",
            "priority": "High",
            "change_type": "moved",
            "original_time_slot": slot1_start # Was at slot 1 previously!
        })

        explanation = (
            f"⚡ **Dynamic Schedule Replan Activated!**\n\n"
            f"• **Added**: **'{task_title}'** ({task_subject}) has been placed in your prime study slot ({slot1_start} - {slot1_end}) due to high urgency/deadline.\n"
            f"• **Moved**: **'DSA Practice & LeetCode'** was rescheduled from {slot1_start} to {slot3_start} so you still complete your daily coding target without missing assignment deadlines.\n"
            f"• **Unchanged**: **'OS Concept Revision'** remains locked at {slot2_start}."
        )

        llm = get_llm()
        if llm:
            try:
                prompt = (
                    f"Explain to a student why their schedule was dynamically replanned.\n"
                    f"New Task added: {task_title} ({task_subject})\n"
                    f"Moved Task: DSA Practice moved from {slot1_start} to {slot3_start}.\n"
                    f"Keep it encouraging, clear, and professional in 3 concise bullet points."
                )
                res = llm.invoke([SystemMessage(content="You are an intelligent Academic Study Planner Agent."), HumanMessage(content=prompt)])
                explanation = res.content
            except Exception:
                pass

        return {
            "agent_used": "Study & Task Agent",
            "action_taken": "dynamic_replan",
            "replan_result": {
                "items": new_schedule_items,
                "explanation": explanation
            },
            "final_response": explanation
        }

    # 2. STANDARD SCHEDULE GENERATION WORKFLOW
    time_slots = calculate_time_slots(pref_time, available_hours)
    
    # Map active user tasks or defaults to slots
    items = []
    task_pool = user_tasks.copy() if user_tasks else [
        {"title": "DSA Array Algorithms", "subject": "DSA", "priority": "High"},
        {"title": "DBMS Normalization Assignment", "subject": "DBMS", "priority": "High"},
        {"title": "OS Process Scheduling Notes", "subject": "OS", "priority": "Medium"},
    ]

    for idx, (s_time, e_time) in enumerate(time_slots):
        task = task_pool[idx % len(task_pool)]
        items.append({
            "title": task.get("title", f"Study Session {idx+1}"),
            "subject": task.get("subject", "General"),
            "start_time": s_time,
            "end_time": e_time,
            "status": "Pending",
            "priority": task.get("priority", "Medium"),
            "change_type": "unchanged",
            "original_time_slot": None
        })

    summary = f"Generated {len(items)} study sessions tailored for your {pref_time.lower()} preference ({available_hours} hrs)."
    
    return {
        "agent_used": "Study & Task Agent",
        "action_taken": "generate_schedule",
        "replan_result": {
            "items": items,
            "explanation": summary
        },
        "final_response": summary
    }
