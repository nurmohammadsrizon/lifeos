import os
from dotenv import load_dotenv

# Load variables from the .env file
load_dotenv()

google_account_app_password = os.getenv("GOOGLE_ACCOUNT_APP_PASSWORD")
# print(os.getenv("GOOGLE_ACCOUNT_APP_PASSWORD"))  # This will print the value of GOOGLE_ACCOUNT_APP_PASSWORD