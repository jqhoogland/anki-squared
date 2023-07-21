import requests
from aqt import mw


def get_pronunciations(query: str) -> list:
    config = mw.addonManager.getConfig("ankisquared")
    forvo_api_key = config['forvo_api_key']
    language = config['language']
    
    base_url = "https://apifree.forvo.com/action/word-pronunciations"
    params = {
        "key": forvo_api_key,
        "word": query,
        "format": "json",
        "language": language
    }

    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        return [item["pathmp3"] for item in data["items"]]
    return []
