from dataclasses import asdict, dataclass
from pprint import pp
from typing import Annotated, Literal

from aqt import mw

from ankisquared.consts import LANGUAGES, ModelLiteral


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
    model: ModelLiteral
    openai_api_key: str
    max_tokens: int
    temperature: float

    @classmethod
    def from_conf(cls):
        conf = mw.addonManager.getConfig("ankisquared") or {}
        print("Loaded config:")
        pp(conf)
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
        

