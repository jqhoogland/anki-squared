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


def generate_general_settings_panel(config: Config, parent: QWidget = None) -> Tuple[QVBoxLayout, Dict[str, QWidget]]:
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
            widget.setValue(getattr(config, field.name))

        # If field type is float
        elif field.type == float:
            widget = QDoubleSpinBox()
            widget.setRange(0.0, 5.0)
            widget.setValue(getattr(config, field.name))

        # If field name is "system_prompt" (a multi-line field)
        elif field.name == "system_prompt":
            widget = QTextEdit()
            widget.setText(getattr(config, field.name))

        else:
            widget = QLineEdit()
            widget.setText(str(getattr(config, field.name)))

        layout.addWidget(widget)
        widgets[field.name] = widget

    return layout, widgets


def generate_button_config_panel(
    button_config: ButtonConfig,
    parent: QWidget = None,
    on_remove=None,
    on_duplicate=None
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

    # Add buttons for removing or duplicating this button
    button_layout = QHBoxLayout()
    remove_button = QPushButton("Remove", widget)
    duplicate_button = QPushButton("Duplicate", widget)

    button_layout.addWidget(remove_button)
    button_layout.addWidget(duplicate_button)
    layout.addLayout(button_layout)

    # Wire up remove/duplicate signals if callbacks provided
    if on_remove:
        remove_button.clicked.connect(lambda: on_remove(button_config))
    if on_duplicate:
        duplicate_button.clicked.connect(lambda: on_duplicate(button_config))

    return widget


class ButtonTabWidget(QTabWidget):
    """
    A QTabWidget subclass that includes a "+" tab for adding new buttons.
    """

    def __init__(self, parent=None):
        super().__init__(parent)
        # Add the "+" tab at the end
        self.plus_tab_index = self.addTab(QWidget(), "+")

    def mouseReleaseEvent(self, event):
        # Check if the clicked tab is the "+" tab
        index = self.tabBar().tabAt(event.pos())
        if index == self.plus_tab_index:
            # Trigger some signal or callback to create a new button config
            self.parent().on_add_button()
        super().mouseReleaseEvent(event)

    def update_plus_tab_position(self):
        # Ensures "+" tab is always at the end (optional if you want dynamic re-ordering)
        current_count = self.count()
        if self.plus_tab_index != current_count - 1:
            widget = self.widget(self.plus_tab_index)
            text = self.tabText(self.plus_tab_index)
            self.removeTab(self.plus_tab_index)
            self.plus_tab_index = self.addTab(widget, text)


def generate_config_dialog(config: Config) -> None:
    """
    Create and show the configuration dialog with:
      - A tab for general (non-button) settings
      - A separate QTabWidget for each button configuration,
        plus a "+" tab for adding new buttons
    """

    dialog = QDialog()
    dialog.setWindowTitle("Settings")
    main_layout = QVBoxLayout(dialog)

    # -- General Settings Tab --
    general_tab = QWidget(dialog)
    general_layout, general_widgets = generate_general_settings_panel(config, general_tab)
    general_tab.setLayout(general_layout)

    # -- Button Tabs --
    # Use a custom widget with a "+" tab
    button_tab_widget = ButtonTabWidget(dialog)

    # We'll keep references to each button widget and a function to refresh them
    def refresh_button_tabs():
        # 1. Remove all tabs, including "+"
        while button_tab_widget.count() > 0:
            button_tab_widget.removeTab(0)

        # 2. Re-insert each button in config.buttons
        for i, btn_conf in enumerate(config.buttons):
            def on_remove_button(removed_conf):
                config.buttons.remove(removed_conf)
                refresh_button_tabs()

            def on_duplicate_button(duplicate_conf):
                import copy
                new_button_config = copy.deepcopy(duplicate_conf)
                config.buttons.append(new_button_config)
                refresh_button_tabs()

            panel = generate_button_config_panel(
                btn_conf,
                parent=dialog,
                on_remove=on_remove_button,
                on_duplicate=on_duplicate_button
            )
            button_tab_widget.addTab(panel, f"Button {i + 1}")

        # 3. Add the "+" tab last
        plus_panel = QWidget() 
        # Optionally store it if you need to detect clicks differently 
        plus_tab_index = button_tab_widget.addTab(plus_panel, "+")
        button_tab_widget.plus_tab_index = plus_tab_index

        # 4. If we have any buttons, select the first button tab
        if config.buttons:
            button_tab_widget.setCurrentIndex(0)
        else:
            # If there are no buttons, the "+" tab will be index 0
            button_tab_widget.setCurrentIndex(0)


    # Provide a method to handle adding a new button
    def on_add_button():
        # Create a new ButtonConfig
        new_btn_conf = ButtonConfig(
            name="New Button",
            endpoint="",
            prompt="",
            icon="",
            label="",
            tip="",
            keys=""
        )
        config.buttons.append(new_btn_conf)
        refresh_button_tabs()

    # Attach this method to the custom widget
    button_tab_widget.parent().on_add_button = on_add_button

    # Initial population of button tabs
    refresh_button_tabs()

    # Combine tabs into a QTabWidget: one tab for general, one container for button_tab_widget
    full_tab_widget = QTabWidget(dialog)
    full_tab_widget.addTab(general_tab, "General")

    # Wrap the button_tab_widget in a simple QWidget so we can add it as a tab
    button_panel = QWidget(dialog)
    panel_layout = QVBoxLayout(button_panel)
    panel_layout.addWidget(button_tab_widget)
    button_panel.setLayout(panel_layout)
    full_tab_widget.addTab(button_panel, "Profiles")

    main_layout.addWidget(full_tab_widget)

    # -- Save/Cancel Buttons --
    def save_config():
        """
        Gather values from the general widgets and from each button tab.
        """
        # Update general fields
        for field in fields(Config):
            if field.name == "buttons":
                continue
            if field.name in general_widgets:
                widget = general_widgets[field.name]
                if isinstance(widget, QLineEdit):
                    setattr(config, field.name, widget.text())
                elif isinstance(widget, QComboBox):
                    # Some combos store data in currentData
                    setattr(config, field.name, widget.currentData() or widget.currentText())
                elif isinstance(widget, (QSpinBox, QDoubleSpinBox)):
                    setattr(config, field.name, widget.value())
                elif isinstance(widget, QTextEdit):
                    setattr(config, field.name, widget.toPlainText())

        # Update button fields (read them from each tab’s widgets)
        # Because we rebuild the button panels dynamically, we already store changes
        # in the QLineEdits, combos, etc. You can do a final read here if needed.
        # If you want them to auto-update, connect signals or do a final pass here.

        # Example of final pass:
        # for i in range(button_tab_widget.count() - 1):
        #    btn_widget = button_tab_widget.widget(i)
        #    # If we kept a reference to the fields_dict, we'd read them here
        #    # and set them to config.buttons[i].

        # Save changes to config, e.g. config.update(...) if that method handles it
        config.update(**{f.name: getattr(config, f.name) for f in fields(Config) if f.name != "buttons"})

    buttons_layout = QHBoxLayout()
    ok_button = QPushButton("OK", dialog)
    ok_button.clicked.connect(lambda: (save_config(), dialog.accept()))

    cancel_button = QPushButton("Cancel", dialog)
    cancel_button.clicked.connect(dialog.reject)

    buttons_layout.addWidget(ok_button)
    buttons_layout.addWidget(cancel_button)
    main_layout.addLayout(buttons_layout)

    dialog.resize(600, 800)
    dialog.exec()
