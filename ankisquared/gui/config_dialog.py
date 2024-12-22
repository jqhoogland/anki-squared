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

from ankisquared.config import ButtonConfig, Config, Endpoint, ProfileConfig
from ankisquared.consts import DIFFICULTIES, LANGUAGES
from ankisquared.gui.utils import get_value


def generate_general_settings_panel(
    config: Config, parent: QWidget = None
) -> Tuple[QVBoxLayout, Dict[str, QWidget]]:
    """
    Create a layout and widgets for the general (non-button) fields of Config.
    Returns the layout and a dictionary of widget references.
    """
    layout = QVBoxLayout()
    widgets = {}

    # Only keep the top-level fields that remain in Config
    # (i.e., the API keys). The rest is now in ProfileConfig.
    general_fields = [
        "forvo_api_key",
        "bing_api_key",
        "openai_api_key",
    ]

    for field_name in general_fields:
        field_label = QLabel(field_name.replace("_", " ").capitalize() + ":", parent)
        layout.addWidget(field_label)

        field_widget = QLineEdit(parent)
        field_widget.setText(str(getattr(config, field_name)))
        layout.addWidget(field_widget)
        widgets[field_name] = field_widget

    return layout, widgets


def generate_profile_config_panel(
    profile_config: ProfileConfig,
    profile_index: int,
    parent: QWidget = None,
    on_remove=None,
    on_duplicate=None,
) -> QWidget:
    """
    Create a QWidget for configuring a single ProfileConfig, including
    Remove and Duplicate buttons.
    """
    widget = QWidget(parent)
    layout = QVBoxLayout(widget)
    fields_dict = {}

    # Pick the fields in ProfileConfig to expose
    profile_fields = [
        "name",
        "language",
        "num_images",
        "model",
        "max_tokens",
        "temperature",
        "system_prompt",
    ]

    for field_name in profile_fields:
        label = QLabel(field_name.replace("_", " ").capitalize() + ":", widget)
        layout.addWidget(label)

        field_type = next(f.type for f in fields(ProfileConfig) if f.name == field_name)
        # If field type has metadata with options
        metadata = getattr(field_type, "__metadata__", None)

        if field_name == "system_prompt":
            field_widget = QTextEdit(widget)
            field_widget.setText(str(getattr(profile_config, field_name)))
        elif metadata and "options" in metadata[0]:
            # For example, languages
            field_widget = QComboBox(widget)
            for name, code in metadata[0]["options"].items():
                field_widget.addItem(name, code)
            field_widget.setCurrentIndex(
                field_widget.findData(getattr(profile_config, field_name))
            )
        elif get_origin(field_type) is Literal:
            # If it's a Literal (e.g. model choices)
            field_widget = QComboBox(widget)
            field_widget.addItems(get_args(field_type))
            field_widget.setCurrentText(str(getattr(profile_config, field_name)))
        elif field_type == int:
            field_widget = QSpinBox(widget)
            field_widget.setRange(0, 5000)
            field_widget.setValue(int(getattr(profile_config, field_name)))
        elif field_type == float:
            field_widget = QDoubleSpinBox(widget)
            field_widget.setRange(0.0, 5.0)
            field_widget.setValue(float(getattr(profile_config, field_name)))
        else:
            # Default to QLineEdit
            field_widget = QLineEdit(widget)
            field_widget.setText(str(getattr(profile_config, field_name)))

        layout.addWidget(field_widget)
        fields_dict[field_name] = field_widget

    widget.fields_dict = fields_dict

    # Add remove/duplicate buttons
    button_layout = QHBoxLayout()
    remove_button = QPushButton("Remove", widget)
    duplicate_button = QPushButton("Duplicate", widget)
    button_layout.addWidget(remove_button)
    button_layout.addWidget(duplicate_button)
    layout.addLayout(button_layout)

    if on_remove:
        remove_button.clicked.connect(lambda: on_remove(profile_index, profile_config))
    if on_duplicate:
        duplicate_button.clicked.connect(
            lambda: on_duplicate(profile_index, profile_config)
        )

    return widget


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

    button_layout = QHBoxLayout()
    remove_button = QPushButton("Remove", widget)
    duplicate_button = QPushButton("Duplicate", widget)
    button_layout.addWidget(remove_button)
    button_layout.addWidget(duplicate_button)
    layout.addLayout(button_layout)

    if on_remove:
        remove_button.clicked.connect(lambda: on_remove(button_index, button_config))
    if on_duplicate:
        duplicate_button.clicked.connect(
            lambda: on_duplicate(button_index, button_config)
        )

    return widget


def generate_config_dialog(config: Config):
    dialog = QDialog()
    dialog.setWindowTitle("Settings")
    main_layout = QVBoxLayout(dialog)

    top_tab_widget = QTabWidget(dialog)
    main_layout.addWidget(top_tab_widget)

    # -- General Tab --
    general_tab = QWidget(dialog)
    general_layout, general_widgets = generate_general_settings_panel(
        config, general_tab
    )
    general_tab.setLayout(general_layout)
    top_tab_widget.addTab(general_tab, "General")

    # -- Profiles Tab (with sub-tabs) --
    profiles_tab_outer = QWidget(dialog)
    profiles_tab_layout = QVBoxLayout(profiles_tab_outer)
    profiles_tab_widget = QTabWidget(profiles_tab_outer)
    profiles_tab_layout.addWidget(profiles_tab_widget)
    profiles_tab_outer.setLayout(profiles_tab_layout)
    top_tab_widget.addTab(profiles_tab_outer, "Profiles")

    def on_remove_profile(profile_index, profile_conf):
        config.profiles.pop(profile_index)
        refresh_profile_tabs()

    def on_duplicate_profile(profile_index, profile_conf):
        import copy

        new_profile = copy.deepcopy(profile_conf)
        config.profiles.append(new_profile)
        refresh_profile_tabs()

    def on_add_profile():
        # Create a default new profile
        new_profile = ProfileConfig(
            name="New Profile",
            language="en",
            num_images=3,
            model="gpt-4o",
            max_tokens=100,
            temperature=0.7,
        )
        config.profiles.append(new_profile)
        refresh_profile_tabs()
        if profiles_tab_widget.count() > 1:
            profiles_tab_widget.setCurrentIndex(profiles_tab_widget.count() - 2)

    def refresh_profile_tabs():
        # Remove all existing tabs
        while profiles_tab_widget.count() > 0:
            profiles_tab_widget.removeTab(0)

        # Create a tab for each profile
        for i, profile in enumerate(config.profiles):
            profile_panel = generate_profile_config_panel(
                profile,
                i,
                parent=dialog,
                on_remove=on_remove_profile,
                on_duplicate=on_duplicate_profile,
            )
            profiles_tab_widget.addTab(profile_panel, f"Profile {i+1}")

        # Add a "+" tab for adding new profiles
        plus_panel = QWidget()
        plus_index = profiles_tab_widget.addTab(plus_panel, "+")
        profiles_tab_widget.setCurrentIndex(0 if config.profiles else plus_index)

    def on_profiles_tab_clicked(index):
        if index == profiles_tab_widget.count() - 1:
            on_add_profile()

    profiles_tab_widget.tabBarClicked.connect(on_profiles_tab_clicked)
    refresh_profile_tabs()

    # -- Buttons Tab (with sub-tabs) --
    buttons_tab_outer = QWidget(dialog)
    buttons_tab_layout = QVBoxLayout(buttons_tab_outer)
    buttons_tab_widget = QTabWidget(buttons_tab_outer)
    buttons_tab_layout.addWidget(buttons_tab_widget)
    buttons_tab_outer.setLayout(buttons_tab_layout)
    top_tab_widget.addTab(buttons_tab_outer, "Buttons")

    def on_remove_button(button_index, button_conf):
        config.buttons.pop(button_index)
        refresh_button_tabs()

    def on_duplicate_button(button_index, button_conf):
        import copy

        new_button = copy.deepcopy(button_conf)
        config.buttons.append(new_button)
        refresh_button_tabs()

    def on_add_button():
        # Create a default new button
        new_btn = ButtonConfig(
            name="New Button",
            endpoint=Endpoint.BING,
            prompt="",
            icon="",
            label="",
            tip="",
            keys="",
        )
        config.buttons.append(new_btn)
        refresh_button_tabs()
        if buttons_tab_widget.count() > 1:
            buttons_tab_widget.setCurrentIndex(buttons_tab_widget.count() - 2)

    def refresh_button_tabs():
        while buttons_tab_widget.count() > 0:
            buttons_tab_widget.removeTab(0)

        for i, btn_conf in enumerate(config.buttons):
            panel = generate_button_config_panel(
                btn_conf,
                i,
                parent=dialog,
                on_remove=on_remove_button,
                on_duplicate=on_duplicate_button,
            )
            buttons_tab_widget.addTab(panel, f"Button {i+1}")

        plus_panel = QWidget()
        plus_index = buttons_tab_widget.addTab(plus_panel, "+")
        buttons_tab_widget.setCurrentIndex(0 if config.buttons else plus_index)

    def on_buttons_tab_clicked(idx):
        if idx == buttons_tab_widget.count() - 1:
            on_add_button()

    buttons_tab_widget.tabBarClicked.connect(on_buttons_tab_clicked)
    refresh_button_tabs()

    # -- Save/Cancel buttons --
    def save_config():
        # Update general fields
        for field_name, widget in general_widgets.items():
            setattr(config, field_name, get_value(widget))

        # Update each profile tab
        for i in range(profiles_tab_widget.count() - 1):
            tab_widget = profiles_tab_widget.widget(i)
            if hasattr(tab_widget, "fields_dict"):
                prof_conf = config.profiles[i]
                for k, w in tab_widget.fields_dict.items():
                    setattr(prof_conf, k, get_value(w))

        # Update each button tab
        for i in range(buttons_tab_widget.count() - 1):
            tab_widget = buttons_tab_widget.widget(i)
            if hasattr(tab_widget, "fields_dict"):
                button_conf = config.buttons[i]
                for k, w in tab_widget.fields_dict.items():
                    setattr(button_conf, k, get_value(w))

        print("Saving config...")
        config.save_to_conf()

    btn_layout = QHBoxLayout()
    ok_btn = QPushButton("OK")
    ok_btn.clicked.connect(lambda: (save_config(), dialog.accept()))
    cancel_btn = QPushButton("Cancel")
    cancel_btn.clicked.connect(lambda: (config.reset(), dialog.reject()))
    btn_layout.addWidget(ok_btn)
    btn_layout.addWidget(cancel_btn)
    main_layout.addLayout(btn_layout)

    dialog.resize(700, 500)
    dialog.exec()
