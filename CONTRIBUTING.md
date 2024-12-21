# Contributing to Anki²

Thank you for your interest in contributing! This guide will help you get started.

## Quick Start

1. Fork and clone the repository
2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

3. Link to Anki addons folder:
```bash
ln -s /path/to/repo/ankisquared /path/to/Anki2/addons21/ankisquared
```

## Development

### Hot Reload Setup

1. Install the "Reload addon" add-on in Anki:
   - Tools → Add-ons → Get Add-ons...
   - Enter code: `613411786`
   - Restart Anki

2. Hot Reload Workflow:
   - Make code changes
   - In Anki: Tools → Reload addon → Select "Anki²"
   - Or use the default shortcut `Ctrl+R`
   - Check debug console for errors

Note: Some changes may still require a full Anki restart, particularly those involving:
- Hook registration
- Module initialization
- Main window modifications

### Project Structure
```
ankisquared/
├── api/          # External service integrations
├── gui/          # Anki editor interface
├── docs/         # Technical documentation
└── tests/        # Test suite
```

See [Technical Documentation](docs/index.md) for detailed architecture overview.

### Debug Console Access

**Windows**: Use `anki-console.bat` in Anki installation folder
**macOS**: Run `/Applications/Anki.app/Contents/MacOS/anki`
**Linux**: Run `anki` from terminal

### Debugging Tips
```python
from aqt.utils import showInfo
showInfo("Debug message")
```

## Pull Request Process

1. Create feature branch
2. Update documentation
3. Add/update tests
4. Submit PR with clear description

## Resources

- [Technical Documentation](docs/index.md)
- [Anki Add-on Docs](https://addon-docs.ankiweb.net/)

## Getting Help

- Open an issue
- Join our [Discord](https://discord.gg/TODO)


