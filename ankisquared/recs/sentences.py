from pprint import pp

import requests
from aqt import mw
from aqt.utils import showWarning

from ankisquared.config import Config
from ankisquared.consts import ModelLiteral


def get_sentence(query: str, openai_api_key: str, language: str, difficulty: str, max_tokens: int, temperature: float, model: ModelLiteral, **_) -> str:    
    headers = {
        "Authorization": f"Bearer {openai_api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": f"You are the world's best language teacher (language: {language}, student's level: {difficulty})."}, 
            {"role": "user", "content": query}
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
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
