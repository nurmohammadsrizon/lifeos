from fastapi import FastAPI 
from schemas import dashboard

app = FastAPI()
DataTemplate = dashboard.MainGoal
app.post("/get_main_goal")
async def handelGetMainGoal(data: DataTemplate):
  goal = data.goal
  time = data.goal_time
  desc = data.goal_desc
  