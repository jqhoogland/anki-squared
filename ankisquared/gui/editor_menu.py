from dataclasses import asdict
from typing import List

from ankisquared.gui.profilechooser import ProfileChooser
from aqt.editor import Editor
from aqt.utils import showWarning
from aqt.qt import (
    QInputDialog,
    QToolButton,
    QDialog,
    QVBoxLayout,
    QListWidget,
    QListWidgetItem,
    QLabel,
    QDialog,
    QVBoxLayout,
    QListWidget,
    QListWidgetItem,
    QLabel,
    QHBoxLayout,
    QPushButton,
    QWidget,
    # QSizePolicy
)

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
    """Update the current field with new content and refresh the note."""
    content = suggestion.to_anki(
        url_retriever=lambda x: retrieve_and_escape_url(editor, x)
    )
    if not content:
        showWarning("No content found!")
        return

    editor.note.fields[current_field] = content
    editor.loadNote()


def did_load_editor(buttons: list, editor: Editor):
    """Initialize editor buttons and actions when editor loads."""

    # Load your config
    editor.config = Config.from_conf()
    # Find active profile from config, fallback to first profile if not set

    def on_profile_clicked(profile):
        editor.config.set_active_profile(profile)
        editor.profile_chooser.selected_profile = profile

    topbar = editor.parentWindow.deck_chooser._widget.parent()

    profile_area = QWidget()
    profile_area.setObjectName("profileArea")

    topbar.layout().insertWidget(1, profile_area)
    addcards = topbar.parent()

    addcards.form.profileArea = profile_area
    editor.profile_chooser = ProfileChooser(
        editor.mw,
        editor,
        widget=profile_area,
        on_profile_changed=on_profile_clicked,
        starting_profile=editor.config.get_active_profile(),
    )
    editor.profile_chooser.show()

    def unified_action(editor: Editor, action_config: ButtonConfig):
        if not is_valid_field(editor):
            return

        selected_profile = editor.profile_chooser.selected_profile

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
            f"{render_button_as_text(action_config, selected_profile)}\n\nEnter your query:"
        )
        dialog.setTextValue(query)
        dialog.setMinimumWidth(600)
        dialog.setMinimumHeight(300)
        dialog.resize(600, 300)
        dialog.setFixedSize(600, 300)

        ok = dialog.exec()
        query = dialog.textValue()

        if not ok or not query:
            return

        # Decide which profile to use. If you stored an active profile above, use that.
        # Otherwise fallback to the first one, etc.

        # Merge config fields for the endpoint call
        config_dict = asdict(editor.config)
        # “profiles” is a list, so remove it from top-level if merging
        config_dict.pop("profiles", None)

        # Convert the chosen profile to dict
        profile_dict = asdict(selected_profile)

        button_dict = asdict(action_config)

        # Merge everything
        merged = {**config_dict, **profile_dict, **button_dict}

        if endpoint == "Bing":
            suggestion = bing.get_images(query, **merged)
        elif endpoint == "Forvo":
            suggestion = forvo.get_pronunciations(query, **merged)
        elif endpoint == "OpenAI":
            suggestion = openai.get_completion(query, **merged)
        else:
            showWarning(f"Unknown endpoint: {endpoint}")
            return

        print(f"Updating field={current_field} with suggestion={suggestion}")
        update_field(editor, suggestion, current_field)

    def add_button(button_config, editor):
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

    # 2) Add settings button (will appear where addButton normally places it, typically below).
    buttons.append(
        editor.addButton(
            icon=None,  # or get_icon_path("settings.png")
            label="Suggestions...",
            cmd="openSettings",
            func=lambda s=editor: generate_config_dialog(s.config),
            tip="Open suggestion settings",
            keys="Ctrl+Shift+S",
            id="suggestions_dropdown_button",
        )
    )

    # 3) Add the user-configured suggestion buttons
    for btn_config in editor.config.buttons:
        buttons.append(add_button(btn_config, editor))
