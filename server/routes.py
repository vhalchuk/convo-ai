from fastapi import APIRouter, HTTPException
from models import ChatRequest, ChatResponse
from services import chat_service
from exceptions import AuthenticationError, RateLimitError, ServiceError

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    try:
        response_messages = await chat_service(request.model, request.messages)
        return ChatResponse(messages=response_messages)
    except AuthenticationError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except RateLimitError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except ServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
