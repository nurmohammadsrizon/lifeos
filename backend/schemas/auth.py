from pydantic import BaseModel

class verifyBrowserSchema(BaseModel):
  running_status: bool
class ForgotPasswordSchema(BaseModel):
  email: str