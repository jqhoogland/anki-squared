"""

Author: Jesse Hoogland

This uses [AnkiConnect](https://ankiweb.net/shared/info/2055492159) to create notes in Anki.

"""
import json
import urllib.request

def request(action, **params):
    return {'action': action, 'params': params, 'version': 6}

def invoke(action, **params):
    request_json = json.dumps(request(action, **params)).encode('utf-8')
    response = json.load(urllib.request.urlopen(urllib.request.Request('http://localhost:8765', request_json)))
    if len(response) != 2:
        raise Exception('response has an unexpected number of fields')
    if 'error' not in response:
        raise Exception('response is missing required error field')
    if 'result' not in response:
        raise Exception('response is missing required result field')
    if response['error'] is not None:
        raise Exception(response['error'])
    return response

def create_note(**note):
    """
    TODO: Connect with AnkiConnect
    """
    return invoke('addNote', note=note)
