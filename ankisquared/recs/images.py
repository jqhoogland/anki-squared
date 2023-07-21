from duckduckgo_images_api import search


def get_images(query: str) -> list:
    results = search(query)
    return [r["url"] for r in results["results"]]