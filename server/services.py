import openai
from openai import OpenAI
from config import settings
from models import Message, Role
from exceptions import AuthenticationError, RateLimitError, ServiceError

client = OpenAI(api_key=settings.openai_api_key)


async def chat_service(model: str, messages: list[Message]) -> Message:
    try:
        completion = client.chat.completions.create(
            model=model, messages=[msg.model_dump() for msg in messages]
        )
        assistant_content = completion.choices[0].message.content
        return Message(role=Role.ASSISTANT, content=assistant_content)
    except openai.AuthenticationError as e:
        raise AuthenticationError("Invalid OpenAI API Key") from e
    except openai.RateLimitError as e:
        raise RateLimitError("Too many requests to OpenAI API") from e
    except openai.OpenAIError as e:
        raise ServiceError(str(e)) from e


def chat_service_v2(model: str, messages: list[Message]):
    try:
        stream = client.chat.completions.create(
            model=model,
            messages=[msg.model_dump() for msg in messages],
            stream=True,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content

    except openai.AuthenticationError as e:
        raise AuthenticationError("Invalid OpenAI API Key") from e
    except openai.RateLimitError as e:
        raise RateLimitError("Too many requests to OpenAI API") from e
    except openai.OpenAIError as e:
        raise ServiceError(str(e)) from e
