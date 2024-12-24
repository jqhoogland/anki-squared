from ankisquared.utils import print, pprint
from ankisquared.api.utils import Suggestion

def get_stroke_order(query: str, **_) -> Suggestion:
    """Fetch stroke order SVG URLs for each character in the query.

    Args:
        query (str): The text to get stroke orders for

    Returns:
        Suggestion: Suggestion object containing SVG URLs
    """
    base_url = "https://github.com/skishore/makemeahanzi/blob/master/svgs-still/"
    urls = []

    for char in query:
        codepoint = ord(char)
        svg_url = f"{base_url}{codepoint}-still.svg?raw=True"
        urls.append(svg_url)

    print(f"[bold green]GET MakeMeAHanzi[/bold green]")
    pprint({"query": query})

    print(f"[bold green]Response[/bold green]")
    pprint({"urls": urls})

    return Suggestion(type="image", urls=urls) 