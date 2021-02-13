import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'development-key'

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
         "sqlite:///" + os.path.join(basedir, 'api.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False
