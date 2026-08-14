from fastapi import APIRouter, HTTPException
from ..schemas import dashboard
from ..headers import files
from pydantic import BaseModel
from ..ai_intigration import gemini
from ..components import select_goal
from ..schemas import userGoalInsightSchema as schemaOfUser
router = APIRouter()
schema = dashboard.MainGoal

@router.post('/goal_fetch')
async def handle_goal(data: schema):
    goal = data.goal
    goal_desc = data.goal_desc
    goal_time = data.goal_time
    username = getattr(data, "username", None)
    email = getattr(data, "email", None)
    goal_analytications = getattr(data, "goal_analytications", None)

    if not username:
        raise HTTPException(status_code=400, detail="Username is required")

    try:
        files.saveDashBoard({
            "username": username,
            "email": email,
            "goal": goal,
            "goal_time": goal_time,
            "--": goal_desc,
            "goal_analytications": goal_analytications,
        })
        files.Innitiate(goal=goal, username=username, email=email, return_data=False)
        ai_response = await gemini.getJsonRes(
            gemini.jsonSchema(
                goal=goal,
                user_estimated_time=goal_time,
                description=goal_desc,
                username=username,
                email=email,
            )
        )

        if ai_response.get("success"):
            files.saveDashBoard({
                "username": username,
                "email": email,
                "goal": goal,
                "goal_time": goal_time,
                "goal_desc": goal_desc,
                "goal_analytications": ai_response.get("formatted_goal"),
            })

        return {
            "status": True,
            "message": "Goal data has been saved and analyzed by AI.",
            "ai_response": ai_response,
        }
    except Exception as exc:
        return {
            "status": False,
            "message": f"An error has occurred in the server. Please try again: {exc}",
        }

class GoalSchema(BaseModel):
    want: bool

@router.post('/get_details')
def get_details(data: GoalSchema):
    values = select_goal.get_data()
    if data.want:
        return values
    return {
        "status": "can't found"
    }

class DashboardUpdate(BaseModel):
    updates: list[dict]


@router.patch('/dashboard_stats/{username}')
def update_dashboard_stats(username: str, data: DashboardUpdate):
    try:
        updated = files.updateUserStatisticData(username, data.updates)
        return updated
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get('/dashboard_stats/{username}')
def dashboard_stats(username: str):
    return files.getUserStatisticData(username)


@router.get('/goal_status/{username}')
def goal_status(username: str):
    return files.get_user_goal_status(username)
