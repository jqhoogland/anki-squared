import os

from flask import Flask


def setup_app(app):
    from flask_migrate import Migrate
    from flask_cors import CORS

    from models import db
    from config import Config

    app.config.from_object(Config)
    db.init_app(app)

    migrate = Migrate(app, db)

    # Enable CORS because this is an API
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    @app.route("/")
    def index():
        return "Ciao mondo"


def create_app():
    from routes import api_resources, api_queue, api_notes, api_decks

    app = Flask(__name__)

    setup_app(app)

    app.register_blueprint(api_resources)
    app.register_blueprint(api_queue)
    app.register_blueprint(api_notes)
    app.register_blueprint(api_decks)

    return app
