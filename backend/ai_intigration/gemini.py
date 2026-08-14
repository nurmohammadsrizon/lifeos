# this is use google ai studio for response

try:
    from google import genai
except Exception:  # pragma: no cover - optional dependency
    genai = None

from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter
from datetime import datetime
import os
from pathlib import Path

from dotenv import load_dotenv
from ..headers import files

BASE_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BASE_DIR / ".env"

# Load the environment variables from the backend .env file explicitly.
load_dotenv(dotenv_path=ENV_FILE)
router = APIRouter()


def _get_gemini_client():
    if genai is None:
        raise RuntimeError("google.genai is not installed")

    apiKey = os.getenv("GEMINI_API_KEY")
    if not apiKey:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    return genai.Client(api_key=apiKey)


def get_gemini_text_response(prompt: str):
    client = _get_gemini_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    if hasattr(response, "text"):
        return response.text
    if hasattr(response, "output_text"):
        return response.output_text
    if isinstance(response, dict):
        return response.get("text") or response.get("output_text")
    return str(response)


class jsonSchema(BaseModel):
    goal: str
    user_estimated_time: str
    description: str
    username: Optional[str] = None
    email: Optional[str] = None


def build_fallback_goal(data: jsonSchema) -> dict:
    goal_text = (data.goal or "your goal").strip() or "your goal"
    time_text = (data.user_estimated_time or "flexible").strip() or "flexible"
    return {
        "goal": goal_text,
        "what_will_achieve": f"Create a focused plan to make steady progress toward {goal_text}.",
        "estimated_time": time_text,
    }


@router.post("/ai/get_json_response")
async def getJsonRes(data: jsonSchema):
    class Character(BaseModel):
        goal: str
        what_will_achieve: str
        estimated_time: str

    formatted_goal = build_fallback_goal(data)

    try:
        if genai is None:
            raise RuntimeError("google.genai is not installed")

        apiKey = os.getenv("GEMINI_API_KEY")
        if not apiKey:
            raise RuntimeError("GEMINI_API_KEY is not configured")

        client = genai.Client(api_key=apiKey)
        prompt = (
            f"You are given a user's goal, estimated time, and description. "
            f"Analyze the goal and return a well-structured JSON object containing the goal, "
            f"what the user will achieve, and the estimated time. "
            f"Goal: {data.goal}\n"
            f"Estimated Time: {data.user_estimated_time}\n"
            f"Description: {data.description}\n"
        )

        response = await client.aio.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": Character,
            },
        )

        parsed = getattr(response, "parsed", None)
        if parsed is not None:
            formatted_goal = {
                "goal": parsed.goal,
                "what_will_achieve": parsed.what_will_achieve,
                "estimated_time": parsed.estimated_time,
            }
    except Exception as exc:
        print(f"[AI fallback] {exc}")
        formatted_goal = build_fallback_goal(data)
    try:
        save_data = {
            "username": data.username,
            "email": data.email,
            "goal_request": {
                "goal": data.goal,
                "user_estimated_time": data.user_estimated_time,
                "description": data.description,
            },
            "formatted_goal": formatted_goal,
            "user_details": {
                "username": data.username,
                "email": data.email,
            },
            "saved_at": datetime.utcnow().isoformat() + "Z",
        }

        files.saveFormattedGoal(save_data)

        return {
            "success": True,
            "formatted_goal": formatted_goal,
            "user_details": save_data["user_details"],
        }

    except Exception as e:
        return {
            "success": False,
            "message": "check internet connection"
        }