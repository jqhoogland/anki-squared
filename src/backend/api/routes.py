import json, logging

from flask import escape, request, make_response, Blueprint

from models import Note, db
from services import create_note, get_duckduckgo_images, get_forvo_pronunciations, get_wiktionary_definitions

api_resources = Blueprint(__name__, 'resources', url_prefix='/api/resources')

@api_resources.route('/images', methods=['POST'])
def get_images():
    word = json.loads(request.get_data())
    res = {"images": get_duckduckgo_images(word)[:10]}
    return res

@api_resources.route('/pronunciations', methods=['POST'])
def get_pronunciations():
    word = json.loads(request.get_data())
    return {"pronunciations": get_forvo_pronunciations(word)}

@api_resources.route('/definitions', methods=['POST'])
def get_definitions():
    word = json.loads(request.get_data())
    return {"definitions": get_wiktionary_definitions(word)}


api_queue = Blueprint(__name__, "queue", url_prefix="/api/queue")

@api_queue.route('/add', methods=['POST'])
def add_new_word_to_queue():
    word_str = json.loads(request.get_data())['word']
    word = Note(word=word_str)
    db.session.add(word)
    db.session.commit()

    return "", 200


@api_queue.route('', methods=['POST', 'GET'])
def get_queue():
    return {'queue': [note.to_json() for note in Note.query.all()]}

api_notes = Blueprint(__name__, "notes", url_prefix="/api/notes")

@api_notes.route('/edit/<int:note_idx>', methods=['POST'])
def edit_note(note_idx):
    new_note = json.loads(request.get_data())
    Note.query.all()[note_idx].update(**new_note)
    db.session.commit()

    return "", 200


@api_notes.route('/<int:note_idx>', methods=['GET'])
def get_note(note_idx):
    notes = Note.query.all()

    if note_idx < len(notes):
        return notes[note_idx].to_json()

    return {}


@api_notes.route('/upload', methods=['POST'])
def upload_note():
    word = json.loads(request.get_data())
    res_code = 500

    word_res = create_note(word)

    logging.log('Created new card: {}'.format(word))

    if word_res[:5] != "Error":
        res_code = 200

    res = make_response({}, res_code)

    # TODO: Flask-CORS
    return res

if __name__ == '__main__':
    app.run(host='0.0.0.0')
