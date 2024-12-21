# Anki² Technical Documentation

## Overview

Anki² is an Anki add-on that enhances card creation by integrating AI and external APIs to provide rich content for flashcards.

## Project Structure

```
ankisquared/
├── api/              # External API integrations
│   ├── bing.py      # Bing Image Search
│   ├── forvo.py     # Pronunciation audio
│   ├── openai.py    # AI text generation
│   └── utils.py     # Common utilities
├── gui/             # User interface components
│   ├── editor_menu.py    # Editor toolbar
│   ├── config_dialog.py  # Settings dialog
│   └── utils.py         # GUI utilities
├── consts.py        # Constants and configurations
├── config.py        # Configuration management
└── __init__.py      # Add-on initialization
```

## Core Components

### 1. API Integration

The API module handles external service integrations:

```python:ankisquared/api/utils.py
@dataclass
class Suggestion:
    type: Literal["image", "sound", "text"]
    urls: Optional[List[str]] = None
    content: Optional[str] = None
```

- **Bing Images**: Image search and retrieval
- **Forvo**: Native speaker pronunciations
- **OpenAI**: AI-powered text generation

### 2. Configuration System

The Config module manages user settings and button configurations:

```python:ankisquared/config.py
@dataclass
class ButtonConfig:
    name: str
    icon: str
    tip: str
    endpoint: Endpoint
    prompt: str = "{0}"
    keys: Optional[str] = None
```

### 3. GUI Components

The GUI module provides:
- Editor toolbar buttons
- Configuration dialog
- Field update handling

## Development

See [README.md](../README.md) for user installation and usage instructions. 
