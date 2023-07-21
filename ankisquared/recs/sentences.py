from pprint import pp

import requests
from aqt import mw
from aqt.utils import showWarning


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
        "model": model,
        "messages": [
            {"role": "system", "content": f"You are a helpful language-teaching assistant (language: {language}, difficulty: {difficulty})."}, 
            {"role": "user", "content": f"Could you write an example sentence using the word '{query}'? Respond with just the sentence."}
        ],
        "max_tokens": 100,
        "temperature": 0.7,
    }
    response = requests.post(f"https://api.openai.com/v1/chat/completions", headers=headers, json=data)
    
    if response.status_code == 200:
        choices = response.json().get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "").strip()
        
    else:
        showWarning("OpenAI API request failed!")
        print(response.text)

    return ""
