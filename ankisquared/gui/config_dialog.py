
import sys
import types
from dataclasses import fields
from typing import Annotated, Literal, get_args, get_origin

from aqt import mw
from aqt.editor import Editor
from aqt.qt import (QComboBox, QDialog, QDoubleSpinBox, QHBoxLayout, QLabel,
                    QLineEdit, QPushButton, QSpinBox, QTabWidget, QVBoxLayout,
                    QWidget)

from ankisquared.config import ButtonConfig, Config
from ankisquared.consts import DIFFICULTIES, LANGUAGES


def generate_button_config_panel(button_config: ButtonConfig, parent: QWidget = None) -> QVBoxLayout:
    layout = QVBoxLayout()
    
    widgets = {}

    for field in fields(ButtonConfig):
        label = QLabel(field.name.replace("_", " ").capitalize() + ":")
        layout.addWidget(label)

        widget = QLineEdit()
        widget.setText(str(getattr(button_config, field.name)))
        layout.addWidget(widget)

        widgets[field.name] = widget

    # ... If you want to save changes to ButtonConfig here, add the functionality

    return layout, widgets


def generate_config_panel(config: Config, dialog: QDialog, tab_widget: QTabWidget) -> QVBoxLayout:
    layout = QVBoxLayout()
    
    widgets = {}

    for field in fields(Config):

        if get_origin(field.type) is list and get_args(field.type)[0] == ButtonConfig:
            # Each ButtonConfig gets its own tab
            button_configs = config.buttons
            widgets["buttons"] = []

            for i, btn_conf in enumerate(button_configs):
                btn_widget = QWidget()
                btn_layout, btn_widget_dict = generate_button_config_panel(btn_conf, dialog)
                btn_widget.setLayout(btn_layout)
                tab_widget.addTab(btn_widget, f"Button {i + 1}")
                widgets["buttons"].append(btn_widget_dict)
                
            continue

        label = QLabel(field.name.replace("_", " ").capitalize() + ":")
        layout.addWidget(label)

        if "api_key" in field.name:
            widget = QLineEdit()
            widget.setText(getattr(config, field.name))
            layout.addWidget(widget)
            widgets[field.name] = widget
            continue
        
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

    return layout, widgets


def generate_config_dialog(config: Config) -> None:
    dialog = QDialog()
    dialog.setWindowTitle("Settings")

    tab_widget = QTabWidget()

    # Create the Overall tab
    overall_settings_widget = QWidget()
    overall_settings_layout, widgets = generate_config_panel(config, dialog, tab_widget)
    overall_settings_widget.setLayout(overall_settings_layout)
    tab_widget.addTab(overall_settings_widget, "Overall")

    # The main layout for the dialog
    layout = QVBoxLayout()
    layout.addWidget(tab_widget)

    # OK and Cancel buttons below the tabs
    def save_config():
        def get_value(widget):
            if isinstance(widget, QLineEdit):
                return widget.text()
            elif isinstance(widget, QComboBox):
                if field.name == "language":
                    return widget.currentData()
                else:
                    return widget.currentText()
            elif isinstance(widget, QSpinBox) or isinstance(widget, QDoubleSpinBox):
                return widget.value()

        updated_fields = {}

        for field in fields(Config):
            # You'll have to ensure this fetches data from the current tab accurately
            if field.name == "buttons":
                for btn_widget, btn_config in zip(widgets[field.name], config.buttons):
                    for btn_field in fields(ButtonConfig):
                        widget = btn_widget[btn_field.name]
                        setattr(btn_config, btn_field.name, get_value(widget))

                continue

            widget = widgets[field.name]
            updated_fields[field.name] = get_value(widget)

        config.update(**updated_fields)

    buttons = QHBoxLayout()
    ok_button = QPushButton("OK")
    ok_button.clicked.connect(lambda: (save_config(), dialog.accept()))
    cancel_button = QPushButton("Cancel")
    cancel_button.clicked.connect(dialog.reject)
    buttons.addWidget(ok_button)
    buttons.addWidget(cancel_button)

    # Add the buttons to the main layout
    layout.addLayout(buttons)

    dialog.setLayout(layout)
    dialog.resize(500, 800)
    dialog.exec()
