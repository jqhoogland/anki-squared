# Contributing to Anki²

## Development Setup

1. Fork and clone the repository
2. Set up development environment:   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt   ```
3. Link to Anki:   ```bash
   ln -s /path/to/repo/ankisquared /path/to/Anki2/addons21/ankisquared   ```

## Hot Reload Development

1. Make code changes
2. In Anki, use Ctrl+Shift+R to reload add-ons
3. Check the Anki debug console for errors:

### Accessing the Debug Console

**Windows**:
- Launch Anki using `anki-console.bat` located in:
  - `C:\Users\<username>\AppData\Local\Programs\Anki` or
  - `C:\Program Files\Anki`

**macOS**:

```
bash
/Applications/Anki.app/Contents/MacOS/anki
```

**Linux**:

```
bash
anki
```

### Debug Tips
- Use `showInfo()` for debugging:
  ```python
  from aqt.utils import showInfo
  showInfo("Debug message")
  ```
- Check the [Official Anki Add-on Documentation](https://addon-docs.ankiweb.net/) for API references

## Testing

1. Manual testing through Anki interface
2. Verify all API integrations work:
   - Bing Images
   - Forvo Pronunciations
   - OpenAI text generation

## Pull Request Process

1. Update documentation
2. Test all features
3. Submit PR with clear description

