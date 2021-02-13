import os

CODE_TO_LANGUAGE = {
  'it': "italian",
  'en': "english",
  'fr': "french",
  'nl': "dutch",
  # TODO: etc.
}

def get_language_code():
    return os.environ.get('LANGUAGE', 'en')

def get_language():
    return CODE_TO_LANGUAGE[get_language_code()]
