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
