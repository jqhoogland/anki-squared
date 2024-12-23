from dataclasses import fields
from typing import Dict, Literal, Tuple, Union, get_args, get_origin

from aqt.qt import (
    QComboBox,
    QDialog,
    QDoubleSpinBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QSpinBox,
    QTabWidget,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from ankisquared.config import ButtonConfig, Config, Endpoint
from ankisquared.consts import DIFFICULTIES, LANGUAGES


def generate_button_config_panel(
    button_config: ButtonConfig, parent: QWidget = None
) -> Tuple[QVBoxLayout, Dict[str, QWidget]]:
    """Generate a panel for configuring a single button.

    Args:
        button_config: Configuration for the button
        parent: Parent widget for the panel

    Returns:
        Tuple containing the layout and a dictionary of field widgets
    """
    layout = QVBoxLayout()
    widgets = {}

    for field in ["name", "endpoint", "prompt", "icon", "tip", "keys"]:
        label = QLabel(field.replace("_", " ").capitalize() + ":")
        layout.addWidget(label)

        if field == "endpoint":
            widget = QComboBox()
            widget.addItems([e.value for e in Endpoint])
            widget.setCurrentText(getattr(button_config, field))
        elif field == "icon":
            widget = QComboBox()
            icons = [
                "image-search.png",
                "forvo.png",
                "example.png",
                "definition.png",
                "ipa.png",
            ]
            widget.addItems(icons)
            widget.setCurrentText(getattr(button_config, field))
        else:
            widget = QLineEdit()
            widget.setText(str(getattr(button_config, field)))

        layout.addWidget(widget)
        widgets[field] = widget

    return layout, widgets


def generate_config_panel(
    config: Config, dialog: QDialog, tab_widget: QTabWidget
) -> Tuple[QVBoxLayout, Dict[str, QWidget]]:
    """Generate the main configuration panel with all settings.

    Args:
        config: Main configuration object
        dialog: Parent dialog
        tab_widget: Tab widget for organizing button configs

    Returns:
        Tuple containing the layout and a dictionary of field widgets
    """
    layout = QVBoxLayout()
    widgets = {}

    button_configs = config.buttons
    widgets["buttons"] = []
    tab_buttons = []

    for i, btn_conf in enumerate(button_configs):
        btn_widget = QWidget()
        btn_layout, btn_widget_dict = generate_button_config_panel(btn_conf, dialog)
        btn_widget.setLayout(btn_layout)
        widgets["buttons"].append(btn_widget_dict)
        tab_buttons.append(btn_widget)

    for field_name in [
        "language",
        "difficulty",
        "bing_api_key",
        "num_images",
        "openai_api_key",
        "model",
        "max_tokens",
        "temperature",
        "forvo_api_key",
        "system_prompt",
    ]:
        field = next(f for f in fields(Config) if f.name == field_name)
        label = QLabel(field.name.replace("_", " ").capitalize() + ":")
        layout.addWidget(label)

        if "api_key" in field.name:
            widget = QLineEdit()
            widget.setText(getattr(config, field.name))
            layout.addWidget(widget)
            widgets[field.name] = widget
            continue

        metadata = getattr(field.type, "__metadata__", None)
        if metadata and "options" in metadata[0]:
            widget = QComboBox()
            for name, code in metadata[0]["options"].items():
                widget.addItem(name, code)
            widget.setCurrentIndex(widget.findData(getattr(config, field.name)))
        elif get_origin(field.type) is Literal:
            widget = QComboBox()
            widget.addItems(get_args(field.type))
            widget.setCurrentText(getattr(config, field.name))
        elif field.type == int:
            widget = QSpinBox()
            widget.setRange(0, 1000)
            widget.setValue(getattr(config, field.name))
        elif field.type == float:
            widget = QDoubleSpinBox()
            widget.setRange(0.0, 5.0)
            widget.setValue(getattr(config, field.name))
        elif field.name == "system_prompt":
            widget = QTextEdit()
            widget.setText(getattr(config, field.name))
        else:
            widget = QLineEdit()
            widget.setText(str(getattr(config, field.name)))

        layout.addWidget(widget)
        widgets[field.name] = widget

    return layout, widgets, tab_buttons


def generate_config_dialog(config: Config) -> None:
    """Create and show the configuration dialog.

    Args:
        config: Configuration object to edit
    """
    dialog = QDialog()
    dialog.setWindowTitle("Settings")

    tab_widget = QTabWidget()
    overall_settings_widget = QWidget()
    overall_settings_layout, widgets, tab_buttons = generate_config_panel(
        config, dialog, tab_widget
    )
    overall_settings_widget.setLayout(overall_settings_layout)
    tab_widget.addTab(overall_settings_widget, "Overall")

    for i, btn_widget in enumerate(tab_buttons):
        tab_widget.addTab(btn_widget, f"Button {i + 1}")

    layout = QVBoxLayout()
    layout.addWidget(tab_widget)

    def save_config() -> None:
        """Save the current configuration state."""

        def get_value(widget: QWidget) -> Union[str, int, float]:
            if isinstance(widget, QLineEdit):
                return widget.text()
            elif isinstance(widget, QComboBox):
                return (
                    widget.currentData()
                    if field.name == "language"
                    else widget.currentText()
                )
            elif isinstance(widget, (QSpinBox, QDoubleSpinBox)):
                return widget.value()
            return ""

        updated_fields = {}

        for field in fields(Config):
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

    layout.addLayout(buttons)
    dialog.setLayout(layout)
    dialog.resize(500, 800)
    dialog.exec()
