import os

import requests
from anki.utils import namedtmp
from aqt import mw
from aqt.utils import showWarning


def get_pronunciations(query: str, language="en") -> list:
    config = mw.addonManager.getConfig("ankisquared")
    forvo_api_key = config['forvo_api_key']
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    base_url =f"https://apifree.forvo.com/action/word-pronunciations/format/json/word/{query.lower()}/language/{language}/order/rate-desc/key/{forvo_api_key}/"
    response = requests.get(base_url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        return [item["pathmp3"] for item in data["items"]]

    showWarning("Forvo API request failed!")
    print(response.text)
    
    return []
