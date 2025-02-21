import pytest
import requests
from models import OpenAIModel, Role

BASE_URL = "http://localhost:8000"
CHAT_ENDPOINT = f"{BASE_URL}/"

valid_messages = [
    {"role": Role.USER, "content": "Hello!"},
]


@pytest.mark.parametrize("model", [model for model in OpenAIModel])
def test_chat_endpoint_with_all_models(model):
    """
    Test the chat endpoint with all valid OpenAI models.
    """
    payload = {
        "model": model,
        "messages": valid_messages
    }

    response = requests.post(CHAT_ENDPOINT, json=payload)

    assert response.status_code == 200, f"Failed for model: {model}"
    data = response.json()
    assert "messages" in data, f"`messages` field missing for model: {model}"
    assert len(data["messages"]) >= len(valid_messages), f"Unexpected response for model: {model}"

def test_chat_endpoint_invalid_model():
    """
    Test the error scenario when an invalid model is passed.
    """
    payload = {
        "model": "invalid_model_name",
        "messages": valid_messages
    }
    response = requests.post(CHAT_ENDPOINT, json=payload)
    assert response.status_code == 422


def test_chat_endpoint_missing_messages():
    """
    Test the error scenario when `messages` field is missing or empty.
    """
    payload = {
        "model": OpenAIModel.GPT_4O_MINI,
        "messages": []
    }
    response = requests.post(CHAT_ENDPOINT, json=payload)
    assert response.status_code == 422

