import os
import random
import sys
import time
import pathlib
from collections import defaultdict
from fastapi import FastAPI, BackgroundTasks, HTTPException, Request, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.cors import CORSMiddleware
# from backend.analyzation.ai_analization import main_router as ai_analization_router
from analyzation.ai_analization import main_router as ai_analization_router

BASE_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

if __package__ in (None, ""):
    from backend.components.send_mail import send_app_email, build_welcome_html, EmailRequest
    from backend.auth import send_password_forgot_mail
    from backend.headers import files
    from backend.uploads.handlers import PROFILE_PICTURE_FIELD, save_user_upload, get_user_upload_metadata
    from backend.auth import login_auth
    from backend.auth.forgot_password import router as forgot_password_router
    from backend.models.goal import router as goal_router
    from backend.ai_intigration.gemini import router as gemini_router
    from backend.schemas.userGoalInsightSchema import Responser
    from backend.schemas import auth as BrowserAuth
    from backend.schemas import userGoalInsightSchema as UserGoalInsight
    from backend.analyzation.fetch_insight_data import Router as insight_router
    from backend.components.sendContactEmail import router as contact_router
    from backend.analyzation.ai_recommandations import router as gemini_router
else:
    from .components.send_mail import send_app_email, build_welcome_html, EmailRequest
    from .auth import send_password_forgot_mail
    from .headers import files
    from .uploads.handlers import PROFILE_PICTURE_FIELD, save_user_upload, get_user_upload_metadata
    from .auth import login_auth
    from .auth.forgot_password import router as forgot_password_router
    from .models.goal import router as goal_router
    from .ai_intigration.gemini import router as gemini_router
    from .schemas.userGoalInsightSchema import Responser
    from .schemas import auth as BrowserAuth
    from .schemas import userGoalInsightSchema as UserGoalInsight
    from .analyzation.fetch_insight_data import Router as insight_router
    from .components.sendContactEmail import router as contact_router
    from .analyzation.ai_recommandations import router as gemini_router
app = FastAPI()

# Point to the project root's uploads directory (not backend/uploads)
UPLOADS_STATIC_PATH = PROJECT_ROOT / "uploads" / "files"
app.mount("/uploads/files", StaticFiles(directory=str(UPLOADS_STATIC_PATH), html=False), name="uploads_files")

RATE_LIMIT_STORE: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_WINDOW_SECONDS = 60
LOGIN_RATE_LIMIT = 6
REGISTER_RATE_LIMIT = 4
CONTACT_RATE_LIMIT = 6


def _clean_origin_list(origin_string: str) -> list[str]:
    return [item.strip() for item in origin_string.split(",") if item.strip()]


def _get_allowed_origins() -> list[str]:
    origins = os.getenv(
        "BACKEND_ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173",
    )
    return _clean_origin_list(origins)


def _is_rate_limited(key: str, limit: int) -> bool:
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW_SECONDS
    timestamps = [ts for ts in RATE_LIMIT_STORE[key] if ts > window_start]
    RATE_LIMIT_STORE[key] = timestamps
    if len(timestamps) >= limit:
        return True
    timestamps.append(now)
    RATE_LIMIT_STORE[key] = timestamps
    return False


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=(), interest-cohort=()")
    response.headers.setdefault("X-XSS-Protection", "1; mode=block")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    )
    if request.url.scheme == "https":
        response.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
    return response


if os.getenv("FORCE_HTTPS", "false").strip().lower() == "true":
    app.add_middleware(HTTPSRedirectMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
def generate_random_string(length):
    return ''.join(random.choice(chars) for _ in range(length))


class BrowserTokenSchema(BaseModel):
    length: int

class BrowserVerifySchema(BaseModel):
    running_status: bool
    token: str | None = None

class DashboardDataAccessVerify(BaseModel):
    user_verify: str


@app.post("/create-token-browser")
def CreateTokenBrowser(data: BrowserTokenSchema):
    token = generate_random_string(data.length)
    return {"token": token}


@app.post("/veryfy-browser")
async def VerifyBrowser(data: BrowserVerifySchema):
    try:
        if data.token:
            return {
                "status": True,
                "sendedSchema": data.running_status,
                "success": True,
                "message": "Successful"
            }

        return {
            "status": False,
            "sendedSchema": data.running_status,
            "success": False,
            "message": "No browser token found"
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Sorry. Request Could not be handeled from server"
        }

 
# CORS and security middleware added above

app.include_router(forgot_password_router)
app.include_router(goal_router)
app.include_router(gemini_router)
app.include_router(Responser)
app.include_router(insight_router)
app.include_router(contact_router)
app.include_router(gemini_router)
app.include_router(ai_analization_router)


class User(BaseModel):
    email: EmailStr
    password: str

class RegUserModel(BaseModel):
    full_name: str
    user_name: str
    email: EmailStr
    password: str


class ProfileUpdateModel(BaseModel):
    identifier: str | None = None
    fullname: str | None = None
    full_name: str | None = None
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    bio: str | None = None
    phone: str | None = None
    location: str | None = None
    website: str | None = None
    profile_picture: str | None = None


@app.get("/")
def home():
    return {"message": "Hello World"}


@app.post("/login")
async def login(request: Request, user: User):
    client_key = f"login:{request.client.host}:{user.email}"
    if _is_rate_limited(client_key, LOGIN_RATE_LIMIT):
        raise HTTPException(status_code=429, detail="Too many login attempts. Please wait and try again.")

    if login_auth.checkUser(user.email, user.password) is True:
        return {
            "status": True,
            "message": "Login successful",
            "data": {
                "email": user.email
            }
        }

    raise HTTPException(status_code=401, detail="Invalid email or password")


@app.post("/register")
async def register_user(request: Request, user: RegUserModel, background_tasks: BackgroundTasks):
    client_key = f"register:{request.client.host}:{user.email}"
    if _is_rate_limited(client_key, REGISTER_RATE_LIMIT):
        raise HTTPException(status_code=429, detail="Too many registration attempts. Please wait and try again.")

    try:
        result = files.saveRegisterdUsers({
            "email": user.email,
            "password": user.password,
            "fullname": user.full_name,
            "username": user.user_name
        })

        if not result.get("success"):
            return {"status": False, "message": result.get("message")}

        # HTML স্টাইলড ওয়েলকাম ইমেইল (বোল্ড টেক্সট + ইমেজসহ)
        send_app_email(
            subject='Welcome to LifeOS',
            body=build_welcome_html(user.full_name),
            background_tasks=background_tasks,
            recipients=[user.email]
        )

        return {
            "status": True,
            "message": f"{user.full_name}'s Signup Successful. Please Login Now ",
            "data": result.get("user")
        }
    except Exception as e:
        print(f"Email Error: {e}")
        return {
            "status": False,
            "message": "An error occured. Please try again to sign up later or contact authorities"
        }


@app.get("/profile/{identifier}")
async def get_profile(identifier: str, request: Request):
    profile = files.get_profile_for_user(identifier)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile_picture = str(profile.get("profile_picture") or "").strip()
    if profile_picture:
        # Construct full URL from relative path or keep as-is if already full
        if profile_picture.startswith("http://") or profile_picture.startswith("https://"):
            # Already a full URL, use as-is
            pass
        elif profile_picture.startswith("/"):
            # Relative path starting with /, prepend base URL
            profile["profile_picture"] = str(request.base_url).rstrip("/") + profile_picture
        else:
            # Relative path without /, prepend base URL with /
            profile["profile_picture"] = str(request.base_url).rstrip("/") + "/" + profile_picture.lstrip("/")

    return {"status": True, "profile": profile}


@app.post("/profile/upload-picture")
async def upload_profile_picture(
    request: Request,
    identifier: str = Form(...),
    file: UploadFile = File(...),
):
    if not identifier:
        raise HTTPException(status_code=400, detail="Identifier is required.")

    if not file or not getattr(file, "filename", None):
        raise HTTPException(status_code=400, detail="No file uploaded.")

    result = await save_user_upload(identifier, file, field=PROFILE_PICTURE_FIELD)
    # Store only the relative path in the database
    relative_path = result["path"]
    
    profile_result = files.update_profile_for_user(identifier, {"profile_picture": relative_path})
    if not profile_result.get("success"):
        raise HTTPException(status_code=500, detail=profile_result.get("message", "Unable to update profile picture."))

    # Return the full URL to the frontend
    file_url = str(request.base_url).rstrip("/") + relative_path

    return {
        "success": True,
        "file_url": file_url,
        "profile_picture": file_url,
        "profile": profile_result.get("profile", {}),
    }


@app.post("/upload/file")
async def upload_user_file(
    identifier: str = Form(...),
    file: UploadFile = File(...),
    category: str = Form("file"),
):
    if not identifier:
        raise HTTPException(status_code=400, detail="Identifier is required.")
    if not file or not getattr(file, "filename", None):
        raise HTTPException(status_code=400, detail="No file uploaded.")

    result = await save_user_upload(identifier, file, field=category or "file")
    return {"success": True, "upload": result}


@app.get("/uploads/metadata/{identifier}")
async def get_upload_metadata(identifier: str, request: Request):
    metadata = get_user_upload_metadata(identifier)
    for entry in metadata.get("files", []):
        path = str(entry.get("path") or "").strip()
        if path.startswith("/"):
            entry["url"] = str(request.base_url).rstrip("/") + path
    return {"success": True, "metadata": metadata}


@app.post("/profile/update")
async def update_profile(data: ProfileUpdateModel):
    identifier = (data.identifier or data.email or data.username or "").strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Identifier is required")

    payload = {
        key: value
        for key, value in data.model_dump(exclude_none=True).items()
        if key not in {"identifier"}
    }

    result = files.update_profile_for_user(identifier, payload)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Unable to update profile"))

    return {"status": True, **result}


@app.get("/users")
async def get_users():
    users = [
        {
            "id": 1,
            "name": "Aizen",
            "age": 18
        },
        {
            "id": 2,
            "name": "John",
            "age": 25
        }
    ]

    return users


class JsonSchemaProvided(BaseModel):
    goal: str


@app.post("/gemini/generate_goal_insight_schema")
async def generate_goal_insight_schema(data: UserGoalInsight.JsonSchemaProvided):
    try:
        value = UserGoalInsight.generate_goal_schema(data.goal)
        return {
            "insight": value
        }
    except Exception as e:
        return {"error": str(e)}