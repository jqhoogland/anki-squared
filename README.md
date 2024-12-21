# Anki²

<!-- TODO: [![PyPI version](https://badge.fury.io/py/ankisquared.svg)](https://badge.fury.io/py/ankisquared) -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- TODO: [![Downloads](https://static.pepy.tech/personalized-badge/ankisquared?period=total&units=international_system&left_color=black&right_color=orange&left_text=Downloads)](https://pepy.tech/project/ankisquared) -->
[![Anki: 2.1.65+](https://img.shields.io/badge/Anki-2.1.65%2B-blue.svg)](https://apps.ankiweb.net)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

> An Anki add-on that enhances card creation by integrating AI and external APIs to provide rich content for your flashcards.

<!-- TODO: ![Demo](docs/assets/demo.gif) -->

- [Anki²](#anki)
  - [Features](#features)
  - [Quick Start](#quick-start)
    - [Installation](#installation)
  - [Usage](#usage)
  - [Configuration](#configuration)
  - [Contributing](#contributing)
  - [License](#license)

## Features

🖼️ **Images**
- Fetch relevant images from Bing Image Search
- Automatically download and embed in cards
- Configurable number of images per card

🗣️ **Pronunciations**
- Get native speaker pronunciations from Forvo
- Support for 40+ languages


🤖 **AI-Powered Content**
- Generate example sentences
- Create concise definitions
- Generate IPA transcriptions
- Adjustable difficulty levels (A1-C2)

## Quick Start

### Installation

**From AnkiWeb:**
1. Open Anki
2. Tools → Add-ons → Get Add-ons...
3. Paste code: `[addon_code]` <!-- TODO: Add actual addon code -->
4. Restart Anki

**From Source:**
```bash
# Clone repository
git clone https://github.com/jqhoogland/ankisquared.git

# Create symbolic link to Anki addons folder
## Linux/MacOS
ln -s /path/to/repo/ankisquared /path/to/Anki2/addons21/ankisquared

## Windows (Run as Administrator)
mklink /D C:\Users\<username>\AppData\Roaming\Anki2\addons21\ankisquared C:\path\to\repo\ankisquared

# Install dependencies
pip install -r requirements.txt
```

## Usage

1. Open Anki and navigate to the card editor
2. Type your word/phrase in the front field
3. Use the toolbar buttons or keyboard shortcuts:
   - `Ctrl+Shift+1`: Add images
   - `Ctrl+Shift+2`: Add pronunciation
   - `Ctrl+Shift+3`: Add example sentences
   - `Ctrl+Shift+4`: Add definition
   - `Ctrl+Shift+5`: Add IPA

## Configuration

1. Tools → Add-ons → Anki² → Config
2. Configure your API keys:
   ```json
   {
     "bing_api_key": "your-bing-api-key",
     "forvo_api_key": "your-forvo-api-key",
     "openai_api_key": "your-openai-api-key"
   }
   ```

## Contributing

- [User Guide](docs/user-guide.md)
- [Configuration](docs/config.md)
- [API Documentation](docs/api.md)
- [Contributing Guide](CONTRIBUTING.md)

## License

MIT License - see [LICENSE](LICENSE) file

---

<p align="center">
  Made with ❤️ for the Anki community
</p>
