import json
import pathlib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

Router = APIRouter()

class InsightRequestSchema(BaseModel):
    email: str

@Router.post("/get_insight_data")
async def get_insight_data(data: InsightRequestSchema):
    file_name = f"{data.email}.json"
    base_dir = pathlib.Path(__file__).resolve().parents[1] / "database"
    insight_data_dir = base_dir / "insightData"
    insight_data_dir.mkdir(parents=True, exist_ok=True)

    file_path = insight_data_dir / file_name
    if not file_path.exists():
        return {
            "status": False,
            "message": f"Insight data not found for the provided email: {data.email}",
            "data": None,
        }

    with open(file_path, "r", encoding="utf-8") as insight_file:
        insight_data = json.load(insight_file)
        return insight_data
