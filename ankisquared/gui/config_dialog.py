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


def generate_general_settings_panel(
    config: Config, parent: QWidget = None
) -> Tuple[QVBoxLayout, Dict[str, QWidget]]:
    """
    Create a layout and widgets for the general (non-button) fields of Config.
    Returns the layout and a dictionary of widget references.
    """
    layout = QVBoxLayout()
    widgets = {}

    # Go through each field in Config that isn't "buttons"
    general_fields = [
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
    ]

    for field_name in general_fields:
        field = next(f for f in fields(Config) if f.name == field_name)

        label = QLabel(field.name.replace("_", " ").capitalize() + ":")
        layout.addWidget(label)

        # If it’s an API key or a simple QLineEdit field
        if "api_key" in field.name:
            widget = QLineEdit()
            widget.setText(getattr(config, field.name))
            layout.addWidget(widget)
            widgets[field.name] = widget
            continue

        # If field type has metadata with options (like languages/difficulties)
        metadata = getattr(field.type, "__metadata__", None)
        if metadata and "options" in metadata[0]:
            widget = QComboBox()
            for name, code in metadata[0]["options"].items():
                widget.addItem(name, code)
            widget.setCurrentIndex(widget.findData(getattr(config, field.name)))

        # If field type is a Literal (e.g. from typing import Literal)
        elif get_origin(field.type) is Literal:
            widget = QComboBox()
            widget.addItems(get_args(field.type))
            widget.setCurrentText(getattr(config, field.name))

        # If field type is int
        elif field.type == int:
            widget = QSpinBox()
            widget.setRange(0, 1000)
            widget.setValue(int(getattr(config, field.name)))

        # If field type is float
        elif field.type == float:
            widget = QDoubleSpinBox()
            widget.setRange(0.0, 5.0)
            widget.setValue(float(getattr(config, field.name)))

        # If field name is "system_prompt" (a multi-line field)
        elif field.name == "system_prompt":
            widget = QTextEdit()
            widget.setText(str(getattr(config, field.name)))

        else:
            widget = QLineEdit()
            widget.setText(str(getattr(config, field.name)))

        layout.addWidget(widget)
        widgets[field.name] = widget

    return layout, widgets


def generate_button_config_panel(
    button_config: ButtonConfig,
    button_index: int,
    parent: QWidget = None,
    on_remove=None,
    on_duplicate=None,
) -> QWidget:
    """
    Create a QWidget for configuring a single ButtonConfig, including
    Remove and Duplicate buttons.
    """
    widget = QWidget(parent)
    layout = QVBoxLayout(widget)
    fields_dict = {}

    for field_name in ["name", "endpoint", "prompt", "icon", "label", "tip", "keys"]:
        field_label = QLabel(field_name.replace("_", " ").capitalize() + ":", widget)
        layout.addWidget(field_label)

        if field_name == "endpoint":
            field_widget = QComboBox(widget)
            field_widget.addItems([e.value for e in Endpoint])
            field_widget.setCurrentText(getattr(button_config, field_name))
        elif field_name == "icon":
            field_widget = QComboBox(widget)
            icons = [
                "",
                "image-search.png",
                "forvo.png",
                "example.png",
                "definition.png",
                "ipa.png",
            ]
            field_widget.addItems(icons)
            field_widget.setCurrentText(getattr(button_config, field_name))
        else:
            field_widget = QLineEdit(widget)
            field_widget.setText(str(getattr(button_config, field_name)))

        layout.addWidget(field_widget)
        fields_dict[field_name] = field_widget

    widget.fields_dict = fields_dict
    # Add buttons for removing or duplicating this button
    button_layout = QHBoxLayout()
    remove_button = QPushButton("Remove", widget)
    duplicate_button = QPushButton("Duplicate", widget)

    button_layout.addWidget(remove_button)
    button_layout.addWidget(duplicate_button)
    layout.addLayout(button_layout)

    # Wire up callbacks
    if on_remove:
        remove_button.clicked.connect(lambda: on_remove(button_index, button_config))
    if on_duplicate:
        duplicate_button.clicked.connect(
            lambda: on_duplicate(button_index, button_config)
        )

    return widget


def get_value(widget):
    if hasattr(widget, "text"):
        return widget.text()
    elif hasattr(widget, "toPlainText"):
        return widget.toPlainText()
    elif hasattr(widget, "currentText"):
        return widget.currentText()
    elif hasattr(widget, "currentIndex"):
        return widget.currentIndex()
    elif hasattr(widget, "value"):
        return widget.value()
    else:
        raise ValueError(f"No value attribute found for widget {widget}")


def generate_config_dialog(config: Config):
    dialog = QDialog()
    dialog.setWindowTitle("Settings")
    main_layout = QVBoxLayout(dialog)

    # Create a top-level tab widget (1) for General / (2) for Buttons
    top_tab_widget = QTabWidget(dialog)

    # -- General Tab --
    general_tab = QWidget(dialog)
    general_layout, general_widgets = generate_general_settings_panel(
        config, general_tab
    )
    general_tab.setLayout(general_layout)
    top_tab_widget.addTab(general_tab, "General")

    # -- Button Tab Widget --
    button_tab_widget = QTabWidget(dialog)
    # We'll refresh the tabs in a function to keep them up-to-date

    def on_remove_button(button_index, button_conf):
        print(f"Removing suggestion button {button_index + 1}...")
        config.buttons.pop(button_index)
        refresh_button_tabs()

    def on_duplicate_button(button_index, duplicate_conf):
        import copy

        print(f"Duplicating suggestion button {button_index + 1}...")
        new_button = copy.deepcopy(duplicate_conf)
        config.buttons.append(new_button)
        refresh_button_tabs()

    def refresh_button_tabs():
        # Remove all tabs
        while button_tab_widget.count() > 0:
            button_tab_widget.removeTab(0)

        # Add one tab per ButtonConfig
        for i, btn_conf in enumerate(config.buttons):
            panel = generate_button_config_panel(
                btn_conf,
                i,
                parent=dialog,
                on_remove=on_remove_button,
                on_duplicate=on_duplicate_button,
            )
            button_tab_widget.addTab(panel, f"Button {i+1}")

        # Lastly, add the "+" tab and store its index
        plus_panel = QWidget()
        plus_index = button_tab_widget.addTab(plus_panel, "+")
        button_tab_widget.setCurrentIndex(0)  # Show the first button if it exists

    def on_add_button():
        # Create a default new button
        new_btn = (
            type(config.buttons[0])(
                name="New Button",
                endpoint="",
                prompt="",
                icon="",
                label="",
                tip="",
                keys="",
            )
            if config.buttons
            else None
        )
        if new_btn is None:
            # If there are no existing buttons to reference, create one from scratch or your default
            from dataclasses import make_dataclass

            # For demonstration, just use a "bare" ButtonConfig
            # (replace with real ButtonConfig class as in your code)
            ButtonConfig = make_dataclass(
                "ButtonConfig",
                [
                    ("name", str),
                    ("endpoint", str),
                    ("prompt", str),
                    ("icon", str),
                    ("label", str),
                    ("tip", str),
                    ("keys", str),
                ],
            )
            new_btn = ButtonConfig("New Button", "", "", "", "", "", "")

        config.buttons.append(new_btn)
        refresh_button_tabs()

        # Switch to the newly created tab (second to last tab is the new button):
        if button_tab_widget.count() > 1:
            button_tab_widget.setCurrentIndex(button_tab_widget.count() - 2)

    # Connect the built-in signal tabBarClicked to detect clicks on the “+” tab
    def on_tab_bar_clicked(idx):
        # If the user clicked the last tab, that is the “+” tab
        if idx == button_tab_widget.count() - 1:
            on_add_button()

    button_tab_widget.tabBarClicked.connect(on_tab_bar_clicked)

    # Populate the tabs initially
    refresh_button_tabs()

    # Wrap button_tab_widget in its own tab on top_tab_widget
    buttons_outer = QWidget(dialog)
    outer_layout = QVBoxLayout(buttons_outer)
    outer_layout.addWidget(button_tab_widget)
    buttons_outer.setLayout(outer_layout)

    top_tab_widget.addTab(buttons_outer, "Buttons")

    main_layout.addWidget(top_tab_widget)

    # -- Save/Cancel --
    def save_config():
        # Update config fields from general widgets
        for field_info in fields(config.__class__):
            if field_info.name == "buttons":
                for i in range(button_tab_widget.count() - 1):
                    tab_widget = button_tab_widget.widget(i)

                    # Check if this tab has fields_dict
                    if not hasattr(tab_widget, "fields_dict"):
                        continue  # Skip any tabs without it

                    button_conf = config.buttons[i]
                    for field_name, field_widget in tab_widget.fields_dict.items():
                        setattr(button_conf, field_name, get_value(field_widget))

            if field_info.name in general_widgets:
                w = general_widgets[field_info.name]

                config.__dict__[field_info.name] = get_value(w)

        config.save_to_conf()

    btn_layout = QHBoxLayout()
    ok_btn = QPushButton("OK")
    ok_btn.clicked.connect(lambda: (save_config(), dialog.accept()))
    cancel_btn = QPushButton("Cancel")
    cancel_btn.clicked.connect(lambda: (config.reset(), dialog.reject()))
    btn_layout.addWidget(ok_btn)
    btn_layout.addWidget(cancel_btn)
    main_layout.addLayout(btn_layout)

    dialog.resize(600, 400)
    dialog.exec()
