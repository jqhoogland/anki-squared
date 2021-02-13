import json, logging

from flask import  request, make_response, Blueprint

from models import Note, db


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
