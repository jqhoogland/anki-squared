
import html
import os
import sys

import anki
from anki.notes import Note
from aqt import gui_hooks, mw
from aqt.editor import Editor
from aqt.qt import *
from aqt.utils import showWarning

from ankisquared.config import Config
from ankisquared.consts import ICONS_PATH
from ankisquared.gui.config_dialog import generate_config_dialog
from ankisquared.recs import images, pronunciations, sentences

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


def gen_images(editor: Editor):
    language = getattr(editor, "language", "en")    
    word = get_word(editor)

    if is_valid_field(editor) and word:
        urls = images.get_images(word, editor.config)

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


def gen_pronunciations(editor: Editor):
    language = getattr(editor, "language", "en")
    word = get_word(editor)
    
    if is_valid_field(editor) and word:
        urls = pronunciations.get_pronunciations(word, editor.config)

        if urls:
            url = urls[0]
            fname = editor._retrieveURL(url)
            link = f"[sound:{html.escape(fname, quote=False)}]"
            editor.note.fields[editor.currentField] = link
            editor.loadNote()
        else:
            showWarning("No pronunciations found!")


def gen_sentences(editor: Editor):
    word = get_word(editor)

    if is_valid_field(editor) and word:
        editor.note.fields[editor.currentField] = sentences.get_sentence(word, editor.config) 
        editor.loadNote()
        



def did_load_editor(buttons: list, editor: Editor): 
    editor.config = Config.from_conf()

    def add_button(name, icon, callback, cmd, tip, keys=None):
        return editor.addButton(
            icon=get_icon_path(icon),
            cmd=cmd,
            func=lambda s=editor: callback(s),
            tip=tip,
            keys=keys,
            id=f"{name}_button" 
        )

    # Add buttons for each recommendation type
    img_btn = add_button("images", "image-search.png", cmd="toggleImages", tip="Suggest Images", callback=gen_images, keys="Ctrl+Shift+I")
    pron_btn = add_button("pronunciations", "forvo.png", cmd="togglePronunciations", tip="Suggest Pronunciations", callback=gen_pronunciations, keys="Ctrl+Shift+P")
    sent_btn = add_button("examples", "chatgpt.png", cmd="toggleSentences", tip="Suggest Sentences", callback=gen_sentences, keys="Ctrl+Shift+E")

    buttons.append(img_btn)
    buttons.append(pron_btn)
    buttons.append(sent_btn)

    # Settings
    suggestions_settings_btn = editor.addButton(
        icon=get_icon_path("settings.png"),  # Provide an appropriate icon if you have one
        cmd="openSettings",
        func=lambda s=editor: generate_config_dialog(s.config),
        tip="Open suggestion settings",
        keys="Ctrl+Shift+S",
        id="suggestions_dropdown_button"
    )
    
    buttons.append(suggestions_settings_btn)

