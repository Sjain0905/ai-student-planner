from typing import TypedDict, List, Dict, Any, Optional
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: List[BaseMessage]
    user_id: int
    user_name: str
    user_profile: Dict[str, Any]
    user_tasks: List[Dict[str, Any]]
    current_schedule: List[Dict[str, Any]]
    intent: Optional[str] # "schedule_replan", "study_task", "placement", "general"
    new_task_info: Optional[Dict[str, Any]]
    
    # Outputs
    agent_used: str
    action_taken: Optional[str]
    replan_result: Optional[Dict[str, Any]]
    placement_result: Optional[Dict[str, Any]]
    final_response: str
