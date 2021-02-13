import os

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from config import Config

# create and configure the app
app = Flask(__name__, instance_relative_config=True)
app.config.from_object(Config)

# Enable CORS because this is an API
CORS(app, resources={r"/api/*": {"origins": "*"}})

db = SQLAlchemy(app)
migrate = Migrate(app, db)

@app.shell_context_processor
def make_shell_context():
    from models import Note
    return {'db': db, 'Note': Note}

from . import routes, models
