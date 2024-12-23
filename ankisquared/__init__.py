import html
import os
import sys

import anki
from anki.notes import Note
from aqt import gui_hooks, mw
from aqt.qt import *

from ankisquared.gui.editor_menu import did_load_editor


gui_hooks.editor_did_init_buttons.append(did_load_editor)
