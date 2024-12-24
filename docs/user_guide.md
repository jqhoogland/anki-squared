# Anki² User Guide

Welcome to Anki²! This guide will help you make the most of the new features available in the add-on, including dynamic button management, user profiles, and NoteTypeTemplates.

## Dynamic Button Management

Anki² introduces new buttons to the Editor toolbar. The default buttons are:

- **Bing Images**: Search for images related to the current field.
- **Forvo Pronunciations**: Get native speaker pronunciations for the current field.
- **Generate Examples with ChatGPT**: Generate examples for the current field.
- **Generate Definitions with ChatGPT**: Generate definitions for the current field.
- **Generate IPA transcription with ChatGPT**: Generate IPA transcription for the current field.

Use the hotkeys `Ctrl+1`, ... `Ctrl+5` to trigger these buttons. This will generate a dialog with the current field content and the button name and prompt you for confirmation before generating content. Using the hotkeys `Ctrl+Shift+1`, ... `Ctrl+Shift+5` will bypass the dialog and generate content without confirmation.

### Editing Buttons

You can change the action, icon, label, hotkey, and prompt for each button:

1. Open Anki and open the editor.
2. Select "Suggestions..." from the editor menu.
3. Go to the "Buttons" tab.
4. Fill in the details like name, icon, and action.
5. Save your changes to see the new button in your toolbar.

### Creating/Removing/Duplicating Buttons

- **Create**: Click the "+" button from the Buttons tab menu to add a new button.
- **Remove**: Select the button you want to remove and click "Remove" at the bottom of the dialog.
- **Duplicate**: Select the button you want to copy and click "Duplicate." You can then modify the new button as needed.

## User Profiles

User profiles let you tailor Anki² to different learning contexts, such as learning multiple languages or subjects. Each profile has its own system prompt, language, and API settings. 

You can switch between profiles by clicking the profile button from the editor toolbar.

### Why Use Profiles?

- **Language Learning**: Set up profiles for each language you're studying. Customize settings like API endpoints and prompts for each language.
- **Subject-Specific Learning**: Create profiles for different subjects to ensure the content is relevant and focused.

### How to Manage Profiles

1. Open the settings dialog from the Anki² menu.
2. Go to the "Profiles" tab.
3. Click the "+" button to add a new profile.
4. Customize the profile with settings like language and prompts.
5. Save your changes to switch between profiles easily.

## Note-type Templates

Note-type Templates help you generate content for all fields of a note at once, making it easier to create comprehensive flashcards.

### How to Use Note-type Templates

1. Open the settings dialog.
2. Navigate to the "Note Templates" tab.
3. Add a new template for your note type.
4. Define how each field should be completed.
5. Save your template to use it when creating notes.

### Examples

#### Question-answering

```json
{
    "note_type_id": 1234567890,
    "shared_prompt": "Front: {Front}",
    "field_completions": {
        "Front": {
            "enabled": false,
            "endpoint": "OpenAI",
            "prompt": "{0}"
        },
        "Back": {
            "enabled": true,
            "endpoint": "OpenAI",
            "prompt": "?"
        },
        "Tags": {
            "enabled": false,
            "endpoint": "OpenAI",
            "prompt": "{0}"
        }
    },
}
```

#### Chinese Vocabulary
(First make an appropriate note-type for your vocabulary.)

```json
{
    "note_type_id": 1234567890,
    "shared_prompt": "Word: {Pinyin} / {Spelling}",
    "field_completions": {
        "Pinyin": {
            "enabled": true,
            "endpoint": "OpenAI",
            "prompt": "Pinyin "
        },
        "Spelling": {
            "enabled": true,
            "endpoint": "OpenAI",
            "prompt": "Spelling"
        },
        "Definition": {
            "enabled": true,
            "endpoint": "OpenAI",
            "prompt": "Definition"
        },
        "IPA": {
            "enabled": true,
            "endpoint": "OpenAI",
            "prompt": "IPA transliteration"
        },
        "Image": {
            "enabled": true,
            "endpoint": "Bing",
            "prompt": "{0}"
        },
        "Recording": {
            "enabled": true,
            "endpoint": "Forvo",
            "prompt": "{0}"
        },
        "Tags": {
            "enabled": false,
            "endpoint": "OpenAI",
            "prompt": "{0}"
        }
    }
}
```

## Templating Strings

Templating strings allow you to customize prompts with placeholders that are replaced with actual values when you use them, such as: 

- `{Front}`, `{Back}`, ...: Inserts the content of a specific field.
- `{language}`: Inserts the language from your active profile.
