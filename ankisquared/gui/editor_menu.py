
import html
import os
import sys
from dataclasses import asdict

import anki
from anki.notes import Note
from aqt import gui_hooks, mw
from aqt.editor import Editor
from aqt.qt import *
from aqt.utils import showWarning
from bs4 import BeautifulSoup

from ankisquared.config import Config
from ankisquared.consts import ICONS_PATH
from ankisquared.gui.config_dialog import generate_config_dialog
from ankisquared.recs import images, pronunciations, sentences

# from ankisquared.recs.images import get_images
# from ankisquared.recs.pronunciations import get_pronunciations
# from ankisquared.recs.sentences import get_sentence

NUM_IMAGES = 3

def get_icon_path(icon_name: str) -> str:
    return str(ICONS_PATH/icon_name)


def get_word(editor: Editor) -> str:
    return editor.note.fields[0]


def is_valid_field(editor: Editor) -> bool:
    if editor.currentField is not None and editor.currentField != 0:
        return True
    else:
        showWarning("Please focus on a field first!")
        return False


def add_images(editor: Editor, urls: list[str]):
    if urls:
        urls = urls[:max(NUM_IMAGES, len(urls))]
        links = []

        for url in urls:
            fname = editor._retrieveURL(url)    
            links.append(f"<img src=\"{html.escape(fname, quote=False)}\" />")

        editor.note.fields[editor.currentField] = "<br />".join(links)
        editor.loadNote()
    else:
        showWarning("No images found!")        


def add_pronunciation(editor: Editor, url: str):
    if url:
        fname = editor._retrieveURL(url)
        link = f"[sound:{html.escape(fname, quote=False)}]"
        editor.note.fields[editor.currentField] = link
        editor.loadNote()
    else:
        showWarning("No pronunciations found!")


def add_sentences(editor: Editor, sentence: str):
    if sentence:
        editor.note.fields[editor.currentField] = sentence
        editor.loadNote()
    else:
        showWarning("No sentences found!")


def clean(s: str) -> str:
    return BeautifulSoup(s, "html.parser").get_text()


def did_load_editor(buttons: list, editor: Editor): 
    editor.config = Config.from_conf()

    def unified_action(editor: Editor, action_config):
        # Extract action details from the action_config
        endpoint = action_config.endpoint
        prompt_raw = action_config.prompt

        field_names = [field['name'] for field in editor.note.model()['flds']]
        field_values = [clean(f) for f in editor.note.fields]
        fields_dict = dict(zip(field_names, field_values))

        query = prompt_raw.format(*field_values, **fields_dict)
        config = asdict(editor.config) | asdict(action_config)

        if is_valid_field(editor) and query:
            if endpoint == "Bing":
                results = images.get_images(query, **config)
                add_images(editor, results)
            elif endpoint == "Forvo":
                results = pronunciations.get_pronunciations(query, **config)
                result = results[0] if results else None
                add_pronunciation(editor, result)
            elif endpoint == "OpenAI":
                # Assuming you have a function to handle this
                results = sentences.get_sentence(query, **config) 
                add_sentences(editor, results)
            else:
                showWarning(f"Unknown endpoint: {endpoint}")
                return
        elif not query:
            showWarning(f"Invalid query {query}!")
        elif not is_valid_field(editor):
            return

    def add_button(button_config, editor):
        return editor.addButton(
            icon=get_icon_path(button_config.icon),
            cmd=button_config.cmd,
            func=lambda s=editor: unified_action(s, button_config),
            tip=button_config.tip,
            keys=button_config.keys,
            id=f"{button_config.name}_button" 
        )

    for btn_config in editor.config.buttons:
        btn = add_button(btn_config, editor)
        buttons.append(btn)

    # Settings...
    suggestions_settings_btn = editor.addButton(
        icon=get_icon_path("settings.png"),
        cmd="openSettings",
        func=lambda s=editor: generate_config_dialog(s.config),
        tip="Open suggestion settings",
        keys="Ctrl+Shift+S",
        id="suggestions_dropdown_button"
    )
    buttons.append(suggestions_settings_btn)
