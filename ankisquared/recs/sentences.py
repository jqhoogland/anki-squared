from pprint import pp

import requests
from aqt import mw
from aqt.utils import showWarning

from ankisquared.config import Config


def get_sentence(query: str, config: Config) -> str:    
    headers = {
        "Authorization": f"Bearer {config.openai_api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": config.model,
        "messages": [
            {"role": "system", "content": f"You are a helpful language-teaching assistant (language: {config.language}, difficulty: {config.difficulty})."}, 
            {"role": "user", "content": f"Could you write a few example sentences using the word '{query}'? Respond with just the sentence. No quotes. Separate with a newline."}
        ],
        "max_tokens": config.max_tokens,
        "temperature": config.temperature,
    }
    pp(data["messages"])
    response = requests.post(f"https://api.openai.com/v1/chat/completions", headers=headers, json=data)
    
    if response.status_code == 200:
        choices = response.json().get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "").strip()
        
    else:
        showWarning("OpenAI API request failed!")
        print(response.text)

    return ""
