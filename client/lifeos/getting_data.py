import os
import sys
# from fastapi import FastAPI 
import pathlib
import json

# app = FastAPI()

def getData():
    file_path = pathlib.Path(__file__).resolve().parents[2] / "backend" / "database" / "dashboardData" / "dashboard.json"
    with open(file_path, 'r+', encoding='utf-8') as file:
        data = json.load(file)
        return data
    