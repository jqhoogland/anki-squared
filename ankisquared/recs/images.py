from time import sleep
from typing import Dict, Iterator, Optional

import requests
from aqt import mw
from aqt.utils import showWarning

# No need for the DuckDuckGo-related constants, removing them

class BingSearch:
    """Bing Image Search class to get search results from Bing's API"""

    BING_API_ENDPOINT = "https://api.bing.microsoft.com/v7.0/images/search"

    def __init__(self, headers=None, proxies=None, timeout=10) -> None:
        self._session = requests.Session()
        if headers:
            self._session.headers.update(headers)
        if proxies:
            self._session.proxies.update(proxies)
        self._session.timeout = timeout

    def __enter__(self) -> "BingSearch":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self._session.close()

    def images(
        self, 
        query: str, 
        subscription_key: str, 
        mkt: str = 'en-US', 
        num_results: int = 10
    ) -> Iterator[Dict[str, Optional[str]]]:
        """Bing Image Search with API.

        Args:
            query: Keywords for search.
            subscription_key: Bing API subscription key.
            mkt: Market code (e.g. 'en-US'). Defaults to 'en-US'.
            num_results: Maximum number of results. Defaults to 10.

        Yields:
            dict with image search results.

        """
        headers = {
            'Ocp-Apim-Subscription-Key': subscription_key
        }
        params = {
            'q': query, 
            'mkt': mkt,
            'count': num_results
        }
        
        response = self._session.get(self.BING_API_ENDPOINT, headers=headers, params=params)
        
        if response.status_code != 200:
            showWarning("Bing API request failed!")
            return

        search_results = response.json()
        for img in search_results["value"]:
            yield {
                "title": img["name"],
                "image": img["contentUrl"],
                "thumbnail": img["thumbnailUrl"],
                "url": img["hostPageUrl"],
            }
            sleep(5)


def get_images(keywords: str, num_images: int, language="en") -> list:
    conf = mw.addonManager.getConfig("ankisquared")
    bing_api_key = conf['bing_api_key']

    with BingSearch() as bing:
        return [r["thumbnail"] for r in bing.images(
            query=keywords,
            subscription_key=bing_api_key,
            mkt=language,
            num_results=num_images
        )]
