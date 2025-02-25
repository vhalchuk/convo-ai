import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    openai_api_key: str = os.getenv("OPENAI_API_KEY")
    allowed_origin: str = os.getenv("ALLOWED_ORIGIN")

    if not openai_api_key or not openai_api_key.strip():
        raise ValueError("OPENAI_API_KEY environment variable is missing or invalid")
    if not allowed_origin or not allowed_origin.strip():
        raise ValueError("ALLOWED_ORIGIN environment variable is missing or invalid")


settings = Settings()
