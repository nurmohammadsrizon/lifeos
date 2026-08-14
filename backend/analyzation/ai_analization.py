from dotenv import load_dotenv
import os
import json
import pathlib
from typing import Any
import sys

load_dotenv()

# Ensure PROJECT_ROOT is in sys.path for imports (same as App.py does)
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from openai import OpenAI
except Exception:  # pragma: no cover - optional dependency guard
    OpenAI = None

from fastapi import APIRouter
from pydantic import BaseModel

from backend.headers import files

main_router = APIRouter()


class UserData(BaseModel):
    username: str


def _safe_float(value: Any, default: float = 0.0) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return default
    return default


def _resolve_user_stat_file(username: str) -> pathlib.Path:
    normalized = (username or "guest").strip()
    file_path = pathlib.Path(__file__).resolve().parents[1] / "database" / "users_data" / f"{normalized}.json"
    if file_path.exists():
        return file_path
    return pathlib.Path(__file__).resolve().parents[1] / "database" / "users_data" / "guest.json"


def _compute_progress(task: dict[str, Any]) -> float:
    if not isinstance(task, dict):
        return 0.0
    if task.get("type") == "boolean":
        return 100.0 if bool(task.get("completed")) else 0.0

    progress = task.get("progress")
    if progress is None:
        progress = task.get("current_value") if task.get("current_value") is not None else task.get("value")

    if progress is not None:
        value = _safe_float(progress)
        if task.get("type") in {"percentage", "progress"}:
            return max(0.0, min(100.0, value))

        target = task.get("target")
        if target is not None:
            target_value = _safe_float(target)
            if target_value > 0:
                return max(0.0, min(100.0, (value / target_value) * 100.0))
        return max(0.0, min(100.0, value))

    if bool(task.get("completed")):
        return 100.0
    return 0.0


def build_analysis_payload(username: str, goal: dict[str, Any] | None, stats: dict[str, Any] | None, goal_status: dict[str, Any] | None) -> dict[str, Any]:
    goal_details = goal or {}
    if not isinstance(goal_details, dict):
        goal_details = {}

    goal_name = goal_details.get("goal") or goal_details.get("main_goal", {}).get("goal") or "Your personal growth goal"
    goal_desc = goal_details.get("goal_desc") or goal_details.get("main_goal", {}).get("goal_desc") or "Continue building momentum with consistent progress."
    goal_time = goal_details.get("goal_time") or goal_details.get("main_goal", {}).get("goal_time") or "This cycle"

    tasks = stats.get("schema", []) if isinstance(stats, dict) else []
    if not isinstance(tasks, list):
        tasks = []

    completed_count = 0
    progress_values = []
    focus_areas = []
    strengths = []
    weaknesses = []

    for task in tasks:
        if not isinstance(task, dict):
            continue
        task_label = str(task.get("title") or task.get("name") or "Task")
        task_progress = _compute_progress(task)
        progress_values.append(task_progress)
        if task_progress >= 80:
            strengths.append(task_label)
        if task_progress < 50:
            weaknesses.append(task_label)
        if task.get("completed") or task_progress >= 100:
            completed_count += 1
        if task.get("description"):
            focus_areas.append(task.get("description"))

    overall_progress = round(sum(progress_values) / len(progress_values), 1) if progress_values else 0.0
    score = int(round(overall_progress))

    if score >= 80:
        headline = f"{username} is trending strongly toward {goal_name}."
        summary = "Your consistency is strong and the current pattern shows healthy momentum. Keep maintaining your current rhythm and protect the routine that is working."
    elif score >= 55:
        headline = f"{username} is building a solid rhythm toward {goal_name}."
        summary = "You are progressing steadily, but a few priorities still need more focus to turn good momentum into faster results."
    else:
        headline = f"{username} is still early in the journey toward {goal_name}."
        summary = "The foundation is there, and the best next step is to simplify the routine and make progress more consistent day by day."

    recommendations = [
        "Keep the highest-impact task in focus each day so one strong win compounds into more progress.",
        "Reduce task friction by breaking large blocks into shorter, easier steps that can be completed without resistance.",
        "Review your weekly pattern and protect a recurring window for deep work, recovery, and reflection.",
    ]

    if strengths:
        strengths_list = strengths[:3]
    else:
        strengths_list = ["Your effort is visible in the work you are already tracking."]

    if weaknesses:
        weaknesses_list = weaknesses[:3]
    else:
        weaknesses_list = ["The main opportunity is to stay more consistent with the tasks that have the highest payoff."]

    analysis = {
        "headline": headline,
        "summary": summary,
        "score": score,
        "progress": int(round(overall_progress)),
        "goal": goal_name,
        "goal_desc": goal_desc,
        "goal_time": goal_time,
        "status": (goal_status or {}).get("status") or "unknown",
        "strengths": strengths_list,
        "weaknesses": weaknesses_list,
        "focus_areas": focus_areas[:3] or ["Stay attentive to your top priorities and protect a consistent routine."],
        "recommendations": recommendations,
        "task_count": len(tasks),
        "completed_tasks": completed_count,
    }

    return {
        "success": True,
        "username": username,
        "analysis": analysis,
    }


def get_res(prompt: str):
    if not os.getenv("GROQ_API_KEY") or OpenAI is None:
        return None

    try:
        client = OpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url="https://api.groq.com/openai/v1",
        )
        response = client.responses.create(
            input=prompt,
            model="openai/gpt-oss-20b",
        )
        return getattr(response, "output_text", None) or ""
    except Exception:
        return None


@main_router.post("/get_analization")
def get_analization(user_data: UserData):
    username = (user_data.username or "guest").strip() or "guest"
    try:
        stat_file = _resolve_user_stat_file(username)
        user_data_obj = {}
        if stat_file.exists():
            with stat_file.open("r", encoding="utf-8") as file:
                user_data_obj = json.load(file)
    except (json.JSONDecodeError, OSError):
        user_data_obj = {}

    goal_status = files.get_user_goal_status(username)
    goal_snapshot = goal_status.get("main_goal") if isinstance(goal_status, dict) else {}
    payload = build_analysis_payload(
        username=username,
        goal=goal_snapshot,
        stats=user_data_obj,
        goal_status=goal_status,
    )

    prompt = f"""
You are a life coach. Turn this data into a concise, positive and practical analysis for a web dashboard.
Keep it in plain English and create a polished summary.
Data: {json.dumps({"username": username, "goal": goal_snapshot, "stats": user_data_obj, "goal_status": goal_status}, ensure_ascii=False)}
"""
    narrative = get_res(prompt)
    if narrative:
        payload["analysis"]["narrative"] = narrative.strip()

    return payload

