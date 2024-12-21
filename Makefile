.PHONY: run clean zip install

# Anki executable paths for different operating systems
ifeq ($(OS),Windows_NT)
	ANKI_PATH = "C:\Program Files\Anki\anki.exe"
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		ANKI_PATH = anki
	endif
	ifeq ($(UNAME_S),Darwin)
		ANKI_PATH = /Applications/Anki.app/Contents/MacOS/anki
	endif
endif

# Directory containing the addon
ADDON_NAME = ankisquared
VERSION = $(shell python -c "import tomli; print(tomli.load(open('pyproject.toml', 'rb'))['project']['version'])")

# Run Anki with development profile
run:
	$(ANKI_PATH) -p dev

# Clean up Python cache files and build artifacts
clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} +
	find . -type d -name "*.egg" -exec rm -r {} +
	find . -type d -name ".pytest_cache" -exec rm -r {} +
	find . -type d -name "build" -exec rm -r {} +
	find . -type d -name "dist" -exec rm -r {} +

# Create distribution zip file
zip: clean
	rm -f $(ADDON_NAME)-$(VERSION).ankiaddon
	zip -r $(ADDON_NAME)-$(VERSION).ankiaddon \
		$(ADDON_NAME)/ \
		icons/ \
		LICENSE \
		README.md \
		requirements.txt \
		-x "**/__pycache__/*" \
		-x "**/.DS_Store" \
		-x "**/meta.json" \
		-x "**/*.pyc" \
		-x "**/*.pyo" \
		-x "**/*.pyd"

# Install dependencies
install:
	pip install -r requirements.txt

# Show help
help:
	@echo "Available commands:"
	@echo "  make run      - Run Anki with development profile"
	@echo "  make clean    - Clean up Python cache and build files"
	@echo "  make zip      - Create .ankiaddon distribution file"
	@echo "  make install  - Install Python dependencies"