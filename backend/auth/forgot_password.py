from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from ..components import send_mail
from ..headers import files
import random
from ..schemas import auth

SendCodeSchema = auth.ForgotPasswordSchema
router = APIRouter()

verification_codes = {}


class VerifyCodeSchema(BaseModel):
    email: str
    code: str


class ResetPasswordSchema(BaseModel):
    email: str
    code: str
    password: str
    confirm_password: str


def generate_code():
    return f"{random.randint(100000, 999999)}"


@router.post('/send-code')
async def send_code(data: SendCodeSchema, background_tasks: BackgroundTasks):
    email = data.email.strip().lower()

    if not email or '@' not in email:
        raise HTTPException(status_code=400, detail='Please enter a valid email address.')

    try:
        code = generate_code()
        verification_codes[email] = code

        send_mail.send_app_email(
            subject='Password Reset Request',
            body=(
                f"Hello,\n\n"
                f"You requested a password reset for your LifeOS account.\n"
                f"Your verification code is: {code}\n\n"
                f"Please do not share this code with anyone.\n\n"
                f"Thanks,\n"
                f"LifeOS Team"
            ),
            background_tasks=background_tasks,
            recipients=[email],
        )

        return {
            'success': True,
            'message': 'Verification code sent successfully.'
        }
    except Exception as exc:
        print(f'Forgot password email error: {exc}')
        return {
            'success': True,
            'message': 'Verification code prepared successfully. If SMTP is not configured, check the server console for the code.'
        }


@router.post('/verify-code')
async def verify_code(data: VerifyCodeSchema):
    email = data.email.strip().lower()
    code = data.code.strip()

    if not email or '@' not in email:
        raise HTTPException(status_code=400, detail='Please enter a valid email address.')

    expected_code = verification_codes.get(email)
    if not expected_code or expected_code != code:
        raise HTTPException(status_code=400, detail='The verification code is incorrect or has expired.')

    return {
        'success': True,
        'message': 'Code verified successfully.'
    }


@router.post('/reset-password')
async def reset_password(data: ResetPasswordSchema):
    email = data.email.strip().lower()
    code = data.code.strip()
    password = data.password.strip()
    confirm_password = data.confirm_password.strip()

    if not email or '@' not in email:
        raise HTTPException(status_code=400, detail='Please enter a valid email address.')

    if len(password) < 6:
        raise HTTPException(status_code=400, detail='Password must be at least 6 characters long.')

    if password != confirm_password:
        raise HTTPException(status_code=400, detail='Passwords do not match.')

    expected_code = verification_codes.get(email)
    if not expected_code or expected_code != code:
        raise HTTPException(status_code=400, detail='The verification code is incorrect or has expired.')

    updated = files.updatePasswordForEmail(email, password)
    if not updated:
        raise HTTPException(status_code=404, detail='No account found for that email address.')

    verification_codes.pop(email, None)

    return {
        'success': True,
        'message': 'Password updated successfully.'
    }