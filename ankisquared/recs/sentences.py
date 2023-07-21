from pprint import pp

import requests
from aqt import mw


def get_sentence(query: str) -> str:
    config = mw.addonManager.getConfig("ankisquared")
    model = config['model']
    openai_api_key = config['openai_api_key']
    language = config['language']
    difficulty = config['difficulty']
    
    headers = {
        "Authorization": f"Bearer {openai_api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "prompt": f"Write an example sentence using the word {query} (language: {language}, difficulty: {difficulty}).",
        "max_tokens": 50
    }
    pp(data)
    response = requests.post(f"https://api.openai.com/v2/engines/{model}/completions", headers=headers, json=data)
    pp(response)
    pp(response.json())
    
    if response.status_code == 200:
        choices = response.json().get("choices", [])
        if choices:
            return choices[0].get("text", "").strip()
    return ""
