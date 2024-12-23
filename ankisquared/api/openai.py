import json
from typing import Dict
import requests
from ankisquared.api.utils import Suggestion
from aqt.utils import showWarning
from ankisquared.consts import ModelLiteral

OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions"


def get_completion(
    query: str,
    openai_api_key: str,
    max_tokens: int,
    temperature: float,
    model: ModelLiteral,
    system_prompt: str,
    **kwargs,
) -> Suggestion:
    """Generate a completion using OpenAI's API.

    Args:
        query (str): The prompt to generate a sentence from
        openai_api_key (str): OpenAI API authentication key
        max_tokens (int): Maximum length of generated response
        temperature (float): Randomness of the generation (0.0-1.0)
        model (ModelLiteral): OpenAI model to use
        **kwargs: Additional parameters used to format the prompt

    Returns:
        str: Generated sentence or empty string if request fails
    """
    headers = {
        "Authorization": f"Bearer {openai_api_key}",
        "Content-Type": "application/json",
    }

    data = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt.format(**kwargs),
            },
            {"role": "user", "content": query.format(**kwargs)},
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    try:
        print("POST", OPENAI_API_ENDPOINT, data)
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data,
        )

        if response.status_code == 200:
            choices = response.json().get("choices", [])
            if choices:
                return Suggestion(
                    type="text",
                    content=choices[0].get("message", {}).get("content", "").strip(),
                )
        else:
            showWarning("OpenAI API request failed!")
            print(f"Error: {response.text}")

    except requests.exceptions.RequestException as e:
        showWarning(f"Network error: {str(e)}")
        print(f"Request failed: {str(e)}")

    return Suggestion(type="text", content="")


FieldName = str


def get_completions(
    queries: Dict[FieldName, str],
    openai_api_key: str,
    max_tokens: int,
    temperature: float,
    model: ModelLiteral,
    system_prompt: str,
    **kwargs,
) -> Dict[FieldName, Suggestion]:
    """Generate a set of completions using OpenAI's API.

    Args:
        queries (Dict[FieldName, str): A mapping from query identifiers (usually field names) to queries
        openai_api_key (str): OpenAI API authentication key
        max_tokens (int): Maximum length of generated response
        temperature (float): Randomness of the generation (0.0-1.0)
        model (ModelLiteral): OpenAI model to use
        **kwargs: Additional parameters used to format the prompt

    Returns:
        str: Generated sentence or empty string if request fails
    """
    headers = {
        "Authorization": f"Bearer {openai_api_key}",
        "Content-Type": "application/json",
    }

    system_prompt = (
        system_prompt.format(**kwargs)
        + "\nRespond with a JSON payload matching the query."
    )

    data = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {"role": "user", "content": json.dumps(queries)},
        ],
        "max_tokens": max_tokens * len(queries),
        "temperature": temperature,
        "response_format": {"type": "json_object"},
    }

    try:
        print("POST", OPENAI_API_ENDPOINT, data)
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data,
        )

        if response.status_code == 200:
            choices = response.json().get("choices", [])
            if choices:
                content = choices[0].get("message", {}).get("content", "").strip()
                print("CONTENT")
                print(content)
                payload = json.loads(content)

                return {
                    k: Suggestion(
                        type="text",
                        content=v,
                    )
                    for k, v in payload.items()
                }
        else:
            showWarning("OpenAI API request failed!")
            print(f"Error: {response.text}")

    except requests.exceptions.RequestException as e:
        showWarning(f"Network error: {str(e)}")
        print(f"Request failed: {str(e)}")

    return Suggestion(type="text", content="")
