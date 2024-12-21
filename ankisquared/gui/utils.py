import html
from typing import Literal
from bs4 import BeautifulSoup
from ankisquared.config import ButtonConfig, Config, Endpoint
from ankisquared.consts import ICONS_PATH
from aqt.editor import Editor
from aqt.utils import showWarning
from dataclasses import asdict

IconName = Literal[
    "chatgpt.png",
    "definition.png",
    "example.png",
    "image-search.png",
    "ipa.png",
    "settings.png",
]


def get_icon_path(icon_name: IconName) -> str:
    """Get the full path for an icon file.

    Args:
        icons_path: Base path to icons directory
        icon_name: Name of the icon file

    Returns:
        str: Full path to icon file
    """
    return str(ICONS_PATH / icon_name)


def is_valid_field(editor: Editor) -> bool:
    """Check if a valid field is selected in the editor.

    Args:
        editor: Anki editor instance

    Returns:
        bool: True if valid field selected, False otherwise
    """
    if editor.currentField is not None:
        return True
    else:
        showWarning("Please focus on a field first!")
        return False


def clean_html(text: str) -> str:
    """Remove HTML tags from text using BeautifulSoup.

    Args:
        text: HTML text to clean

    Returns:
        str: Plain text without HTML tags
    """
    return BeautifulSoup(text, "html.parser").get_text()


def retrieve_and_escape_url(editor: Editor, url: str) -> str:
    """Retrieve and escape URL for Anki.

    Args:
        editor: Anki editor instance
        url: URL to process

    Returns:
        str: Escaped URL string
    """
    url = editor._retrieveURL(url)
    return html.escape(url, quote=False)


def render_button_as_text(button_config: ButtonConfig, config: Config) -> str:
    if button_config.endpoint == Endpoint.OPENAI:
        return f"System Prompt ({config.model}): \n\n{config.system_prompt.format(**asdict(config), **asdict(button_config))}"
    else:
        return button_config.tip


def get_value(widget):
    """
    Helper function to retrieve a value from a widget in a unified manner.
    """
    if hasattr(widget, "currentIndex"):
        if hasattr(widget, "itemData"):
            value = widget.itemData(widget.currentIndex())

            if value is not None:
                return value

    
    if hasattr(widget, "text"):
        return widget.text()
    elif hasattr(widget, "toPlainText"):
        return widget.toPlainText()
    elif hasattr(widget, "currentText"):
        return widget.currentText()
    elif hasattr(widget, "value"):
        return widget.value()
    raise ValueError(f"No value attribute found for widget {widget}")