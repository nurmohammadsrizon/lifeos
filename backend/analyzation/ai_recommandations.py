import os
from google import genai
from fastapi import APIRouter
from pydantic import BaseModel

import os
from dotenv import load_dotenv

# Load key-value pairs from the .env file into the environment
load_dotenv()
router = APIRouter()
class TempleteInput(BaseModel):
    prompt: str

@router.post("/gemini-recommendation")
def get_gemini_recommendation(input: TempleteInput) -> str:
# The SDK automatically loads the key from your GEMINI_API_KEY environment variable
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    # Generate text using the flagship lightweight model
    interaction = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=input.prompt,
    )

    # Print the resulting output
    print(interaction.text)
