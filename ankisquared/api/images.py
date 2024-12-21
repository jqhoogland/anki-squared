from contextlib import contextmanager
from typing import Dict, Iterator, Optional

import requests
from aqt.utils import showWarning


BING_API_ENDPOINT = "https://api.bing.microsoft.com/v7.0/images/search"


@contextmanager
def create_session(headers=None, proxies=None, timeout=10):
    """Create and manage a requests Session context.

    Args:
        headers (dict, optional): HTTP headers to include in all requests
        proxies (dict, optional): Proxy configuration for requests
        timeout (int, optional): Request timeout in seconds. Defaults to 10.

    Yields:
        requests.Session: Configured session object
    """
    session = requests.Session()
    if headers:
        session.headers.update(headers)
    if proxies:
        session.proxies.update(proxies)
    session.timeout = timeout
    
    try:
        yield session
    finally:
        session.close()


def search_bing_images(
    session: requests.Session,
    query: str,
    subscription_key: str,
    mkt: str = 'en-US',
    num_results: int = 10,
) -> Iterator[Dict[str, Optional[str]]]:
    """Search for images using Bing's Image Search API.

    Args:
        session (requests.Session): Active requests session
        query (str): Keywords for search
        subscription_key (str): Bing API subscription key
        mkt (str, optional): Market code. Defaults to 'en-US'
        num_results (int, optional): Maximum number of results. Defaults to 10

    Yields:
        dict: Image search result containing title, image URL, thumbnail URL, and source page URL
    """
    headers = {
        'Ocp-Apim-Subscription-Key': subscription_key,
    }
    params = {
        'q': query,
        'mkt': mkt,
        'count': num_results,
    }
    
    response = session.get(BING_API_ENDPOINT, headers=headers, params=params)
    
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


def get_images(
    keywords: str,
    bing_api_key: str,
    language: str,
    num_images: int,
    **_
) -> list:
    """Get image thumbnails from Bing Image Search.

    Args:
        keywords (str): Search query
        bing_api_key (str): Bing API subscription key
        language (str): Market code for search results
        num_images (int): Number of images to retrieve
        **_: Additional unused parameters

    Returns:
        list: List of thumbnail URLs
    """
    with create_session() as session:
        return [r["thumbnail"] for r in search_bing_images(
            session=session,
            query=keywords,
            subscription_key=bing_api_key,
            mkt=language,
            num_results=num_images,
        )]
