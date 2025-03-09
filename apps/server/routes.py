from fastapi import APIRouter, HTTPException
from pydantic import ValidationError
from starlette.responses import StreamingResponse

from exceptions import AuthenticationError, RateLimitError, ServiceError
from models import ChatRequest, ChatResponse
from services import chat_service, chat_service_v2

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    try:
        response_message = await chat_service(request.model, request.messages)
        return ChatResponse(message=response_message)
    except AuthenticationError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except RateLimitError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except ServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/stream")
def sse_endpoint(request: ChatRequest):
    try:

        def event_generator():
            try:
                for chunk in chat_service_v2(
                    request.model,
                    request.messages,
                ):
                    if not isinstance(chunk, str):
                        continue

                    lines = chunk.split("\n")
                    s = (
                        "event: delta\n"
                        + "".join(f"data: {line}\n" for line in lines)
                        + "\n"
                    )
                    yield s

            except Exception as e:
                print(f"Error during chat processing: {e}")
                yield f"data: {str(e)}\n\n"
            finally:
                yield "data: [DONE]"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    except ValidationError as e:
        print(f"Validation Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
