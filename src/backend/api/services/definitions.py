from wiktionaryparser import WiktionaryParser

from .languages import get_language

def get_wiktionary_definitions(query):
    """
    :returns definitions: List of the kind

    e.g.
    [
          {
            "partOfSpeech": "noun",
            "text": [
              "affari m",
              "plural of affare"
            ],
            "relatedWords": [],
            "examples": []
          }
    ]


    """
    language = get_language()

    parser = WiktionaryParser()
    parser.set_default_language(language)

    definition = ""
    definitions_raw = parser.fetch(query, language)

    # TODO: account for different languages possibly returning different shapes
    # TODO: collect all definitions together and use not only the first one
    definitions = definitions_raw[0]

    if definitions["definitions"]:
        definitions = definitions["definitions"]

    # TODO: collect all definitions together and use not only the first one
    definitions = definitions[0]

    print(definitions)

    if definitions["text"]:
        text = definitions["text"]
        if type(text) == str:
            definition = text
        elif type(text) == list:
            definition = '\n'.join(text)

    print(definition)

    return definition
