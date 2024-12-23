from dataclasses import asdict, dataclass, field
from pprint import pp
from typing import Annotated, List, Literal, Optional
from enum import Enum

from aqt import mw

from ankisquared.consts import LANGUAGES, ModelLiteral


class Endpoint(str, Enum):
    BING = "Bing"
    FORVO = "Forvo"
    OPENAI = "OpenAI"


@dataclass
class ButtonConfig:
    name: str
    icon: str
    tip: str
    endpoint: Endpoint
    prompt: str = "{0}"
    keys: Optional[str] = None

    @property
    def cmd(self) -> str:
        return f"suggest{''.join(word.capitalize() for word in self.name.split())}"


@dataclass
class Config:
    language: Annotated[str, {"options": LANGUAGES}]
    difficulty: Literal["A1", "A2", "B1", "B2", "C1", "C2"]

    # Pronunciations
    forvo_api_key: str

    # Images
    bing_api_key: str
    num_images: int

    # Sentences
    openai_api_key: str
    model: ModelLiteral
    max_tokens: int
    temperature: float
    system_prompt: str = "You are the world's best language teacher (language: {language}, student's level: {difficulty})."

    # Button Configurations
    buttons: List[ButtonConfig] = field(default_factory=list)

    @classmethod
    def from_conf(cls):
        conf = mw.addonManager.getConfig("ankisquared") or {}
        button_configs = []

        for button_conf in conf.get("buttons", None) or []:
            if "cmd" in button_conf:
                button_conf.pop("cmd")
            button_configs.append(ButtonConfig(**button_conf))

        return cls(
            language=conf.get("language", "en"),
            difficulty=conf.get("difficulty", "A1"),
            forvo_api_key=conf.get("forvo_api_key", ""),
            bing_api_key=conf.get("bing_api_key", ""),
            model=conf.get("model", "gpt-4"),
            openai_api_key=conf.get("openai_api_key", ""),
            max_tokens=conf.get("max_tokens", 100),
            temperature=conf.get("temperature", 0.7),
            num_images=conf.get("num_images", 3),
            system_prompt=conf.get("system_prompt", "You are the world's best language teacher (language: {language}, student's level: {difficulty})."),
            buttons=button_configs,
        )

    def save_to_conf(self):
        conf = mw.addonManager.getConfig("ankisquared") or {}
        conf.update(asdict(self))
        mw.addonManager.writeConfig("ankisquared", conf)

    def update(self, **fields):
        for key, value in fields.items():
            setattr(self, key, value)

        self.save_to_conf()


# 1. Generate images using Bing
images_button = ButtonConfig(
    name="Images",
    icon="image-search.png",  # replace with appropriate icon filename
    tip="Suggest Images from Bing",
    endpoint=Endpoint.BING,
    keys="Ctrl+1",
)

# 2. Generate pronunciations using Forvo
pronunciations_button = ButtonConfig(
    name="Pronunciations",
    icon="forvo.png",  # replace with appropriate icon filename
    tip="Suggest Pronunciations from Forvo",
    endpoint=Endpoint.FORVO,
    keys="Ctrl+2",
)

# 3. Generate examples using OpenAI
examples_button = ButtonConfig(
    name="Examples",
    icon="example.png",  # replace with appropriate icon filename
    tip="Suggest Sentences using OpenAI",
    endpoint=Endpoint.OPENAI,
    prompt="Provide several example sentences for the word `{0}` separated by newlines.",
    keys="Ctrl+3",
)

# 4. Generate a definition using OpenAI
definitions_button = ButtonConfig(
    name="Definitions",
    icon="definition.png",  # replace with appropriate icon filename
    tip="Suggest Definition using OpenAI",
    endpoint=Endpoint.OPENAI,
    prompt="Provide a definition for `{0}`.",
    keys="Ctrl+4",
)

# 5. Generate an IPA transcription using OpenAI
ipa_button = ButtonConfig(
    name="IPA",
    icon="ipa.png",  # replace with appropriate icon filename
    tip="Generate IPA Transcription using OpenAI",
    endpoint=Endpoint.OPENAI,
    prompt="Provide the IPA for `{0}`.",
    keys="Ctrl+5",
)

default_buttons = [
    images_button,
    pronunciations_button,
    examples_button,
    definitions_button,
    ipa_button,
]
DEFAULT_BUTTONS = [asdict(button) for button in default_buttons]
