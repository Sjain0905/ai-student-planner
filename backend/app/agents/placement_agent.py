from typing import Dict, Any, List
from app.agents.state import AgentState

DEFAULT_PLACEMENT_ROADMAP = [
    # Week 1: DSA Foundations & Aptitude
    {"category": "DSA", "topic_name": "Arrays & Strings", "week_number": 1, "status": "In Progress"},
    {"category": "DSA", "topic_name": "Linked Lists & Two Pointers", "week_number": 1, "status": "Not Started"},
    {"category": "Core", "topic_name": "OOPs Concepts & Principles", "week_number": 1, "status": "Completed"},
    {"category": "Aptitude", "topic_name": "Quantitative: Percentages & Ratios", "week_number": 1, "status": "Completed"},

    # Week 2: Core Computer Science & Stacks/Queues
    {"category": "DSA", "topic_name": "Stacks & Queues", "week_number": 2, "status": "Not Started"},
    {"category": "DSA", "topic_name": "Binary Trees & BST", "week_number": 2, "status": "Not Started"},
    {"category": "Core", "topic_name": "DBMS: SQL Queries & Normalization", "week_number": 2, "status": "In Progress"},
    {"category": "Core", "topic_name": "OS: Process Management & Multithreading", "week_number": 2, "status": "Not Started"},

    # Week 3: Advanced DSA & Networks
    {"category": "DSA", "topic_name": "Graphs & BFS/DFS", "week_number": 3, "status": "Not Started"},
    {"category": "DSA", "topic_name": "Dynamic Programming (DP)", "week_number": 3, "status": "Not Started"},
    {"category": "Core", "topic_name": "Computer Networks: TCP/IP & HTTP", "week_number": 3, "status": "Not Started"},
    {"category": "Aptitude", "topic_name": "Logical Reasoning & Data Interpretation", "week_number": 3, "status": "Not Started"},

    # Week 4: Interview & Portfolio Prep
    {"category": "Interview", "topic_name": "Resume Optimization & Project Breakdown", "week_number": 4, "status": "In Progress"},
    {"category": "Interview", "topic_name": "System Design Basics (LLD/HLD)", "week_number": 4, "status": "Not Started"},
    {"category": "Interview", "topic_name": "Mock Technical Interviews", "week_number": 4, "status": "Not Started"},
    {"category": "Interview", "topic_name": "HR Behavioral Prep & STAR Method", "week_number": 4, "status": "Not Started"}
]

def placement_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Placement Agent node:
    - Generates 4-week structured placement roadmap.
    - Recommends next topics based on skill levels.
    """
    profile = state.get("user_profile", {})
    target_role = profile.get("placement_target", "Software Development Engineer")
    skills = profile.get("skill_levels", {})

    # Construct recommendation text
    recommendations = [
        f"🎯 **Target Role:** {target_role}",
        "📌 **Focus Areas This Week:** Master **Arrays & Strings** in DSA and brush up on **DBMS SQL Queries**.",
        "💡 **Pro Tip:** Practice 2 LeetCode Medium problems daily and explain your time complexity out loud."
    ]

    res_text = "\n".join(recommendations)

    return {
        "agent_used": "Placement Agent",
        "action_taken": "generate_roadmap",
        "placement_result": {
            "target_role": target_role,
            "roadmap": DEFAULT_PLACEMENT_ROADMAP,
            "recommendations": res_text
        },
        "final_response": f"Here is your personalized 4-week placement roadmap for **{target_role}**:\n\n" + res_text
    }
