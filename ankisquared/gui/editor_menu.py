from dataclasses import asdict
from typing import List

from aqt.editor import Editor
from aqt.utils import showWarning
from aqt.qt import QInputDialog

from ankisquared.config import ButtonConfig, Config
from ankisquared.consts import ICONS_PATH
from ankisquared.gui.config_dialog import generate_config_dialog
from ankisquared.gui.utils import (
    get_icon_path,
    is_valid_field,
    clean_html,
    render_button_as_text,
    retrieve_and_escape_url,
)
from ankisquared.api import bing, forvo, openai
from ankisquared.api.utils import Suggestion


def update_field(editor: Editor, suggestion: Suggestion, current_field: int):
    """Update the current field with new content and refresh the note.

    Args:
        editor: Anki editor instance
        suggestion: Content suggestion to add
    """
    content = suggestion.to_anki(
        url_retriever=lambda x: retrieve_and_escape_url(editor, x)
    )

    if not content:
        showWarning("No content found!")
        return

    editor.note.fields[current_field] = content
    editor.loadNote()


def did_load_editor(buttons: list, editor: Editor):
    """Initialize editor buttons and actions when editor loads.

    Args:
        buttons: List to store button references
        editor: Anki editor instance
    """
    editor.config = Config.from_conf()

    def unified_action(editor: Editor, action_config: ButtonConfig):
        """Unified handler for all button actions.

        Args:
            editor: Anki editor instance
            action_config: Button configuration
        """

        if not is_valid_field(editor):
            return

        current_field = editor.currentField

        endpoint = action_config.endpoint
        prompt_raw = action_config.prompt

        field_names = [field["name"] for field in editor.note.model()["flds"]]
        field_values = [clean_html(f) for f in editor.note.fields]
        fields_dict = dict(zip(field_names, field_values))

        query = prompt_raw.format(*field_values, **fields_dict)

        dialog = QInputDialog(editor.parentWindow)
        dialog.setWindowTitle(action_config.name)
        dialog.setLabelText(
            f"{render_button_as_text(action_config, editor.config)}\n\nEnter your query:"
        )
        dialog.setTextValue(query)
        dialog.setMinimumWidth(600)
        dialog.setMinimumHeight(300)
        dialog.resize(600, 300)  # Set initial size
        dialog.setFixedSize(600, 300)  # Force the size

        ok = dialog.exec()
        query = dialog.textValue()

        if not ok or not query:
            return
        
        config = asdict(editor.config)
        active_profile = config.pop("profiles")[0] # TODO
        button_config =  asdict(action_config)
        config = config | active_profile | button_config

        if query:
            if endpoint == "Bing":
                suggestion = bing.get_images(query, **config)
            elif endpoint == "Forvo":
                suggestion = forvo.get_pronunciations(query, **config)
            elif endpoint == "OpenAI":
                suggestion = openai.get_completion(query, **config)
            else:
                showWarning(f"Unknown endpoint: {endpoint}")
                return

            print(f"Updating {current_field} with {suggestion}")
            update_field(editor, suggestion, current_field)
        elif not query:
            showWarning(f"Invalid query {query}!")

    def add_button(button_config, editor):
        """Add a button to the editor toolbar.

        Args:
            button_config: Button configuration
            editor: Anki editor instance

        Returns:
            Button instance
        """

        icon = get_icon_path(button_config.icon) if button_config.icon else None
        label = button_config.label

        if not icon and not label:
            label = f"Suggest {button_config.name}"

        return editor.addButton(
            icon=icon,
            label=label,
            func=lambda s=editor: unified_action(s, button_config),
            cmd=button_config.cmd,
            tip=button_config.tip,
            keys=button_config.keys,
            id=f"{button_config.name}_button",
        )

    # Add settings button
    buttons.append(
        editor.addButton(
            icon=None,  # get_icon_path("settings.png"),
            label="Suggestions...",
            cmd="openSettings",
            func=lambda s=editor: generate_config_dialog(s.config),
            tip="Open suggestion settings",
            keys="Ctrl+Shift+S",
            id="suggestions_dropdown_button",
        )
    )

    # Add configured buttons

    for btn_config in editor.config.buttons:
        buttons.append(add_button(btn_config, editor))
