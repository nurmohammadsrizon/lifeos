import time
from collections import defaultdict
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel, EmailStr
from .send_mail import send_contact_request_email

router = APIRouter()

_contact_rate_limit: dict[str, list[float]] = defaultdict(list)
CONTACT_RATE_LIMIT = 6
RATE_LIMIT_WINDOW_SECONDS = 60


def _is_rate_limited(key: str, limit: int) -> bool:
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW_SECONDS
    timestamps = [ts for ts in _contact_rate_limit[key] if ts > window_start]
    _contact_rate_limit[key] = timestamps
    if len(timestamps) >= limit:
        return True
    timestamps.append(now)
    _contact_rate_limit[key] = timestamps
    return False


class ContactEmailRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

    class Config:
        min_anystr_length = 1
        max_anystr_length = 1200


@router.post("/send-contact-email")
async def send_contact_email(request: Request, data: ContactEmailRequest, background_tasks: BackgroundTasks):
    client_key = f"contact:{request.client.host}:{data.email}"
    if _is_rate_limited(client_key, CONTACT_RATE_LIMIT):
        raise HTTPException(status_code=429, detail="Too many contact submissions. Please wait a moment and try again.")

    try:
        send_contact_request_email(
            name=data.name,
            email=str(data.email),
            message=data.message,
            background_tasks=background_tasks,
        )
        return {
            "status": True,
            "message": "Contact request received. Email has been sent to the LifeOS team.",
        }
    except Exception as exc:
        print(f"Contact email error: {exc}")
        raise HTTPException(status_code=500, detail="Unable to send contact request right now.")
