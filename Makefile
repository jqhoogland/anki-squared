# Define variables first
DETECTED_OS := $(shell if [ "$(OS)" = "Windows_NT" ]; then echo "Windows"; else uname -s; fi)
HOME_DIR := $(if $(USERPROFILE),$(USERPROFILE),$(HOME))

ifeq ($(DETECTED_OS),Windows)
ANKI_PATH := "C:\Program Files\Anki\anki.exe"
ANKI_ADDONS_PATH := $(HOME_DIR)/AppData/Roaming/Anki2/addons21/ankisquared
else ifeq ($(DETECTED_OS),Linux)
ANKI_PATH := anki
ANKI_ADDONS_PATH := $(HOME_DIR)/.local/share/Anki2/addons21/ankisquared
else ifeq ($(DETECTED_OS),Darwin)
ANKI_PATH := /Applications/Anki.app/Contents/MacOS/anki
ANKI_ADDONS_PATH := "$(HOME_DIR)/Library/Application\ Support/Anki2/addons21/ankisquared"
endif


# Directory containing the addon
ADDON_NAME = ankisquared
VERSION = $(shell python -c "import tomli; print(tomli.load(open('pyproject.toml', 'rb'))['project']['version'])")

# Run Anki with development profile
run:
	$(ANKI_PATH)

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
	cd $(ADDON_NAME) && zip -r ../$(ADDON_NAME)-$(VERSION).ankiaddon . \
		-x "**/__pycache__/*" \
		-x "**/.DS_Store" \
		-x "meta.json" \
		-x "**/*.pyc" \
		-x "**/*.pyo" \
		-x "**/*.pyd"

# Install dependencies and create symbolic link
install: install-deps install-link

install-deps:
	pip install -r requirements.txt

install-link:
ifeq ($(DETECTED_OS),Windows)
	@powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c mklink /D \"$(ANKI_ADDONS_PATH)\" \"$(CURDIR)/$(ADDON_NAME)\"'"
else
	ln -sf "$(CURDIR)/$(ADDON_NAME)" "$(ANKI_ADDONS_PATH)"
endif

# Show help
help:
	@echo "Available commands:"
	@echo "  make run          - Run Anki with development profile"
	@echo "  make clean        - Clean up Python cache and build files"
	@echo "  make zip          - Create .ankiaddon distribution file"
	@echo "  make install      - Install dependencies and create symbolic link"
	@echo "  make install-deps - Install Python dependencies only"
	@echo "  make install-link - Create symbolic link only"