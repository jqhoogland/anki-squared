
import sys
import types
from dataclasses import fields
from typing import Annotated, Literal, get_args, get_origin

from aqt import mw
from aqt.editor import Editor
from aqt.qt import (QComboBox, QDialog, QDoubleSpinBox, QHBoxLayout, QLabel,
                    QLineEdit, QPushButton, QSpinBox, QVBoxLayout)

from ankisquared.config import Config
from ankisquared.consts import DIFFICULTIES, LANGUAGES


def generate_config_dialog(config: Config) -> None:
    dialog = QDialog()
    dialog.setWindowTitle("Settings")

    layout = QVBoxLayout()

    widgets = {}

    for field in fields(Config):
        label = QLabel(field.name.replace("_", " ").capitalize() + ":")
        layout.addWidget(label)

        if "api_key" in field.name:
            widget = QLineEdit()
            widget.setText(getattr(config, field.name))
            layout.addWidget(widget)
            widgets[field.name] = widget
            continue  # Skip to next iteration to prevent double widgets

        # Use metadata for Annotated
        metadata = getattr(field.type, '__metadata__', None)
        if metadata and "options" in metadata[0]:
            options = metadata[0]["options"]

            widget = QComboBox()
            for name, code in options.items():
                widget.addItem(name, code)
            widget.setCurrentIndex(widget.findData(getattr(config, field.name)))
            layout.addWidget(widget)
        # New handling for Literal
        elif get_origin(field.type) is Literal:
            options = get_args(field.type)
            widget = QComboBox()
            widget.addItems(options)
            widget.setCurrentText(getattr(config, field.name))
            layout.addWidget(widget)
        elif field.type == int:
            widget = QSpinBox()
            widget.setRange(0, 1000)  # Adjust as needed
            widget.setValue(getattr(config, field.name))
            layout.addWidget(widget)
        elif field.type == float:
            widget = QDoubleSpinBox()
            widget.setRange(0.0, 5.0)  # Adjust as needed
            widget.setValue(getattr(config, field.name))
            layout.addWidget(widget)
        else:
            widget = QLineEdit()
            widget.setText(str(getattr(config, field.name)))
            layout.addWidget(widget)

        widgets[field.name] = widget

    def save_config():
        updated_fields = {}
        for field in fields(Config):
            widget = widgets[field.name]
            if isinstance(widget, QLineEdit):
                updated_fields[field.name] = widget.text()
            elif isinstance(widget, QComboBox):
                if field.name == "language":
                    updated_fields[field.name] = widget.currentData()
                else:
                    updated_fields[field.name] = widget.currentText()
            elif isinstance(widget, QSpinBox) or isinstance(widget, QDoubleSpinBox):
                updated_fields[field.name] = widget.value()

        config.update(**updated_fields)

    buttons = QHBoxLayout()
    ok_button = QPushButton("OK")
    ok_button.clicked.connect(lambda: (save_config(), dialog.accept()))
    cancel_button = QPushButton("Cancel")
    cancel_button.clicked.connect(dialog.reject)
    buttons.addWidget(ok_button)
    buttons.addWidget(cancel_button)
    layout.addLayout(buttons)

    dialog.setLayout(layout)
    dialog.resize(500, 800)  # You can adjust these numbers
    dialog.exec_()
