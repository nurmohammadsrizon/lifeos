from fastapi import FastAPI, BackgroundTasks
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import BaseModel, EmailStr
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BASE_DIR / ".env"

# Load variables from the backend .env file explicitly.
load_dotenv(dotenv_path=ENV_FILE)

# ১. SMTP কনফিগারেশন সেটআপ
# Only instantiate the real SMTP config when the password exists.
mail_password = os.getenv("GOOGLE_ACCOUNT_APP_PASSWORD")
conf = None
if mail_password:
    conf = ConnectionConfig(
        MAIL_USERNAME="srizonboos@gmail.com",
        MAIL_PASSWORD=mail_password,
        MAIL_FROM="srizonboos@gmail.com",
        MAIL_PORT=587,
        MAIL_SERVER="smtp.gmail.com",
        MAIL_FROM_NAME="LifeOS App",
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )


# ২. HTML ইমেইল বডি বিল্ডার — বোল্ড টেক্সট এবং ইমেজসহ
def build_welcome_html(full_name: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background:#f4f4f7; padding:20px; margin:0;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;padding:24px;">
          <img src="https://placehold.co/140x50/2E86AB/ffffff?text=LifeOS" alt="LifeOS" width="140" style="display:block;margin-bottom:16px;" />
          <h2 style="color:#2E86AB;margin-bottom:8px;">Welcome to LifeOS, {full_name}!</h2>
          <p style="font-size:15px;color:#333;line-height:1.5;">
            Thank you for registering with <b>LifeOS</b>! We're excited to have you on board.
          </p>
          <p style="font-weight:bold;font-size:15px;color:#333;">
            Get started by logging in and setting your first goal.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
          <p style="font-size:13px;color:#888;">
            Best regards,<br/>
            <b>Nur Mohammad Srizon</b> — Owner, LifeOS
          </p>
        </div>
      </body>
    </html>
    """


def build_contact_request_html(name: str, email: str, message: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background:#f4f4f7; padding:20px; margin:0;">
        <div style="max-width:700px; margin:auto; background:#ffffff; border-radius:10px; padding:28px; box-shadow:0 24px 48px rgba(15,23,42,0.12);">
          <h2 style="color:#1e40af; margin-bottom:12px;">New contact request from LifeOS</h2>
          <p style="color:#334155; font-size:15px; line-height:1.7; margin-bottom:20px;">A visitor has submitted the contact form and requested your attention.</p>
          <p style="margin:0 0 14px; font-size:15px; color:#111827;"><strong>Name:</strong> {name}</p>
          <p style="margin:0 0 14px; font-size:15px; color:#111827;"><strong>Email:</strong> {email}</p>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin-bottom:20px;">
            <p style="margin:0 0 8px; color:#475569; font-weight:600;">Message</p>
            <p style="margin:0; color:#334155; white-space:pre-wrap;">{message}</p>
          </div>
          <p style="font-size:13px; color:#64748b;">Reply to the user at the address above.</p>
        </div>
      </body>
    </html>
    """


def send_contact_request_email(
    name: str,
    email: str,
    message: str,
    background_tasks: BackgroundTasks,
    recipients: list[str] = ["iamsrizon122@gmail.com"],
):
    subject = f"New LifeOS contact request from {name}"
    body = build_contact_request_html(name, email, message)
    send_app_email(
        subject=subject,
        body=body,
        background_tasks=background_tasks,
        recipients=recipients,
    )


#main function to send email 
def send_app_email(
    subject: str,
    body: str,
    background_tasks: BackgroundTasks,
    recipients: list[str] = ["your_email@gmail.com"],
    subtype: MessageType = MessageType.html,
    attachments: list | None = None,
):
    if not conf:
        print("[DEV EMAIL] SMTP password not configured. Email content follows:")
        print(f"Subject: {subject}")
        print(f"Recipients: {recipients}")
        print(f"Body:\n{body}")
        return

    message_kwargs = dict(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype=subtype,
    )

    # Only pass attachments if provided (e.g. inline images with Content-ID)
    if attachments:
        message_kwargs["attachments"] = attachments

    message = MessageSchema(**message_kwargs)

    fm = FastMail(conf)
    # ব্যাকগ্রাউন্ডে ইমেইল পাঠানোর জন্য টাস্ক অ্যাড করা হলো
    background_tasks.add_task(fm.send_message, message)


# ৪. রিকোয়েস্ট বডি স্কিমা (এপিআই এর জন্য)
class EmailRequest(BaseModel):
    subject: str
    body: str


# ৫. স্ট্যান্ডঅ্যালোন টেস্ট এপিআই (চাইলে ব্যবহার করতে পারেন)
_test_app = FastAPI()

@_test_app.post("/send-email")
async def handle_send_email(email_data: EmailRequest, background_tasks: BackgroundTasks):
    send_app_email(
        subject=email_data.subject,
        body=email_data.body,
        background_tasks=background_tasks,
    )
    return {"message": "Email has been queued and is sending in the background"}