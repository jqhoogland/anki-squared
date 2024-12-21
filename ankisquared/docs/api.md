# API Module Documentation

## Overview

The API module handles external service integrations for Anki².

## Services

### Bing Images
- Image search and retrieval
- Response processing
- Error handling

### Forvo
- Pronunciation audio retrieval
- Language-specific handling
- Audio processing

### OpenAI
- Text generation
- Prompt handling
- Response processing

## Common Components

### Suggestion Class
The core data structure for all API responses:

```python
@dataclass
class Suggestion:
    type: Literal["image", "sound", "text"]
    urls: Optional[List[str]] = None
    content: Optional[str] = None
```

### Error Handling
- Network error handling
- API rate limiting
- Response validation

## Development Notes

### Adding New API Services

1. Create new service module
2. Implement get_* function
3. Add to unified_action handler
4. Update config template 