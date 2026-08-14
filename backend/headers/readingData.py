import os
import sys
# from fastapi import FastAPI 
import pathlib
import json

# app = FastAPI()
def reading_dashbord_data():
    file_path = pathlib.Path(__file__).resolve().parents[1] / "database" / "dashboardData" / "dashboard.json"
    with open(file_path, 'r+', encoding='utf-8') as file:
        data = json.load(file)
        return {
            data
        }