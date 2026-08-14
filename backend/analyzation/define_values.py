import json
from fastapi import FastAPI, APIRouter
from pydantic import BaseModel
define_values_router = APIRouter()

class Values(BaseModel):
    goal: str
    user_estimated_time: str
    goal_description: str
    username : str
    database: dict
    

@define_values_router.post("/user/analyze/define_values")
async def define_values(data: Values):
    pass
