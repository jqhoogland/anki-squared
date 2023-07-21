import openai
from aqt import mw


def get_sentences(query: str) -> str:
    # Load the configuration values from the add-on manager
    config = mw.addonManager.getConfig("ankisquared")
    openai_api_key = config['openai_api_key']
    model = config['model']  # Model name, like "davinci", "curie", etc.

    # Set up OpenAI API key
    openai.api_key = openai_api_key

    # Use the OpenAI library to call the desired model and get a completion
    try:
        response = openai.Completion.create(
            engine=model,
            prompt=f"Write an example sentence using the word {query}.",
            max_tokens=50
        )
        choices = response.choices
        if choices:
            return choices[0].text.strip()
    except Exception as e:
        print(f"Error with OpenAI API: {e}")
        return ""

    return ""
