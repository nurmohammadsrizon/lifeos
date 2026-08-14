from fastapi import FastAPI, BackgroundTasks
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import BaseModel, EmailStr

app = FastAPI()

# 1. Define the Request Body Schema
class EmailSchema(BaseModel):
    email: list[EmailStr]
    subject: str
    body: str

# 2. Configure SMTP Connection Settings
# Replace these values with your actual email provider details
conf = ConnectionConfig(
    MAIL_USERNAME="your_email@gmail.com",
    MAIL_PASSWORD="your_app_password",  # Use an App Password, NOT your main password
    MAIL_FROM="your_email@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="LifeOS App",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# 3. Create the Email Endpoint
async def send_email(email_data: EmailSchema, background_tasks: BackgroundTasks):
    
    # Define the message details
    message = MessageSchema(
        subject=email_data.subject,
        recipients=email_data.email,
        body=email_data.body,
        subtype=MessageType.plain # Use MessageType.html if you want to send HTML emails
    )

    fm = FastMail(conf)
    
    # Using background_tasks ensures the API responds instantly 
    # without waiting for the email to finish sending.
    background_tasks.add_task(fm.send_message, message)

    return {"message": "Email has been queued and is sending in the background"}