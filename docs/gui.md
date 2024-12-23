# GUI Module Documentation

## Overview

The GUI module handles all Anki editor interface components for Anki². It provides toolbar buttons for generating content using various AI services and APIs.

## Architecture

### Editor Menu (`editor_menu.py`)

The main interface component that adds buttons to the Anki editor toolbar:

```python
def did_load_editor(buttons: list, editor: Editor):
    """Initialize editor buttons and actions when editor loads."""
```

Key components:
- Button initialization
- Unified action handler
- Field update logic

### Utils (`utils.py`)

Common utility functions for GUI operations:
- `get_icon_path()`: Icon file path resolution
- `is_valid_field()`: Field validation
- `clean_html()`: HTML cleanup
- `retrieve_and_escape_url()`: URL processing

## Button Actions

Each button follows this flow:
1. Get current field content
2. Format query using configured prompt
3. Call appropriate API endpoint:
   - Bing Images
   - Forvo Pronunciations
   - OpenAI Text Generation
4. Update field with returned content

## Configuration

Settings are managed through a configuration dialog that allows users to:
- Configure API keys
- Set language preferences
- Adjust generation parameters
- Customize button behavior

## Development Notes

Add API endpoint handling in `unified_action()`

### Error Handling

- Field validation via `is_valid_field()`
- API error handling with `showWarning()`
- Content validation before field updates 