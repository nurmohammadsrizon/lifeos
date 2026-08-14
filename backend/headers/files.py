import json
import pathlib
import hashlib
import hmac
import re
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
import os
from ..schemas import userGoalInsightSchema as schemaOfUser
BASE_DIR = pathlib.Path(__file__).resolve().parents[1]
DATABASE_DIR = BASE_DIR / "database"
DASHBOARD_FILE = DATABASE_DIR / "dashboardData" / "dashboard.json"
USERS_FILE = DATABASE_DIR / "sign_up.json"
FORMATTED_GOAL_FILE = DATABASE_DIR / "user_data" / "formatted_goal.json"
USERS_TXT_FILE = DATABASE_DIR / "users.txt"
USERS_DATA_DIR = DATABASE_DIR / "users_data"


def _ensure_data_directories():
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)
    USERS_DATA_DIR.mkdir(parents=True, exist_ok=True)
    FORMATTED_GOAL_FILE.parent.mkdir(parents=True, exist_ok=True)


def _ensure_users_file():
    _ensure_data_directories()
    if not USERS_FILE.exists():
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


def _read_users_list() -> List[Dict[str, Any]]:
    _ensure_users_file()
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
    except (json.JSONDecodeError, OSError):
        pass
    return []


def _write_users_list(users: List[Dict[str, Any]]):
    _ensure_users_file()
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


def _hash_password(password: str, salt: bytes | None = None) -> tuple[str, str]:
    if not isinstance(password, str) or not password:
        raise ValueError("Password must be a non-empty string")

    if salt is None:
        salt = os.urandom(16)
    elif isinstance(salt, str):
        salt = bytes.fromhex(salt)

    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)
    return key.hex(), salt.hex()


def _verify_password(password: str, password_hash: str, salt: str) -> bool:
    if not password_hash or not salt:
        return False

    try:
        salt_bytes = bytes.fromhex(salt)
    except ValueError:
        return False

    expected_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, 200_000).hex()
    return hmac.compare_digest(expected_key, password_hash)


def parse_goal_duration(duration: str) -> Optional[timedelta]:
    if not duration or not isinstance(duration, str):
        return None

    text = duration.strip().lower()

    if text == "today" or text == "tomorrow":
        return timedelta(days=1)
    if text == "this week" or text == "week" or text == "next week":
        return timedelta(weeks=1)
    if text == "this month" or text == "month" or text == "next month":
        return timedelta(days=30)

    match = re.search(
        r"(?:in\s*)?(\d+)\s*(day|days|week|weeks|month|months|hour|hours|minute|minutes|sec|secs|second|seconds|d|w|m|h|s)",
        text,
        re.IGNORECASE,
    )
    if match:
        amount = int(match.group(1))
        unit = match.group(2).lower()

        if unit.startswith("day") or unit == "d":
            return timedelta(days=amount)
        if unit.startswith("week") or unit == "w":
            return timedelta(weeks=amount)
        if unit.startswith("month") or unit == "m":
            return timedelta(days=amount * 30)
        if unit.startswith("hour") or unit == "h":
            return timedelta(hours=amount)
        if unit.startswith("minute"):
            return timedelta(minutes=amount)
        if unit.startswith("sec") or unit == "s":
            return timedelta(seconds=amount)

    digits_only = re.fullmatch(r"(\d+)", text)
    if digits_only:
        return timedelta(days=int(digits_only.group(1)))

    return None


def compute_goal_expiration(saved_at: str, goal_time: str) -> Optional[str]:
    if not saved_at or not goal_time:
        return None

    try:
        start = datetime.fromisoformat(saved_at.replace("Z", "+00:00"))
    except ValueError:
        start = datetime.now(timezone.utc)

    duration = parse_goal_duration(goal_time)
    if not duration:
        return None

    expires_at = start + duration
    if expires_at.tzinfo is not None:
        expires_at = expires_at.astimezone(timezone.utc).replace(tzinfo=None)
    return expires_at.isoformat() + "Z"


def _parse_iso_datetime(value: str) -> Optional[datetime]:
    if not isinstance(value, str):
        return None

    text = value.strip()
    if text.endswith("Z") and "+" in text[:-1]:
        text = text[:-1]
    elif text.endswith("Z"):
        text = text[:-1] + "+00:00"

    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def is_goal_expired(goal_entry: dict) -> bool:
    if not isinstance(goal_entry, dict):
        return True

    expires_at = goal_entry.get("expires_at")
    if not expires_at:
        return False

    parsed = _parse_iso_datetime(expires_at)
    if not parsed:
        return False

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    return datetime.now(timezone.utc) >= parsed


def saveLoginedUser(email: str, password: str):
    # legacy fallback: not used for auth persistence anymore
    _ensure_data_directories()
    filePath = USERS_TXT_FILE
    with open(filePath, "a", encoding="utf-8") as main_file:
        query_format = f"\n{email} : {password}"
        main_file.write(query_format)


def readRegisterdUsers() -> List[Dict[str, Any]]:
    """Return list of registered users as dicts."""
    return _read_users_list()


def saveRegisterdUsers(details: Dict[str, Any]) -> Dict[str, Any]:
    """Save a new registered user to sign_up.json.

    Returns dict with keys: success (bool), message (str), user (optional)
    """
    users = _read_users_list()
    email = (details.get("email") or "").strip().lower()
    username = (details.get("username") or details.get("user_name") or "").strip()
    password_raw = details.get("password") or ""
    fullname = details.get("fullname") or details.get("full_name") or ""

    if not email or not password_raw:
        return {"success": False, "message": "Email and password are required"}

    for u in users:
        if (u.get("email") or "").strip().lower() == email:
            return {"success": False, "message": "Account existed with this email"}
        if username and (u.get("username") or "") == username:
            return {"success": False, "message": "Account existed with this username"}

    hashed, salt = _hash_password(password_raw)
    user = {
        "id": len(users) + 1,
        "email": email,
        "username": username,
        "fullname": fullname,
        "password_hash": hashed,
        "salt": salt,
    }
    users.append(user)
    _write_users_list(users)
    return {"success": True, "message": "Signup successful", "user": user}


def saveDashBoard(data: object):
    filePath = DASHBOARD_FILE
    filePath.parent.mkdir(parents=True, exist_ok=True)

    username = (
        data.get("username")
        or data.get("user")
        or data.get("user_id")
        or "guest"
    )

    saved_data = {"users": {}}
    if filePath.exists():
        try:
            with open(filePath, "r", encoding="utf-8") as file:
                loaded_data = json.load(file)
                if isinstance(loaded_data, dict) and isinstance(loaded_data.get("users"), dict):
                    saved_data = loaded_data
        except (json.JSONDecodeError, OSError):
            saved_data = {"users": {}}

    users = saved_data.setdefault("users", {})
    user_entry = users.setdefault(username, {})
    main_goal = user_entry.setdefault("main_goal", {})

    main_goal["goal"] = data.get("goal") or data.get("goal_")
    main_goal["goal_time"] = data.get("goal_time")
    main_goal["goal_desc"] = data.get("goal_desc")

    if data.get("goal_analytications") is not None:
        main_goal["goal_analytications"] = data.get("goal_analytications")
    elif "goal_analytications" not in main_goal:
        main_goal["goal_analytications"] = {}

    for key, value in data.items():
        if key in {"username", "user", "user_id", "goal", "goal_", "goal_time", "goal_desc", "goal_analytications"}:
            continue
        main_goal[key] = value

    main_goal["saved_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")

    expires_at = compute_goal_expiration(main_goal.get("saved_at"), main_goal.get("goal_time"))
    if expires_at is not None:
        main_goal["expires_at"] = expires_at
    else:
        main_goal.pop("expires_at", None)

    with open(filePath, "w", encoding="utf-8") as file:
        json.dump(saved_data, file, indent=2, ensure_ascii=False)
        file.write("\n")


def _normalize_username(username: Optional[str]) -> str:
    if not username or not isinstance(username, str):
        return "guest"
    normalized = username.strip()
    return normalized if normalized else "guest"


def _resolve_user_data_file(username: Optional[str]) -> pathlib.Path:
    candidate = _normalize_username(username)
    candidates = [candidate]

    if "@" in candidate:
        candidates.append(candidate.split("@", 1)[0])
        mapped = _resolve_username_from_email(candidate, candidate)
        if mapped and mapped != candidate:
            candidates.append(mapped)
    else:
        user = find_user_by_email(candidate)
        if user and user.get("username"):
            candidates.append(str(user.get("username")).strip())

    for name in candidates:
        filename = USERS_DATA_DIR / f"{name}.json"
        if filename.exists():
            return filename

    return USERS_DATA_DIR / f"{candidate}.json"


def get_user_goal_data(username: Optional[str]) -> dict:
    username = _normalize_username(username)
    if not DASHBOARD_FILE.exists():
        return {}

    try:
        with open(DASHBOARD_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
    except (json.JSONDecodeError, OSError):
        return {}

    return data.get("users", {}).get(username, {})


def getUserStatisticData(username: Optional[str]) -> dict:
    filename = _resolve_user_data_file(username)
    if not filename.exists():
        return {}

    try:
        with open(filename, "r", encoding="utf-8") as main_file:
            return json.load(main_file)
    except (json.JSONDecodeError, OSError):
        return {}


def updateUserStatisticData(username: str, updates: list[dict]) -> dict:
    filename = _resolve_user_data_file(username)
    if not filename.exists():
        createNewStatisticDatabase(filename.stem)

    try:
        with open(filename, "r", encoding="utf-8") as file:
            data = json.load(file)
    except (json.JSONDecodeError, OSError):
        data = {}

    schema = data.get("schema")
    if not isinstance(schema, list):
        schema = []

    for update in updates:
        task_id = update.get("id")
        if not task_id:
            continue

        matched = False
        for item in schema:
            if item.get("id") == task_id:
                item.update({k: v for k, v in update.items() if k != "id"})
                matched = True
                break

        if not matched:
            schema.append(update)

    data["schema"] = schema

    with open(filename, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4, ensure_ascii=False)
        file.write("\n")

    return data


def is_goal_expired(goal_entry: dict) -> bool:
    if not isinstance(goal_entry, dict):
        return True

    expires_at = goal_entry.get("expires_at")
    if not expires_at:
        return False

    try:
        end_time = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) >= end_time
    except ValueError:
        return False


def get_user_goal_status(username: Optional[str]) -> dict:
    entry = get_user_goal_data(username)
    main_goal = entry.get("main_goal", {})
    goal_text = main_goal.get("goal")
    if not goal_text:
        return {
            "exists": False,
            "expired": False,
            "status": "none",
            "main_goal": main_goal,
        }

    expired = is_goal_expired(main_goal)
    return {
        "exists": True,
        "expired": expired,
        "status": "expired" if expired else "active",
        "main_goal": main_goal,
    }


def _ensure_formatted_goal_file():
    FORMATTED_GOAL_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not FORMATTED_GOAL_FILE.exists():
        with open(FORMATTED_GOAL_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)


def _read_formatted_goals() -> dict:
    _ensure_formatted_goal_file()
    try:
        with open(FORMATTED_GOAL_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict):
                return data
    except (json.JSONDecodeError, OSError):
        pass
    return {}


def _write_formatted_goals(data: dict):
    _ensure_formatted_goal_file()
    with open(FORMATTED_GOAL_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def saveFormattedGoal(data: dict):
    existing_data = _read_formatted_goals()
    username = (data.get("username") or data.get("user_id") or data.get("email") or "guest").strip()
    if not username:
        username = "guest"

    users = existing_data.setdefault("users", {})
    user_entry = users.setdefault(username, {})

    # Keep the request and AI-generated response together.
    user_entry["goal_request"] = data.get("goal_request", {})
    user_entry["formatted_goal"] = data.get("formatted_goal", {})
    if data.get("user_details") is not None:
        user_entry["user_details"] = data.get("user_details")
    if data.get("saved_at") is not None:
        user_entry["saved_at"] = data.get("saved_at")

    _write_formatted_goals(existing_data)


def updatePasswordForEmail(email: str, new_password: str) -> bool:
    users = _read_users_list()
    normalized_email = (email or "").strip().lower()
    found = False
    for u in users:
        if (u.get("email") or "").strip().lower() == normalized_email:
            new_hash, new_salt = _hash_password(new_password)
            u["password_hash"] = new_hash
            u["salt"] = new_salt
            u.pop("password", None)
            found = True
            break

    if not found:
        return False

    _write_users_list(users)
    return True


def find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    users = _read_users_list()
    normalized_email = (email or "").strip().lower()
    for u in users:
        if (u.get("email") or "").strip().lower() == normalized_email:
            return u
    return None


def find_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    users = _read_users_list()
    normalized_username = (username or "").strip().lower()
    for user in users:
        if (user.get("username") or "").strip().lower() == normalized_username:
            return user
    return None


def get_profile_for_user(identifier: str) -> Dict[str, Any]:
    if not identifier:
        return {}

    identifier = str(identifier).strip()
    user = find_user_by_email(identifier) or find_user_by_username(identifier)
    if user is None:
        return {}

    profile = dict(user)
    profile.pop("password", None)
    profile.pop("password_hash", None)
    profile.pop("salt", None)
    profile.setdefault("fullname", user.get("fullname") or user.get("full_name") or "")
    profile.setdefault("username", user.get("username") or "")
    profile.setdefault("email", user.get("email") or "")
    profile.setdefault("bio", "")
    profile.setdefault("phone", "")
    profile.setdefault("location", "")
    profile.setdefault("website", "")
    profile.setdefault("profile_picture", "")
    return profile


def update_profile_for_user(identifier: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    if not identifier:
        return {"success": False, "message": "User identifier is required."}

    users = _read_users_list()
    original_user = find_user_by_email(identifier) or find_user_by_username(identifier)
    if original_user is None:
        return {"success": False, "message": "User not found."}

    user_index = users.index(original_user)
    user = users[user_index]

    candidate_email = (updates.get("email") or user.get("email") or "").strip().lower()
    candidate_username = (updates.get("username") or user.get("username") or "").strip()

    for existing_user in users:
        if existing_user is user:
            continue
        if candidate_email and (existing_user.get("email") or "").strip().lower() == candidate_email:
            return {"success": False, "message": "This email is already in use."}
        if candidate_username and (existing_user.get("username") or "").strip() == candidate_username:
            return {"success": False, "message": "This username is already in use."}

    if "fullname" in updates:
        user["fullname"] = str(updates.get("fullname") or "").strip()
    if "full_name" in updates:
        user["fullname"] = str(updates.get("full_name") or "").strip()
    if "username" in updates:
        user["username"] = str(updates.get("username") or "").strip()
    if "email" in updates:
        user["email"] = str(updates.get("email") or "").strip().lower()
    if "bio" in updates:
        user["bio"] = str(updates.get("bio") or "")
    if "phone" in updates:
        user["phone"] = str(updates.get("phone") or "")
    if "location" in updates:
        user["location"] = str(updates.get("location") or "")
    if "website" in updates:
        user["website"] = str(updates.get("website") or "")
    if "profile_picture" in updates:
        user["profile_picture"] = str(updates.get("profile_picture") or "")
    if updates.get("password"):
        new_hash, new_salt = _hash_password(str(updates.get("password")))
        user["password_hash"] = new_hash
        user["salt"] = new_salt

    _write_users_list(users)
    profile = get_profile_for_user(user.get("email") or user.get("username") or identifier)
    return {"success": True, "message": "Profile updated successfully.", "profile": profile}


def check_user_credentials(email: str, password: str) -> bool:
    if not email or not password:
        return False

    normalized_email = (email or "").strip().lower()
    users = _read_users_list()
    for user in users:
        if (user.get("email") or "").strip().lower() != normalized_email:
            continue

        password_hash = user.get("password_hash")
        salt = user.get("salt")
        plain_password = user.get("password")

        if password_hash and _verify_password(password, password_hash, salt):
            return True

        if plain_password and plain_password == password:
            new_hash, new_salt = _hash_password(password)
            user["password_hash"] = new_hash
            user["salt"] = new_salt
            user.pop("password", None)
            _write_users_list(users)
            return True

        return False

    return False



def createNewStatisticDatabase(username: str):
    """
    Creates a new JSON database file for the given username 
    initialized with an empty dictionary if it doesn't already exist.
    """
    _ensure_data_directories()
    filename = USERS_DATA_DIR / f"{username}.json"
    
    if not filename.exists():
        with open(filename, 'w', encoding='utf-8') as file:
            json.dump({}, file, indent=4)
        print(f"Database created successfully for user: '{username}'")
    else:
        print(f"Database for '{username}' already exists.")


def writeUserStatisticData(username: str, data: dict):
    """
    Reads the existing user JSON file, updates it with the new 
    statistic data, and saves it back.
    """
    _ensure_data_directories()
    filename = USERS_DATA_DIR / f"{username}.json"
    # filename = f"{username}.json"
    
    # Auto-create the database file if the user calls write without creating it first
    if not filename.exists():
        createNewStatisticDatabase(username)
        
    # 1. Read the existing data
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            current_data = json.load(file)
    except json.JSONDecodeError:
        # Fallback if the file exists but is empty or corrupted
        current_data = {}

    # 2. Update the existing dictionary with the new data
    current_data.update(data)

    # 3. Write the updated data back to the JSON file
    with open(filename, 'w', encoding='utf-8') as file:
        json.dump(current_data, file, indent=4)
        
    print(f"Successfully updated statistic data for '{username}'.")

# =====================================================================

# 1. Initialize the database for "obito"
# createNewStatisticDatabase("obito")

# 2. Prepare the data payload
statistic = {
    "monthly_progressed": {
        "sub": "Creating an ai agent",
        "details": {
            "frontend": "complete",
            "backend": "complete",
            "database": "complete",
            "core":{
                "dsa": "complete",
                "ml": "complete"
            }
        }
    }
}

# 3. Write the data
# writeUserStatisticData("kakashi", weekly_stats)

def _resolve_username_from_email(username: Optional[str], email: Optional[str] = None) -> str:
    """Return a stable username-based key for the dashboard file.

    The API payload can carry both `username` and `email`. Some older callers
    accidentally pass the email string in the `username` slot. In that case we
    try to map the email back to the registered username inside sign_up.json.
    """
    candidate = (username or "").strip()
    if not candidate:
        candidate = (email or "").strip()

    if not candidate:
        return "guest"

    if "@" in candidate:
        user = find_user_by_email(candidate)
        if user and user.get("username"):
            candidate = str(user.get("username")).strip()
        else:
            # Keep the file naming deterministic and not email-shaped.
            candidate = candidate.split("@", 1)[0]

    return candidate or "guest"


def Innitiate(goal: str, username: str, return_data: bool, email: Optional[str] = None):
    resolved_username = _resolve_username_from_email(username, email)
    statistic = schemaOfUser.generate_goal_schema(goal_subject=goal)
    createNewStatisticDatabase(resolved_username)
    writeUserStatisticData(resolved_username, statistic)
    if return_data:
        return getUserStatisticData(resolved_username)
    return None    