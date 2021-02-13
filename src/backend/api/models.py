from datetime import datetime

from api import db
from resources import get_definition, get_pronunciations, save_audio_from_url

pronunciations = db.Table('pronunciations_to_notes_table',
    db.Column('pronunciation_id', db.Integer, db.ForeignKey('pronunciation.id'), primary_key=True),
    db.Column('note_id', db.Integer, db.ForeignKey('note.id'), primary_key=True),
    extend_existing=True
)

class Pronunciation(db.Model):
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    # forvo_id = db.Column(db.Integer, unique=True)
    # word = db.Column(db.String(64), index=True, unique=True) # Maybe make this a one-to-one field
    # add_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    # hits = db.Column(db.Integer, default=0)
    # forvo_user = db.Column(db.Integer, default=0)
    # sex = db.Column(db.Enum("m", "f", "n"), default="n")
    # country = db.Column(db.String(64))
    # code = db.Column(db.String(2))
    # lang_name = db.Column(db.String(64))
    pathmp3 = db.Column(db.String(64))
    # rate = db.Column(db.Integer, default=0)
    # num_votes = db.Column(db.Integer, default=0)
    # num_positive_votes = db.Column(db.Integer, default=0)
    notes = db.relationship('Note', secondary=pronunciations,
                                     back_populates="pronunciations")

    def __init__(self, id, addtime, username, langname, pathmp3, **kwargs):
        """
        """

        if type(addtime) == str:
            addtime = date.fromisoformat(addtime)

        if pathmp3[:5] == "https":
            pathmp3 = save_audio_from_url(pathmp3)

        super(Pronunciation, self).__init__(pathmp3=pathmp3, **kwargs)



class Note(db.Model):
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(64), index=True, unique=True)
    definition = db.Column(db.String(200), default="")
    # image = db.Column(db.String(200), index=True, unique=True)
    pronunciations = db.relationship('Pronunciation', secondary=pronunciations,
        back_populates="notes")
    is_include_recognition = db.Column(db.Boolean(), default=False)
    is_marked = db.Column(db.Boolean(), default=False)
    is_graduated = db.Column(db.Boolean(), default=False)
    word_type = db.Column(db.Enum("none", "noun", "adjective", "verb"), default="none")

    def __init__(self, word, definition="", **kwargs):
        """

        """
        definition = get_definition(word)
        pronunciations_kwargs = get_pronunciations(word)

        for pronunciation_kwargs in pronunciations_kwargs:
            # p = Pronunciation(note=self, **pronunciation_kwargs)
            # db.session.add(p)
            # db.session.commit()
            break

        super().__init__(word=word, definition=definition, **kwargs)

    def __repr__(self):
        return '<Note {}>'.format(self.word)

    def to_json(self):
        return {
            'word': str(self.word),
            'definition': str(self.definition),
            'images': [],
            'pronunciations': [],
            'is_include_recognition': str(self.is_include_recognition),
            'is_marked': str(self.is_marked),
            'is_graduated': str(self.is_graduated),
            'word_type': str(self.word_type),
        }

    def update(self, word, definition, images, pronunciations, is_graduated, is_include_recognition, is_marked, word_type):
        self.word = word
        self.definition = definition
        # self.images = images
        # self.pronunciations = pronunciations
        self.is_graduated = bool(is_graduated)
        self.is_include_recognition = bool(is_include_recognition)
        self.is_marked = bool(is_marked)
        self.word_type = word_type
