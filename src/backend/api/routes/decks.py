import json, logging

from flask import  request, make_response, Blueprint

from models import Note, db
from services.anki import invoke

api_decks = Blueprint(__name__, "decks", url_prefix="/api/decks")

@api_decks.route('/', methods=['GET'])
def get_decks():
    return invoke("deckNames")

