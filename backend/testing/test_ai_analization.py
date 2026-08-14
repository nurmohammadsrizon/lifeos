from backend.analyzation import ai_analization


def test_build_analysis_payload_includes_goal_and_progress():
    payload = ai_analization.build_analysis_payload(
        username="demo-user",
        goal={
            "goal": "Build consistent study habits",
            "goal_desc": "Improve focus and follow through on daily learning tasks.",
            "goal_time": "90 days",
        },
        stats={
            "schema": [
                {"title": "Read lessons", "completed": True, "progress": 100},
                {"title": "Practice coding", "current_value": 4, "target": 8, "type": "number"},
                {"title": "Daily reflection", "completed": False, "progress": 40},
            ]
        },
        goal_status={"exists": True, "status": "active"},
    )

    assert payload["success"] is True
    assert payload["analysis"]["headline"]
    assert payload["analysis"]["progress"] >= 0
    assert len(payload["analysis"]["recommendations"]) >= 3
