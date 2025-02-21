from pydantic import BaseModel, Field, field_validator
from typing import List
from enum import Enum


class OpenAIModel(str, Enum):
    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"


class Role(str, Enum):
    SYSTEM = "system"
    DEVELOPER = ("developer",)
    USER = ("user",)
    ASSISTANT = "assistant"


class Message(BaseModel):
    role: Role
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    model: OpenAIModel

    @field_validator("model")
    def validate_model(cls, v: str) -> str:
        valid_models = [model for model in OpenAIModel]

        if v not in valid_models:
            raise ValueError(
                f"Invalid model. Must be one of: {', '.join(valid_models)}"
            )
        return v

    @field_validator("messages")
    def check_messages(cls, v):
        if not v:
            raise ValueError(
                "'messages' field is required and must be a non-empty array"
            )
        return v


class ChatResponse(BaseModel):
    messages: List[Message] = Field(
        ..., description="A list of messages in the response."
    )
