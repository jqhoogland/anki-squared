from dataclasses import asdict
from typing import List

from aqt.editor import Editor
from aqt.utils import showWarning

from ankisquared.config import Config
from ankisquared.consts import ICONS_PATH
from ankisquared.gui.config_dialog import generate_config_dialog
from ankisquared.gui.utils import get_icon_path, is_valid_field, clean_html, retrieve_and_escape_url
from ankisquared.api import bing, forvo, openai
from ankisquared.api.utils import Suggestion

def update_field(editor: Editor, suggestion: Suggestion):
    """Update the current field with new content and refresh the note.
    
    Args:
        editor: Anki editor instance
        suggestion: Content suggestion to add
    """
    content = suggestion.to_anki(url_retriever=lambda x: retrieve_and_escape_url(editor, x))

    if not content:
        showWarning("No content found!")
        return

    editor.note.fields[editor.currentField] = content
    editor.loadNote()

def did_load_editor(buttons: list, editor: Editor):
    """Initialize editor buttons and actions when editor loads.
    
    Args:
        buttons: List to store button references
        editor: Anki editor instance
    """
    editor.config = Config.from_conf()

    def unified_action(editor: Editor, action_config):
        """Unified handler for all button actions.
        
        Args:
            editor: Anki editor instance
            action_config: Button configuration
        """
        endpoint = action_config.endpoint
        prompt_raw = action_config.prompt

        field_names = [field["name"] for field in editor.note.model()["flds"]]
        field_values = [clean_html(f) for f in editor.note.fields]
        fields_dict = dict(zip(field_names, field_values))

        query = prompt_raw.format(*field_values, **fields_dict)
        config = asdict(editor.config) | asdict(action_config)

        if is_valid_field(editor) and query:
            if endpoint == "Bing":
                suggestion = bing.get_images(query, **config)
            elif endpoint == "Forvo":
                suggestion = forvo.get_pronunciations(query, **config)
            elif endpoint == "OpenAI":
                suggestion = openai.get_completion(query, **config)
            else:
                showWarning(f"Unknown endpoint: {endpoint}")
                return

            update_field(editor, suggestion)
        elif not query:
            showWarning(f"Invalid query {query}!")
        elif not is_valid_field(editor):
            return

    def add_button(button_config, editor):
        """Add a button to the editor toolbar.
        
        Args:
            button_config: Button configuration
            editor: Anki editor instance
            
        Returns:
            Button instance
        """
        return editor.addButton(
            icon=get_icon_path(ICONS_PATH, button_config.icon),
            cmd=button_config.cmd,
            func=lambda s=editor: unified_action(s, button_config),
            tip=button_config.tip,
            keys=button_config.keys,
            id=f"{button_config.name}_button",
        )

    # Add configured buttons
    for btn_config in editor.config.buttons:
        btn = add_button(btn_config, editor)
        buttons.append(btn)

    # Add settings button
    settings_btn = editor.addButton(
        icon=get_icon_path(ICONS_PATH, "settings.png"),
        cmd="openSettings",
        func=lambda s=editor: generate_config_dialog(s.config),
        tip="Open suggestion settings",
        keys="Ctrl+Shift+S",
        id="suggestions_dropdown_button",
    )
    buttons.append(settings_btn)
