from pydantic import BaseModel, Field, field_validator
from typing import List
from enum import Enum
from config import settings

class Role(str, Enum):
    SYSTEM = "system"
    DEVELOPER = "developer",
    USER = "user",
    ASSISTANT = "assistant"

class Message(BaseModel):
    role: Role
    content: str


class ChatRequest(BaseModel):
    messages: List[Message] = Field(
        ...,
        description="A non-empty list of messages making up the chat request."
    )
    model: Role = Field(
        ...,
        description=f"The name of the AI model being requested. Must be one of: {', '.join(settings.valid_models)}"
    )

    @field_validator("messages")
    def check_messages(self, v):
        if not v:
            raise ValueError("'messages' field is required and must be a non-empty array")
        return v


class ChatResponse(BaseModel):
    messages: List[Message] = Field(
        ...,
        description="A list of messages in the response."
    )
