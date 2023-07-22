from dataclasses import asdict, dataclass, field
from pprint import pp
from typing import Annotated, List, Literal, Optional

from aqt import mw

from ankisquared.consts import LANGUAGES, ModelLiteral


@dataclass
class ButtonConfig:
    name: str
    icon: str
    cmd: str
    tip: str
    action_endpoint: str
    action_prompt: str = "{0}" 
    keys: Optional[str] = None

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

    # Button Configurations
    buttons: List[ButtonConfig] = field(default_factory=list)

    @classmethod
    def from_conf(cls):
        conf = mw.addonManager.getConfig("ankisquared") or {}
        print("Loaded config:")
        pp(conf)

        button_configs = [ButtonConfig(**button_conf) for button_conf in conf.get("buttons", None) or []] or default_buttons

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
            buttons=button_configs
        )
    
    def save_to_conf(self):
        conf = mw.addonManager.getConfig("ankisquared") or {}
        conf.update(asdict(self))
        mw.addonManager.writeConfig("ankisquared", conf)

        print("Saved config:")
        pp(conf)

    def update(self, **fields):
        for key, value in fields.items():
            setattr(self, key, value)
        
        self.save_to_conf()
        

# 1. Generate images using Bing
images_button = ButtonConfig(
    name="Images",
    icon="image-search.png",  # replace with appropriate icon filename
    cmd="genImages",
    tip="Suggest Images from Bing",
    action_endpoint="Bing",
    keys="Ctrl+Shift+1"
)

# 2. Generate pronunciations using Forvo
pronunciations_button = ButtonConfig(
    name="Pronunciations",
    icon="forvo.png",  # replace with appropriate icon filename
    cmd="genPronunciations",
    tip="Suggest Pronunciations from Forvo",
    action_endpoint="Forvo",
    keys="Ctrl+Shift+2"
)

# 3. Generate examples using OpenAI
examples_button = ButtonConfig(
    name="Examples",
    icon="example.png",  # replace with appropriate icon filename
    cmd="genSentences",
    tip="Suggest Sentences using OpenAI",
    action_endpoint="OpenAI",
    action_prompt="Provide several example sentences for the word `{0}` separated by newlines.",
    keys="Ctrl+Shift+3"
)

# 4. Generate a definition using OpenAI
definitions_button = ButtonConfig(
    name="Definitions",
    icon="definition.png",  # replace with appropriate icon filename
    cmd="genDefinitions",
    tip="Suggest Definition using OpenAI",
    action_endpoint="OpenAI",
    action_prompt="Provide a definition for `{0}`.",
    keys="Ctrl+Shift+4"
)

# 5. Generate an IPA transcription using OpenAI
ipa_button = ButtonConfig(
    name="IPA",
    icon="ipa.png",  # replace with appropriate icon filename
    cmd="genIPA",
    tip="Generate IPA Transcription using OpenAI",
    action_endpoint="OpenAI",
    action_prompt="Provide the IPA for `{0}`.",
    keys="Ctrl+Shift+5"
)

default_buttons = [images_button, pronunciations_button, examples_button, definitions_button, ipa_button]
DEFAULT_BUTTONS = [asdict(button) for button in default_buttons]