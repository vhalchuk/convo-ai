from openai import OpenAI
from config import settings

client = OpenAI(api_key=settings.openai_api_key)


async def chat_service(model: str, messages: list) -> list:
    completion = client.chat.completions.create(
        model=model,
        messages=messages
    )
    assistant_content = completion.choices[0].message.content
    response_messages = messages + [{"role": "assistant", "content": assistant_content}]
    return response_messages
