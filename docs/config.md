# Configuration Module Documentation

## Overview

The Config module handles user settings and configuration management.

## Components

### Configuration Classes
```python
@dataclass
class ButtonConfig:
    name: str
    icon: str
    cmd: str
    tip: str
    endpoint: str
    prompt: str
    keys: str

@dataclass
class Config:
    language: str
    difficulty: str
    buttons: List[ButtonConfig]
    # API keys and other settings...
```

### Configuration Flow
1. Load default config from template
2. Merge with user config
3. Validate settings
4. Apply to editor instance

## User Settings

### Supported Options
- Language selection
- Difficulty levels
- API keys
- Button configurations
- Generation parameters

### Storage
- Config stored in `config.json`
- Template in `config-template.json`
- User settings in Anki config

## Development Notes

### Adding New Settings
1. Update config dataclasses
2. Add to config template
3. Update config dialog
4. Add validation logic 