import json

from flask import request, Blueprint

from models import Note, db


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
