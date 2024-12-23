import os
from dataclasses import asdict

from ankisquared.gui.profilechooser import ProfileChooser
from aqt.editor import Editor
from aqt.utils import showWarning
from aqt.qt import (
    QInputDialog,
    QWidget,
    QShortcut,
    QKeySequence,
)

from ankisquared.config import ButtonConfig, Config, Endpoint
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

    if current_field == len(editor.note.fields):
        tags = [t.strip() for t in content.split()]
        editor.note.tags.extend(tags)
    else:
        editor.note.fields[current_field] = content

    editor.loadNote()


def bulk_complete_note(editor: Editor, check=False):
    """Complete all configured fields for the current note."""
    if not editor.note:
        showWarning("No note selected!")
        return

    note_type_id = editor.note.mid
    selected_profile = editor.profile_chooser.selected_profile

    # Find template for current note type
    template = next(
        (t for t in editor.config.note_templates if t.note_type_id == note_type_id),
        None,
    )

    if not template:
        showWarning("No template configured for this note type!")
        return

    # Store original field to restore focus
    original_field = editor.currentField

    # TODO: Do this async
    for field_name, completion in template.field_completions.items():
        if not completion.enabled or completion.endpoint == Endpoint.OPENAI:
            continue

        flds = editor.note.note_type()["flds"]
        field_idx = next(f for f in flds if f["name"] == field_name)["ord"]

        if not field_idx:
            showWarning(f"Could not update {field_name}")
            break

        editor.currentField = field_idx

        # Reuse existing unified_action logic
        unified_action(
            editor,
            ButtonConfig(
                name=f"Auto {field_name}",
                icon="",
                tip="",
                endpoint=completion.endpoint,
                prompt=completion.prompt,
            ),
            check=check,
        )

    # OpenAI queries
    openai_flds = [
        fn
        for fn, c in template.field_completions.items()
        if c.enabled and c.endpoint == Endpoint.OPENAI
    ]
    # Merge config fields for the endpoint call
    config_dict = asdict(editor.config)
    config_dict.pop("profiles", None)  # Remove profiles list

    # Convert the chosen profile to dict
    profile_dict = asdict(selected_profile)

    # Merge configurations
    merged = {**config_dict, **profile_dict}

    if openai_flds:
        # Build queries dictionary
        queries = {}
        for field_name in openai_flds:
            completion = template.field_completions[field_name]
            field_names = [field["name"] for field in editor.note.note_type()["flds"]]
            field_values = [clean_html(f) for f in editor.note.fields]
            fields_dict = dict(zip(field_names, field_values))

            # Format the prompt with field values
            query = completion.prompt.format(*field_values, **fields_dict, **merged)
            queries[field_name] = query

        # Get completions for all fields at once
        if os.environ.get("DEBUG", "0") == "1":
            suggestions = {
                field: Suggestion(type="text", content=f"[Debug OpenAI] {query}")
                for field, query in queries.items()
            }
        else:
            suggestions = openai.get_completions(queries=queries, **merged)

        # Update each field with its completion
        for field_name, suggestion in suggestions.items():
            if field_name == "Tags":
                field_idx = len(editor.note.fields)
            else:
                flds = editor.note.note_type()["flds"]
                field_idx = next(f for f in flds if f["name"] == field_name)["ord"]

                if not field_idx:
                    showWarning(f"Could not update {field_name}")
                    continue

            update_field(editor, suggestion, field_idx)

    # Restore original field focus
    editor.currentField = original_field


def unified_action(editor: Editor, action_config: ButtonConfig, check=False):
    if not is_valid_field(editor):
        return

    selected_profile = editor.profile_chooser.selected_profile

    current_field = editor.currentField
    endpoint = action_config.endpoint
    prompt_raw = action_config.prompt

    field_names = [field["name"] for field in editor.note.note_type()["flds"]]
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

    if check:
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

    if os.environ.get("DEBUG", "0") == "1":
        suggestion = Suggestion(type="text", content=f"[Debug {endpoint}] {query}")
    elif endpoint == "Bing":
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

    def add_button(button_config, editor):
        icon = get_icon_path(button_config.icon) if button_config.icon else None
        label = button_config.label

        if not icon and not label:
            label = f"Suggest {button_config.name}"

        keys = button_config.keys.split(",")

        button = editor.addButton(
            icon=icon,
            label=label,
            func=lambda s=editor: unified_action(s, button_config, check=True),
            cmd=button_config.cmd,
            tip=button_config.tip,
            keys=keys[0],
            id=f"{button_config.name}_button",
        )

        if len(keys) > 1:
            for key in keys[1:]:
                fast_shortcut = QShortcut(QKeySequence(key), editor.widget)
                fast_shortcut.activated.connect(
                    lambda: unified_action(editor, button_config, check=False)
                )

        return button

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

    # Add to existing function
    shortcut = QShortcut(QKeySequence("Ctrl+Shift+G"), editor.widget)
    shortcut.activated.connect(lambda: bulk_complete_note(editor, check=False))

    shortcut = QShortcut(QKeySequence("Ctrl+G"), editor.widget)
    shortcut.activated.connect(lambda: bulk_complete_note(editor, check=True))
