from dataclasses import asdict, dataclass, field
from pprint import pp, pprint
from typing import Annotated, Dict, List, Literal, Optional
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

    def __post_init__(self):
        pass

    def __repr__(self) -> str:
        return (
            f"ButtonConfig(\n"
            f"    name='{self.name}',\n"
            f"    icon='{self.icon}',\n"
            f"    tip='{self.tip}',\n"
            f"    endpoint={self.endpoint},\n"
            f"    prompt='{self.prompt}',\n"
            f"    keys={repr(self.keys)},\n"
            f"    label='{self.label}'\n"
            f")"
        )


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

    def __post_init__(self):
        self.num_images = int(self.num_images)
        self.max_tokens = int(self.max_tokens)
        self.temperature = float(self.temperature)

    def __repr__(self) -> str:
        return (
            f"ProfileConfig(\n"
            f"    name='{self.name}',\n"
            f"    language='{self.language}',\n"
            f"    num_images={self.num_images},\n"
            f"    model='{self.model}',\n"
            f"    max_tokens={self.max_tokens},\n"
            f"    temperature={self.temperature},\n"
            f"    system_prompt='{self.system_prompt}'\n"
            f")"
        )

    def __setattr__(self, name, value):
        if name == "num_images":
            value = int(value)
        elif name == "max_tokens":
            value = int(value)
        elif name == "temperature":
            value = float(value)
        super().__setattr__(name, value)


@dataclass
class FieldCompletion:
    enabled: bool = True
    endpoint: Endpoint = Endpoint.OPENAI
    prompt: str = "{0}"

    def __repr__(self) -> str:
        return (
            f"FieldCompletion(\n"
            f"    enabled={self.enabled},\n"
            f"    endpoint={self.endpoint},\n"
            f"    prompt='{self.prompt}'\n"
            f")"
        )


@dataclass
class NoteTypeTemplate:
    note_type_id: int
    field_completions: Dict[str, FieldCompletion]
    shared_prompt: str = ""

    @property
    def name(self):
        return mw.col.models.get(self.note_type_id).name

    def __post_init__(self):
        self.note_type_id = int(self.note_type_id)
        self.field_completions = {
            k: (FieldCompletion(**v) if isinstance(v, dict) else v)
            for k, v in self.field_completions.items()
        }

    def __repr__(self) -> str:
        field_completions_str = ",\n".join(
            f"        '{field}': {completion!r}".replace("\n", "\n        ")
            for field, completion in self.field_completions.items()
        )
        return (
            f"NoteTypeTemplate(\n"
            f"    note_type_id={self.note_type_id},\n"
            f"    shared_prompt='{self.shared_prompt}',\n"
            f"    field_completions={{\n"
            f"{field_completions_str}\n"
            f"    }}\n"
            f")"
        )


@dataclass
class Config:
    forvo_api_key: str
    bing_api_key: str
    openai_api_key: str

    buttons: List[ButtonConfig] = field(default_factory=list)
    profiles: List[ProfileConfig] = field(default_factory=list)
    active_profile_name: str = ""
    note_templates: List[NoteTypeTemplate] = field(default_factory=list)

    def __post_init__(self):
        self.buttons = [
            (ButtonConfig(**button) if isinstance(button, dict) else button)
            for button in self.buttons
        ]
        self.profiles = [
            (ProfileConfig(**profile) if isinstance(profile, dict) else profile)
            for profile in self.profiles
        ]
        self.note_templates = [
            (
                NoteTypeTemplate(**note_template)
                if isinstance(note_template, dict)
                else note_template
            )
            for note_template in self.note_templates
        ]

    @classmethod
    def from_conf(cls):
        conf = mw.addonManager.getConfig("ankisquared") or {}
        profiles = conf.get(
            "profiles",
            [
                dict(
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
            ],
        )

        config = cls(
            forvo_api_key=conf.get("forvo_api_key", ""),
            bing_api_key=conf.get("bing_api_key", ""),
            openai_api_key=conf.get("openai_api_key", ""),
            buttons=conf.get("buttons", []),
            profiles=profiles,
            active_profile_name=conf.get("active_profile_name", profiles[0]["name"]),
            note_templates=conf.get("note_templates", []),
        )

        print("Loaded config:")
        print(config)
        return config

    def reset(self):
        conf = asdict(self.from_conf())
        buttons = [ButtonConfig(**button) for button in conf.pop("buttons")]
        profiles = [ProfileConfig(**profile) for profile in conf.pop("profiles")]
        note_templates = [
            NoteTypeTemplate(**note_template)
            for note_template in conf.pop("note_templates")
        ]
        self.update(
            **conf, buttons=buttons, profiles=profiles, note_templates=note_templates
        )

    def save_to_conf(self):
        conf = mw.addonManager.getConfig("ankisquared") or {}
        config_dict = asdict(self)
        conf.update(config_dict)
        mw.addonManager.writeConfig("ankisquared", conf)

    def update(self, **fields):
        for key, value in fields.items():
            setattr(self, key, value)

        self.save_to_conf()

    def get_active_profile(self):
        return next(
            (p for p in self.profiles if p.name == self.active_profile_name),
            self.profiles[0],
        )

    def set_active_profile(self, profile: ProfileConfig):
        self.active_profile_name = profile.name
        self.save_to_conf()

    def __repr__(self) -> str:
        buttons_str = ",\n".join(
            f"        {button!r}".replace("\n", "\n        ") for button in self.buttons
        )
        profiles_str = ",\n".join(
            f"        {profile!r}".replace("\n", "\n        ")
            for profile in self.profiles
        )
        templates_str = ",\n".join(
            f"        {template!r}".replace("\n", "\n        ")
            for template in self.note_templates
        )

        return (
            f"Config(\n"
            f"    forvo_api_key='***',\n"
            f"    bing_api_key='***',\n"
            f"    openai_api_key='***',\n"
            f"    buttons=[\n"
            f"{buttons_str}\n"
            f"    ],\n"
            f"    profiles=[\n"
            f"{profiles_str}\n"
            f"    ],\n"
            f"    active_profile_name='{self.active_profile_name}',\n"
            f"    note_templates=[\n"
            f"{templates_str}\n"
            f"    ]\n"
            f")"
        )
