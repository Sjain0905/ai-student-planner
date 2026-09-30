from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.coordinator import coordinator_agent_node, coordinator_router
from app.agents.study_task_agent import study_task_agent_node
from app.agents.placement_agent import placement_agent_node

def create_agent_graph():
    builder = StateGraph(AgentState)

    # Add Nodes
    builder.add_node("coordinator", coordinator_agent_node)
    builder.add_node("study_task_agent", study_task_agent_node)
    builder.add_node("placement_agent", placement_agent_node)

    # Entry point
    builder.set_entry_point("coordinator")

    # Routing from Coordinator to specialized agents
    builder.add_conditional_edges(
        "coordinator",
        coordinator_router,
        {
            "study_task_agent": "study_task_agent",
            "placement_agent": "placement_agent"
        }
    )

    # Final edges to END
    builder.add_edge("study_task_agent", END)
    builder.add_edge("placement_agent", END)

    return builder.compile()

agent_graph = create_agent_graph()
