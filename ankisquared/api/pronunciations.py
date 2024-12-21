import os

import requests
from anki.utils import namedtmp
from aqt import mw
from aqt.utils import showWarning

from ankisquared.config import Config


def get_pronunciations(
    query: str,
    forvo_api_key: str,
    language: str,
    **_
) -> list[str]:
    """Fetch pronunciation MP3 URLs from Forvo API for a given word.

    Args:
        query (str): The word to get pronunciations for
        forvo_api_key (str): Forvo API authentication key
        language (str): Target language code (e.g., 'en', 'es', 'fr')
        **_: Additional unused parameters

    Returns:
        list[str]: List of MP3 URLs for pronunciations, empty list if request fails
    """
    query = query.lower().strip()
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/91.0.4472.124 Safari/537.36"
        ),
    }
    
    base_url = (
        f"https://apifree.forvo.com/action/word-pronunciations/format/json/"
        f"word/{query}/language/{language}/order/rate-desc/key/{forvo_api_key}/"
    )
    
    try:
        response = requests.get(base_url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            return [item["pathmp3"] for item in data["items"]]
        else:
            print(f"Forvo API request failed with status {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {str(e)}")
        
    return []
