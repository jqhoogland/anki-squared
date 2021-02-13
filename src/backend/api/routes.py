import json, logging

from flask import escape, request, make_response

from api import app, db
from models import Note
from services import create_note, get_duckduckgo_images, get_forvo_pronunciations, get_wiktionary_definitions

@app.route('/api/images', methods=['POST'])
def get_images():
    word = json.loads(request.get_data())
    res = {"images": get_duckduckgo_images(word)[:10]}
    return res

@app.route('/api/pronunciations/', methods=['POST'])
def get_pronunciations():
    word = json.loads(request.get_data())
    return {"pronunciations": get_forvo_pronunciations(word)}

@app.route('/api/definitions/', methods=['POST'])
def get_definitions():
    word = json.loads(request.get_data())
    return {"definitions": get_wiktionary_definitions(word)}

@app.route('/api/queue/add', methods=['POST'])
def add_new_word_to_queue():
    word_str = json.loads(request.get_data())['word']
    word = Note(word=word_str)
    db.session.add(word)
    db.session.commit()

    return "", 200

@app.route('/api/queue', methods=['POST', 'GET'])
def get_queue():
    return {'queue': [note.to_json() for note in Note.query.all()]}

@app.route('/api/note/<int:note_idx>/edit', methods=['POST'])
def edit_note(note_idx):
    new_note = json.loads(request.get_data())
    Note.query.all()[note_idx].update(**new_note)
    db.session.commit()

    return "", 200


@app.route('/api/note/<int:note_idx>', methods=['GET'])
def get_note(note_idx):
    notes = Note.query.all()

    if note_idx < len(notes):
        return notes[note_idx].to_json()

    return {}


@app.route('/api/upload', methods=['POST'])
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
