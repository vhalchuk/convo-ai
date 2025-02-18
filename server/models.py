from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Literal
from config import settings


class ChatRequest(BaseModel):
    """
    Model representing a request to the chat system.
    """
    messages: List[Dict[str, Any]] = Field(
        ...,
        description="A list of message objects, where each message object contains the characteristics of user or system messages."
    )
    model: Literal["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"] = Field(
        ...,
        description=f"The name of the model being requested. Must be one of: {', '.join(settings.valid_models)}"
    )

    @field_validator("messages")
    @classmethod
    def check_messages(cls, v):
        if not v:
            raise ValueError("'messages' field is required and must be a non-empty array")
        return v

    # Adding metadata for the model
    class Config:
        title = "Chat Request Model"
        description = (
            "This is a Pydantic model for validating incoming requests to the chat system. "
            "It ensures that the 'messages' field contains input data for the system and "
            "validates the 'model' against a predefined list of acceptable models."
        )