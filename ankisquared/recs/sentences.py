from pprint import pp

import requests
from aqt import mw
from aqt.utils import showWarning


def get_sentence(query: str, language="en", difficulty="A1") -> str:
    config = mw.addonManager.getConfig("ankisquared")
    openai_api_key = config['openai_api_key']
    model = config['model']
    max_tokens = config.get('max_tokens', 100)
    temperature = config.get('temperature', 0.7)
    
    headers = {
        "Authorization": f"Bearer {openai_api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": f"You are a helpful language-teaching assistant (language: {language}, difficulty: {difficulty})."}, 
            {"role": "user", "content": f"Could you write a few example sentences using the word '{query}'? Respond with just the sentence. No quotes. Separate with a newline."}
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
