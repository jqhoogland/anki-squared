import anki
from aqt import gui_hooks, mw
from aqt.qt import *

from ankisquared.recs import images, pronunciations, sentences

recommendations_enabled = {
    "images": False,
    "pronunciations": False,
    "sentences": False
}

def toggle_images():
    recommendations_enabled["images"] = not recommendations_enabled["images"]

def toggle_pronunciations():
    recommendations_enabled["pronunciations"] = not recommendations_enabled["pronunciations"]

def toggle_sentences():
    recommendations_enabled["sentences"] = not recommendations_enabled["sentences"]

def did_load_editor(buttons: list, editor):
    img_btn = editor.addButton(icon=None, cmd="toggleImages", tip="Toggle Image Recommendations", func=toggle_images)
    pron_btn = editor.addButton(icon=None, cmd="togglePronunciations", tip="Toggle Pronunciation Recommendations", func=toggle_pronunciations)
    sent_btn = editor.addButton(icon=None, cmd="toggleSentences", tip="Toggle Sentence Recommendations", func=toggle_sentences)

    buttons.append(img_btn)
    buttons.append(pron_btn)
    buttons.append(sent_btn)

gui_hooks.editor_did_init_buttons.append(did_load_editor)

def did_change_front(changed: bool, note: anki.notes.Note, current_field_idx: int) -> bool:
    if current_field_idx == 0:
        query = note.fields[current_field_idx]
        
        if recommendations_enabled["images"]:
            images = images.get_images(query)
            # TODO: Display these images or add them to appropriate fields
        
        if recommendations_enabled["pronunciations"]:
            pronunciations = pronunciations.get_pronunciations(query)
            # TODO: Display these pronunciations or add them to appropriate fields
        
        if recommendations_enabled["sentences"]:
            sentences = sentences.get_sentences(query)
            # TODO: Display these sentences or add them to appropriate fields
        
        return True

# gui_hooks.editor_did_unfocus_field.append(did_change_front)
