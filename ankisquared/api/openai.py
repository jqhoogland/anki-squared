import requests
from ankisquared.api.utils import Suggestion
from aqt.utils import showWarning
from ankisquared.consts import ModelLiteral

OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions"

def get_completion(
    query: str,
    openai_api_key: str,
    language: str,
    difficulty: str,
    max_tokens: int,
    temperature: float,
    model: ModelLiteral,
    **_,
) -> Suggestion:
    """Generate a completion using OpenAI's API.

    Args:
        query (str): The prompt to generate a sentence from
        openai_api_key (str): OpenAI API authentication key
        language (str): Target language for sentence generation
        difficulty (str): Student's proficiency level
        max_tokens (int): Maximum length of generated response
        temperature (float): Randomness of the generation (0.0-1.0)
        model (ModelLiteral): OpenAI model to use
        **_: Additional unused parameters

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
                "content": f"You are the world's best language teacher (language: {language}, student's level: {difficulty}).",
            },
            {"role": "user", "content": query},
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    try:
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
