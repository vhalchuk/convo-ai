from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from models import ChatRequest, ChatResponse, Message, Role
from services import chat_service, chat_service_v2
from exceptions import AuthenticationError, RateLimitError, ServiceError

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


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            request_json = await websocket.receive_json()
            try:
                chat_request = ChatRequest(**request_json)

                content = ""

                async for message_chunk in chat_service_v2(
                    chat_request.model, chat_request.messages
                ):
                    if message_chunk is not None:
                        content = content + message_chunk
                        await websocket.send_json(
                            ChatResponse(
                                message=Message(role=Role.ASSISTANT, content=content)
                            ).model_dump()
                        )
                await websocket.send_json({"status": "[DONE]"})
            except ValidationError as e:
                print(f"Validation Error: {e}")
                await websocket.send_json({"error": str(e)})
            except Exception as e:
                print(f"Error during chat processing: {e}")
                await websocket.send_json({"error": str(e)})
    except WebSocketDisconnect:
        pass
