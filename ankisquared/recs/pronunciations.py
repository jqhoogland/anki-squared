import os

import requests
from anki.utils import namedtmp
from aqt import mw
from aqt.utils import showWarning

from ankisquared.config import Config


def get_pronunciations(query: str, forvo_api_key: str, language: str, **_) -> list:
    q = query.lower().strip()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    base_url =f"https://apifree.forvo.com/action/word-pronunciations/format/json/word/{q}/language/{language}/order/rate-desc/key/{forvo_api_key}/"
    response = requests.get(base_url, headers=headers)

    print(f"Forvo API request: {base_url}")

    if response.status_code == 200:
        data = response.json()
        return [item["pathmp3"] for item in data["items"]]

    showWarning("Forvo API request failed!")
    print(response.text)
    
    return []
