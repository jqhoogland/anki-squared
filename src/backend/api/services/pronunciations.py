import json, os

import requests

from .languages import get_language_code

FORVO_API_KEY = os.getenv("FORVO_API_KEY")

def get_forvo_pronunciations(query, max_results=3):
    """
    To get pronunciations, you have to sign up for an API token with [Forvo](https://api.forvo.com/)
    And you have to set the ``FORVO_API_KEY`` environmental variable in your ``.env``
    """
    language_code = get_language_code()

    url = f'https://apifree.forvo.com/key/{FORVO_API_KEY}/format/json/action/word-pronunciations/word/{query}/language/{language_code}/order/rate-desc'
    res = requests.get(url, headers={'User-Agent': 'Anki squared'})
    parsed = json.loads(res.text)
    n_items = min(max_results, parsed["attributes"]["total"])

    return parsed["items"][:n_items]
