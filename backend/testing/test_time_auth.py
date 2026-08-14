# import components.time_detect as timefunc
from components import time_detect
import sys
import os

sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
)

from components import time_detect
time_detect.check_time("day")