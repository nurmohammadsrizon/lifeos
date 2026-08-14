from ..headers import files
from ..ai_intigration import gemini
import json
import pathlib


def get_data():
    file_path = pathlib.Path(__file__).resolve().parents[1] / "database" / "dashboardData" / "dashboard.json"
    with open(file_path, "r+", encoding="utf-8") as main_file:
        values = json.load(main_file)
        return values
  