from aqt.editor import Editor
from aqt.qt import (QComboBox, QDialog, QHBoxLayout, QLabel, QPushButton,
                    QVBoxLayout)

from ankisquared.consts import DIFFICULTIES, LANGUAGES


def show_settings_dialog(editor: Editor):
    # Dialog setup
    dialog = QDialog(editor.parentWindow)
    layout = QVBoxLayout()
    dialog.setWindowTitle("Settings")

    # Language selection
    label_language = QLabel("Choose a language:")
    layout.addWidget(label_language)

    combo_language = QComboBox()
    for name, code in LANGUAGES.items():
        combo_language.addItem(name, code)

    layout.addWidget(combo_language)

    # Set the default value for the language
    default_language_index = combo_language.findData(editor.language)
    if default_language_index != -1:
        combo_language.setCurrentIndex(default_language_index)


    # Difficulty selection
    label_difficulty = QLabel("Select difficulty level:")
    layout.addWidget(label_difficulty)

    combo_difficulty = QComboBox()
    for difficulty in DIFFICULTIES:
        combo_difficulty.addItem(difficulty)
    layout.addWidget(combo_difficulty)

    # Set the default value for the difficulty
    default_difficulty_index = combo_difficulty.findText(editor.difficulty)
    if default_difficulty_index != -1:
        combo_difficulty.setCurrentIndex(default_difficulty_index)


    # OK and Cancel buttons
    btn_layout = QHBoxLayout()
    btn_ok = QPushButton("OK")
    btn_ok.clicked.connect(dialog.accept)
    btn_cancel = QPushButton("Cancel")
    btn_cancel.clicked.connect(dialog.reject)
    btn_layout.addWidget(btn_ok)
    btn_layout.addWidget(btn_cancel)
    layout.addLayout(btn_layout)

    dialog.setLayout(layout)

    # Show dialog
    if dialog.exec_():
        selected_language_name = combo_language.currentText()
        selected_language_code = combo_language.currentData()
        selected_difficulty = combo_difficulty.currentText()

        # Handle the selected language and difficulty
        handle_selected_settings(editor, selected_language_code, selected_difficulty)


def set_editor_settings(editor, **fields):
    for key, value in fields.items():
        setattr(editor, key, value)

    # Do the same in conf
    conf = mw.addonManager.getConfig("ankisquared")
    conf.update(fields)

    # Save the config
    mw.addonManager.writeConfig("ankisquared", conf)


def handle_selected_settings(editor: Editor, language: str, difficulty: str):
    set_editor_settings(editor, language=language, difficulty=difficulty)
