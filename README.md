# Anki<sup>2</sup>
Get automatic suggestions while making notes on Anki to square your productivity.

[Anki](https://apps.ankiweb.net/) is the most powerful and configurable spaced repetetition system on the planet. 

Unfortunately, creating notes takes a lot of time. Even if you automate some parts of this process with something like [AnkiConnect](https://ankiweb.net/shared/info/2055492159), you'll spend a lot of time adjusting between different kinds of content. It only gets worse if you want to include multimedia.

We need a new interface for creating notes that pulls suggestions for fields automatically from all over the internet. 

Take an example from language learning:
- Pronunciations automatically loaded in from [Forvo](https://forvo.com/search/),
- Images directly from your favorite search engine's image search,
- Definitions from [WordReference](https://www.wordreference.com/) or [Wiktionary](https://en.wiktionary.org/wiki/Wiktionary:Main_Page),
- Example sentences from [Wikipedia](https://en.wikipedia.org/),
- etc.

---

This is an app bootstrapped according to the [init.tips](https://init.tips) stack, also known as the T3-Stack.


# How to use

You need a `.env` with a `DATABASE_URL` pointing to your anki database, for example, `file:~/Library/Application Support/Anki2/User 1/collection.anki2` on a Mac. (Note: if your path includes spaces, they should NOT be escaped.)