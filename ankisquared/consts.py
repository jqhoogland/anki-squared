import os
import sys
from pathlib import Path
from typing import Literal

from anki import version

ANKI21 = version.startswith("2.1.")
SYS_ENCODING = sys.getfilesystemencoding()

if ANKI21:
    ADDON_PATH = os.path.dirname(__file__)
else:
    ADDON_PATH = os.path.dirname(__file__).decode(SYS_ENCODING)

ICONS_PATH = Path(os.path.join(ADDON_PATH, "icons"))


# Settings
DIFFICULTIES = ["A1", "A2", "B1", "B2", "C1", "C2"]

LANGUAGES = {
    "English": "en",
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Arabic": "ar",
    "Bengali": "bn",
    "Chinese": "zh",
    "Dutch": "nl",
    "Greek": "el",
    "Gujarati": "gu",
    "Hebrew": "he",
    "Hindi": "hi",
    "Italian": "it",
    "Japanese": "ja",
    "Kannada": "kn",
    "Korean": "ko",
    "Malay": "ms",
    "Malayalam": "ml",
    "Marathi": "mr",
    "Norwegian": "no",
    "Polish": "pl",
    "Portuguese": "pt",
    "Punjabi": "pa",
    "Russian": "ru",
    "Swedish": "sv",
    "Tamil": "ta",
    "Telugu": "te",
    "Thai": "th",
    "Turkish": "tr",
    "Ukrainian": "uk",
    "Urdu": "ur",
    "Vietnamese": "vi",
    "Welsh": "cy"
}

MODELS = [
    "babbage",
    "text-davinci-003",
    "davinci",
    "text-davinci-edit-001",
    "babbage-code-search-code",
    "text-similarity-babbage-001",
    "code-davinci-edit-001",
    "text-davinci-001",
    "ada",
    "babbage-code-search-text",
    "babbage-similarity",
    "gpt-4-0314",
    "gpt-3.5-turbo-16k-0613",
    "code-search-babbage-text-001",
    "text-curie-001",
    "gpt-3.5-turbo-0301",
    "gpt-3.5-turbo-16k",
    "gpt-4",
    "code-search-babbage-code-001",
    "text-ada-001",
    "text-similarity-ada-001",
    "text-davinci-002",
    "curie-instruct-beta",
    "ada-code-search-code",
    "ada-similarity",
    "code-search-ada-text-001",
    "text-search-ada-query-001",
    "davinci-search-document",
    "ada-code-search-text",
    "text-search-ada-doc-001",
    "davinci-instruct-beta",
    "text-similarity-curie-001",
    "code-search-ada-code-001",
    "ada-search-query",
    "text-search-davinci-query-001",
    "curie-search-query",
    "davinci-search-query",
    "babbage-search-document",
    "ada-search-document",
    "text-search-curie-query-001",
    "text-search-babbage-doc-001",
    "whisper-1",
    "curie-search-document",
    "text-search-curie-doc-001",
    "babbage-search-query",
    "text-babbage-001",
    "text-search-davinci-doc-001",
    "text-search-babbage-query-001",
    "curie-similarity",
    "text-embedding-ada-002",
    "curie",
    "text-similarity-davinci-001",
    "gpt-3.5-turbo-0613",
    "davinci-similarity",
    "gpt-3.5-turbo",
    "gpt-4-0613"
]



ModelLiteral = Literal[
    "babbage",
    "text-davinci-003",
    "davinci",
    "text-davinci-edit-001",
    "babbage-code-search-code",
    "text-similarity-babbage-001",
    "code-davinci-edit-001",
    "text-davinci-001",
    "ada",
    "babbage-code-search-text",
    "babbage-similarity",
    "gpt-4-0314",
    "gpt-3.5-turbo-16k-0613",
    "code-search-babbage-text-001",
    "text-curie-001",
    "gpt-3.5-turbo-0301",
    "gpt-3.5-turbo-16k",
    "gpt-4",
    "code-search-babbage-code-001",
    "text-ada-001",
    "text-similarity-ada-001",
    "text-davinci-002",
    "curie-instruct-beta",
    "ada-code-search-code",
    "ada-similarity",
    "code-search-ada-text-001",
    "text-search-ada-query-001",
    "davinci-search-document",
    "ada-code-search-text",
    "text-search-ada-doc-001",
    "davinci-instruct-beta",
    "text-similarity-curie-001",
    "code-search-ada-code-001",
    "ada-search-query",
    "text-search-davinci-query-001",
    "curie-search-query",
    "davinci-search-query",
    "babbage-search-document",
    "ada-search-document",
    "text-search-curie-query-001",
    "text-search-babbage-doc-001",
    "whisper-1",
    "curie-search-document",
    "text-search-curie-doc-001",
    "babbage-search-query",
    "text-babbage-001",
    "text-search-davinci-doc-001",
    "text-search-babbage-query-001",
    "curie-similarity",
    "text-embedding-ada-002",
    "curie",
    "text-similarity-davinci-001",
    "gpt-3.5-turbo-0613",
    "davinci-similarity",
    "gpt-3.5-turbo",
    "gpt-4-0613"
]
