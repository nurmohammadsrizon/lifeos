from typing import Any, Optional

from pydantic import BaseModel


class MainGoal(BaseModel):
    goal: str
    goal_time: str
    goal_desc: str
    username: Optional[str] = None
    email: Optional[str] = None
    goal_analytications: Optional[dict[str, Any]] = None