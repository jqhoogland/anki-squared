# Anki<sup>2</sup>
Get automatic suggestions while making notes on Anki to square your productivity.

[Anki](https://apps.ankiweb.net/) remains the most powerful and configurable spaced repetetition system on the planet. 

Unfortunately, creating notes still takes a lot of time. Even if you automate some parts of this process with something like [AnkiConnect](https://ankiweb.net/shared/info/2055492159), you'll spend a lot of time adjusting between different kinds of content. It only gets worse if you want to include multimedia.

We need a new interface for creating notes that pulls suggestions for content automatically from all over the internet. 

Take an example from language learning:
- Pronunciations automatically loaded in from [Forvo](https://forvo.com/search/),
- Images directly from your favorite search engine's image search,
- Definitions from [WordReference](https://www.wordreference.com/) or [Wiktionary](https://en.wiktionary.org/wiki/Wiktionary:Main_Page),
- Example sentences from [Wikipedia](https://en.wikipedia.org/),
- etc.

---

# Plan of attack

1. Mirror of basic note-creating functionality
  - Ability to change note template
  - Ability to fill in text
  - Ability to create new notes
2. Ability to configure a "type" for each field (of text, image, video, audio)
  - "type" is remembered across sessions
  - Ability to create notes with multimedia (i.e., image, video, or audio)
3. Image type can pull from an image search engine
4. Audio can pull from Forvo (given an api key)
5. Text can pull from wiktionary or word reference (or another similar site).
