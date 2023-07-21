import anki
from anki.notes import Note
from aqt import gui_hooks, mw
from aqt.editor import Editor
from aqt.qt import *
from aqt.utils import showWarning

from ankisquared.consts import ICONS_PATH
from ankisquared.recs import images, pronunciations, sentences


def get_icon_path(icon_name: str, active: bool) -> str:
    variant = "on" if active else "off"
    return str(ICONS_PATH/variant/icon_name)


def gen_images(editor: Editor):
    pass


def gen_pronunciations(editor: Editor):
    pass


def gen_sentences(editor: Editor):
    word = editor.note.fields[0]

    if editor.currentField is not None and editor.currentField != 0:
        editor.note.fields[editor.currentField] = sentences.get_sentence(word) 
        editor.loadNote()
    else:
        showWarning("Please focus on a field first!")
        

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


gui_hooks.editor_did_init_buttons.append(did_load_editor)   

def did_change_front(changed: bool, note: Note, current_field_idx: int) -> bool:
    if current_field_idx == 0:
        query = note.fields[current_field_idx]
        
        if recommendations_enabled["images"]:
            images = ["data:image/jpeg;base64,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"] #images.get_images(query)
            # TODO: Display these images or add them to appropriate fields
        
        if recommendations_enabled["pronunciations"]:
            pronunciations = ["https:\/\/apifree.forvo.com\/audio\/1i2m3e3l2k2h2e2a3f382m2b28382l2p293a1m272h2e1f211g1o2m2i1h3p2q283m2h1n392n39212i3l393k3b2j3q2c2a2q3h25331l1b373o2o3d262n2m2n223g_332538283f3f3m2i223h3b3b2o3e2l2h281n33213j371t1t"]#pronunciations.get_pronunciations(query)
            # TODO: Display these pronunciations or add them to appropriate fields
        
        if recommendations_enabled["sentences"]:
            sentences = ["hello world"] #sentences.get_sentences(query)
            # TODO: Display these sentences or add them to appropriate fields
        
        return True

# gui_hooks.editor_did_unfocus_field.append(did_change_front)

# def load_custom_css():
#     style = """
#     /* Your custom CSS here */
#     .active {
#         background-color: #e0e0e0; /* Example gray color for the active state */
#     }
#     """
#     mw.setStyleSheet(style)

# mw.addonManager.setWebExports(__name__, r".*\.css")
# mw.addonManager.setWebExports(__name__, r".*\.js")

# mw.addonManager.addMenuItem(load_custom_css, 'Apply Custom CSS')