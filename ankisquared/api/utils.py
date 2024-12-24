from dataclasses import dataclass
from typing import List, Literal, Optional


@dataclass
class Suggestion:
    type: Literal["image", "sound", "text"]
    urls: Optional[List[str]] = None
    content: Optional[str] = None

    def to_anki(self, url_retriever=None) -> str:
        """Convert to Anki-compatible string.

        Args:
            url_retriever: Optional function to process URLs before formatting
        """
        if not self.content and not self.urls:
            return ""

        if self.type == "text":
            return self.content or ""

        if not url_retriever:
            url_retriever = lambda x: x

        if self.type == "image":
            urls = [url_retriever(url) for url in (self.urls or [])]
            return "".join(f'<img src="{url}" />' for url in urls)

        if self.type == "sound":
            url = url_retriever(self.urls[0]) if self.urls else ""
            return f"[sound:{url}]" if url else ""

        raise ValueError(f"Invalid suggestion type: {self.type}")
