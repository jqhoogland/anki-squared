
import html
import os
import sys

import anki
from anki.notes import Note
from aqt import gui_hooks, mw
from aqt.editor import Editor
from aqt.qt import *
from aqt.utils import showWarning

from ankisquared.consts import ICONS_PATH
from ankisquared.recs import images, pronunciations, sentences

NUM_IMAGES = 3

# Add the 'libs' directory to sys.path
libs_path = os.path.join(os.path.dirname(__file__), 'libs')
if libs_path not in sys.path:
    sys.path.insert(0, libs_path)
    
def get_icon_path(icon_name: str, active: bool) -> str:
    variant = "on" if active else "off"
    return str(ICONS_PATH/variant/icon_name)


def get_word(editor: Editor) -> str:
    return editor.note.fields[0]


def is_valid_field(editor: Editor) -> bool:
    if editor.currentField is not None and editor.currentField != 0:
        return True
    else:
        showWarning("Please focus on a field first!")
        return False


def gen_images(editor: Editor):
    word = get_word(editor)    

    if is_valid_field(editor) and word:
        urls = images.get_images(word, NUM_IMAGES)

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
    word = get_word(editor)
    
    if is_valid_field(editor) and word:
        urls = pronunciations.get_pronunciations(word)

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
        editor.note.fields[editor.currentField] = sentences.get_sentence(word) 
        editor.loadNote()
        

def did_load_editor(buttons: list, editor: Editor):
    def add_button(name, icon, callback, cmd, tip):
        return editor.addButton(
            icon=get_icon_path(icon, False),
            cmd=cmd,
            func=lambda s=editor: callback(s),
            tip=tip,
            keys=None,
            id=f"{name}_button"
        )


    # TODO: Change button color or opacity or something when enabled
    img_btn = add_button("images", "image-search.png", cmd="toggleImages", tip="Toggle Image Recommendations", callback=gen_images)
    pron_btn = add_button("pronunciations", "forvo.png", cmd="togglePronunciations", tip="Toggle Pronunciation Recommendations", callback=gen_pronunciations)
    sent_btn = add_button("examples", "chatgpt.png", cmd="toggleSentences", tip="Toggle Sentence Recommendations", callback=gen_sentences)

    buttons.append(img_btn)
    buttons.append(pron_btn)
    buttons.append(sent_btn)

    # img_shortcut = QShortcut(QKeySequence("Ctrl+Shift+L"), editor)
    # img_shortcut.activated.connect(gen_images)

    # pron_shortcut = QShortcut(QKeySequence("Ctrl+Shift+M"), editor)
    # pron_shortcut.activated.connect(gen_pronunciations)

    # sent_shortcut = QShortcut(QKeySequence("Ctrl+Shift+E"), editor)
    # sent_shortcut.activated.connect(gen_sentences)


gui_hooks.editor_did_init_buttons.append(did_load_editor)   

