from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, PlacementGoal, PlacementTopic
from app.schemas.schemas import PlacementGoalResponse, PlacementTopicResponse, TopicStatusUpdate
from app.core.dependencies import get_current_user
from app.agents.placement_agent import DEFAULT_PLACEMENT_ROADMAP

router = APIRouter(prefix="/placement", tags=["Placement Preparation"])

def get_or_create_placement_data(user: User, db: Session):
    goal = db.query(PlacementGoal).filter(PlacementGoal.user_id == user.id).first()
    if not goal:
        goal = PlacementGoal(
            user_id=user.id,
            target_role="Software Development Engineer",
            target_company="Product Companies",
            target_timeline_weeks=4,
            overall_progress=25.0
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)

    topics = db.query(PlacementTopic).filter(PlacementTopic.user_id == user.id).order_by(PlacementTopic.week_number, PlacementTopic.id).all()
    if not topics:
        for t_data in DEFAULT_PLACEMENT_ROADMAP:
            pt = PlacementTopic(
                user_id=user.id,
                category=t_data["category"],
                topic_name=t_data["topic_name"],
                status=t_data["status"],
                week_number=t_data["week_number"]
            )
            db.add(pt)
        db.commit()
        topics = db.query(PlacementTopic).filter(PlacementTopic.user_id == user.id).order_by(PlacementTopic.week_number, PlacementTopic.id).all()

    return goal, topics

@router.get("")
def get_placement_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal, topics = get_or_create_placement_data(current_user, db)

    # Recalculate progress
    if topics:
        completed = sum(1 for t in topics if t.status == "Completed")
        goal.overall_progress = round((completed / len(topics)) * 100, 1)
        db.commit()

    return {
        "goal": PlacementGoalResponse.model_validate(goal),
        "topics": [PlacementTopicResponse.model_validate(t) for t in topics]
    }

@router.patch("/topic/{topic_id}", response_model=PlacementTopicResponse)
def update_topic_status(
    topic_id: int,
    status_in: TopicStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    topic = db.query(PlacementTopic).filter(PlacementTopic.id == topic_id, PlacementTopic.user_id == current_user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Placement topic not found")

    topic.status = status_in.status
    db.commit()

    # Recalculate user placement progress
    goal = db.query(PlacementGoal).filter(PlacementGoal.user_id == current_user.id).first()
    if goal:
        all_topics = db.query(PlacementTopic).filter(PlacementTopic.user_id == current_user.id).all()
        if all_topics:
            completed_count = sum(1 for t in all_topics if t.status == "Completed")
            goal.overall_progress = round((completed_count / len(all_topics)) * 100, 1)
            db.commit()

    db.refresh(topic)
    return PlacementTopicResponse.model_validate(topic)
