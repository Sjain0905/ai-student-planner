from typing import Dict, Any, Literal
from langchain_core.messages import SystemMessage, HumanMessage
from app.agents.state import AgentState
from app.agents.study_task_agent import get_llm

def coordinator_router(state: AgentState) -> str:
    """
    Decides which agent to route to based on intent or user message.
    Returns node name: "study_task_agent" | "placement_agent" | "general_response"
    """
    intent = state.get("intent")
    if intent in ["schedule_replan", "generate_schedule", "study_task"]:
        return "study_task_agent"
    elif intent in ["placement", "placement_roadmap"]:
        return "placement_agent"

    # Analyze messages if present
    messages = state.get("messages", [])
    if not messages:
        return "study_task_agent"

    last_user_msg = ""
    for msg in reversed(messages):
        if hasattr(msg, "content"):
            last_user_msg = str(msg.content).lower()
            break
        elif isinstance(msg, dict) and msg.get("role") == "user":
            last_user_msg = str(msg.get("content", "")).lower()
            break

    # Keyword check
    placement_keywords = ["placement", "interview", "resume", "dsa", "roadmap", "hiring", "company", "aptitude", "role", "software developer", "sde"]
    study_keywords = ["schedule", "replan", "task", "assignment", "exam", "due", "tomorrow", "study", "move", "cancel", "hours"]

    p_count = sum(1 for kw in placement_keywords if kw in last_user_msg)
    s_count = sum(1 for kw in study_keywords if kw in last_user_msg)

    if p_count > s_count:
        return "placement_agent"
    return "study_task_agent"

def coordinator_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Coordinator Agent node: Initial classification and metadata enrichment.
    """
    route = coordinator_router(state)
    return {
        "intent": state.get("intent") or route,
        "agent_used": "Coordinator Agent",
        "action_taken": f"routed_to_{route}"
    }
