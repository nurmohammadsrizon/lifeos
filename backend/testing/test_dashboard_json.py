import json

from headers import files


def test_save_dashboard_writes_json_structure(monkeypatch, tmp_path):
    dashboard_file = tmp_path / "dashboard.json"
    monkeypatch.setattr(files, "DASHBOARD_FILE", dashboard_file, raising=False)

    files.saveDashBoard({
        "username": "alice",
        "goal": "Learn FastAPI",
        "goal_time": "2 hours",
        "goal_desc": "Build a small API",
        "goal_analytications": {"mood": "focused"},
    })

    saved_data = json.loads(dashboard_file.read_text(encoding="utf-8"))

    assert saved_data["users"]["alice"]["main_goal"]["goal"] == "Learn FastAPI"
    assert saved_data["users"]["alice"]["main_goal"]["goal_desc"] == "Build a small API"
    assert saved_data["users"]["alice"]["main_goal"]["goal_time"] == "2 hours"
    assert saved_data["users"]["alice"]["main_goal"]["goal_analytications"]["mood"] == "focused"
