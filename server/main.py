from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError, AuthenticationError, RateLimitError

# Load environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key or not openai_api_key.strip():
    raise ValueError("OPENAI_API_KEY environment variable is missing or invalid")

allowed_origin = os.getenv("ALLOWED_ORIGIN")
if not allowed_origin or not allowed_origin.strip():
    raise ValueError("ALLOWED_ORIGIN environment variable is missing or invalid")

# Initialize OpenAI client and valid models list
client = OpenAI(api_key=openai_api_key)
valid_models = ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"]

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]
    model: str

    @field_validator("messages")
    @classmethod
    def check_messages(cls, v):
        if not v:
            raise ValueError("'messages' field is required and must be a non-empty array")
        return v

    @field_validator("model")
    @classmethod
    def check_model(cls, v):
        if v not in valid_models:
            raise ValueError(f"'model' field must be one of: {', '.join(valid_models)}")
        return v

class ChatResponse(BaseModel):
    messages: List[Dict[str, Any]]

@app.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        completion = client.chat.completions.create(
            model=request.model,
            messages=request.messages
        )
        assistant_content = completion.choices[0].message.content
        response_messages = request.messages + [{"role": "assistant", "content": assistant_content}]
        return ChatResponse(messages=response_messages)
    except AuthenticationError:
        raise HTTPException(
            status_code=401,
            detail="Authentication Error: Invalid OpenAI API Key"
        )
    except RateLimitError:
        raise HTTPException(
            status_code=429,
            detail="Rate Limit Exceeded: Too many requests to OpenAI API"
        )
    except OpenAIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI API Error: {str(e)}"
        )
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        )