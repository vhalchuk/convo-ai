import openai
from openai import OpenAI
from config import settings
from models import Message, Role
from exceptions import AuthenticationError, RateLimitError, ServiceError

client = OpenAI(api_key=settings.openai_api_key)


async def chat_service(model: str, messages: list[Message]) -> list[Message]:
    try:
        completion = client.chat.completions.create(
            model=model, messages=[msg.model_dump() for msg in messages]
        )
        assistant_content = completion.choices[0].message.content
        response_messages = messages + [
            Message(role=Role.ASSISTANT, content=assistant_content)
        ]
        return response_messages
    except openai.AuthenticationError as e:
        raise AuthenticationError("Invalid OpenAI API Key") from e
    except openai.RateLimitError as e:
        raise RateLimitError("Too many requests to OpenAI API") from e
    except openai.OpenAIError as e:
        raise ServiceError(str(e)) from e
