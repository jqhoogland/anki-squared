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
    label: str = ""

    @property
    def cmd(self) -> str:
        return f"suggest{''.join(word.capitalize() for word in self.name.split())}"

    def cast(self):
        pass


@dataclass
class ProfileConfig:
    name: str
    language: Annotated[str, {"options": LANGUAGES}]

    # Images
    num_images: int

    # Generations
    model: ModelLiteral
    max_tokens: int
    temperature: float
    system_prompt: str = (
        "You are the world's best language teacher (language: {language})."
    )

    def cast(self):
        self.num_images = int(self.num_images)
        self.max_tokens = int(self.max_tokens)
        self.temperature = float(self.temperature)


@dataclass
class Config:
    forvo_api_key: str
    bing_api_key: str
    openai_api_key: str

    buttons: List[ButtonConfig] = field(default_factory=list)
    profiles: List[ProfileConfig] = field(default_factory=list)

    @classmethod
    def from_conf(cls):
        conf = mw.addonManager.getConfig("ankisquared") or {}

        button_configs = []
        for button_conf in conf.get("buttons", None) or []:
            button_configs.append(ButtonConfig(**button_conf))

        profile_configs = []
        for profile_conf in conf.get("profiles", None) or []:
            profile_configs.append(ProfileConfig(**profile_conf))

        if not profile_configs:
            profile_configs.append(
                ProfileConfig(
                    name="Default",
                    # Backwards compatibility
                    language=conf.get("language", "en"),
                    num_images=conf.get("num_images", 3),
                    model=conf.get("model", "gpt-4o"),
                    max_tokens=conf.get("max_tokens", 100),
                    temperature=conf.get("temperature", 0.7),
                    system_prompt=conf.get(
                        "system_prompt",
                        "You are the world's best language teacher (language: {language}).",
                    ),
                )
            )

        config = cls(
            forvo_api_key=conf.get("forvo_api_key", ""),
            bing_api_key=conf.get("bing_api_key", ""),
            openai_api_key=conf.get("openai_api_key", ""),
            buttons=button_configs,
            profiles=profile_configs,
        )
        config.cast()
        return config

    def reset(self):
        conf = asdict(self.from_conf())
        buttons = [ButtonConfig(**button) for button in conf.pop("buttons")]
        profiles = [ProfileConfig(**profile) for profile in conf.pop("profiles")]
        self.update(**conf, buttons=buttons, profiles=profiles)
        self.cast()

    def save_to_conf(self):
        self.cast()
        conf = mw.addonManager.getConfig("ankisquared") or {}
        conf.update(asdict(self))
        mw.addonManager.writeConfig("ankisquared", conf)

    def update(self, **fields):
        for key, value in fields.items():
            setattr(self, key, value)

        self.save_to_conf()

    def cast(self):
        for button in self.buttons:
            button.cast()

        for profile in self.profiles:
            profile.cast()
