from fastapi import APIRouter, HTTPException
from models import ChatRequest, ChatResponse
from services import chat_service
from openai import AuthenticationError, RateLimitError, OpenAIError

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    try:
        response_messages = await chat_service(request.model, request.messages)
        return ChatResponse(messages=response_messages)
    except AuthenticationError:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API Error: Invalid OpenAI API Key"
        )
    except RateLimitError:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API Error: Too many requests to OpenAI API"
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
