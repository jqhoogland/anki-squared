import os
import sys
from pathlib import Path

from anki import version

ANKI21 = version.startswith("2.1.")
SYS_ENCODING = sys.getfilesystemencoding()

if ANKI21:
    ADDON_PATH = os.path.dirname(__file__)
else:
    ADDON_PATH = os.path.dirname(__file__).decode(SYS_ENCODING)

ICONS_PATH = Path(os.path.join(ADDON_PATH, "icons"))
