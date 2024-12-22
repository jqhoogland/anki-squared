from __future__ import annotations
from collections.abc import Callable

from ankisquared.gui.config_dialog import generate_config_dialog
from aqt.editor import Editor
from aqt.utils import showWarning
from aqt.qt import (
    QDialog,
    QVBoxLayout,
    QListWidget,
    QListWidgetItem,
    QLabel,
    QDialog,
    QVBoxLayout,
    QListWidget,
    QListWidgetItem,
    QLabel,
    QHBoxLayout,
    QPushButton,
    QWidget,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QShortcut,
    QSizePolicy,
    QWidget,
    qconnect,
    QKeySequence,
)

from aqt import AnkiQt
from aqt.qt import sip

from aqt.utils import shortcut, tr

from ankisquared.config import ProfileConfig


class ProfileChooser(QHBoxLayout):
    def __init__(
        self,
        mw: AnkiQt,
        editor: Editor,
        widget: QWidget,
        label: bool = True,
        starting_profile: ProfileConfig | None = None,
        on_profile_changed: Callable[[ProfileConfig], None] | None = None,
    ) -> None:
        QHBoxLayout.__init__(self)
        self._widget = widget
        self.mw = mw
        self.editor = editor
        self._selected_profile = starting_profile

        self._setup_ui(show_label=label)
        self.on_profile_changed = on_profile_changed

    def _setup_ui(self, show_label: bool) -> None:
        self.setContentsMargins(0, 0, 0, 0)
        self.setSpacing(8)

        if show_label:
            self.profileLabel = QLabel("Profile:")
            self.addWidget(self.profileLabel)

        self.profile = QPushButton()
        qconnect(self.profile.clicked, self.choose_profile)
        self.profile.setAutoDefault(False)
        self.profile.setToolTip(shortcut("Choose profile (Ctrl+Shift+P)"))
        qconnect(
            QShortcut(QKeySequence("Ctrl+Shift+P"), self._widget).activated,
            self.choose_profile,
        )
        sizePolicy = QSizePolicy(QSizePolicy.Policy(7), QSizePolicy.Policy(0))
        self.profile.setSizePolicy(sizePolicy)
        self.addWidget(self.profile)

        self._widget.setLayout(self)
        self._update_button_label()

    def _update_button_label(self) -> None:
        if not sip.isdeleted(self.profile):
            name = (
                self._selected_profile.name if self._selected_profile else "No Profile"
            )
            self.profile.setText(name.replace("&", "&&"))

    def choose_profile(self) -> None:

        chosen_profile = choose_profile_dialog(self.editor)
        if chosen_profile and chosen_profile != self._selected_profile:
            self._selected_profile = chosen_profile
            self._update_button_label()
            if self.on_profile_changed:
                self.on_profile_changed(chosen_profile)

    @property
    def selected_profile(self) -> ProfileConfig | None:
        return self._selected_profile

    @selected_profile.setter
    def selected_profile(self, profile: ProfileConfig | None) -> None:
        if profile != self._selected_profile:
            self._selected_profile = profile
            self._update_button_label()
            if self.on_profile_changed:
                self.on_profile_changed(profile)

    def show(self) -> None:
        self._widget.show()

    def hide(self) -> None:
        self._widget.hide()


def choose_profile_dialog(editor):
    profiles = editor.config.profiles
    if not profiles:
        showWarning("No profiles configured!")
        return None

    dialog = QDialog(editor.parentWindow)
    dialog.setWindowTitle("Choose Profile")
    layout = QVBoxLayout(dialog)

    label = QLabel("Select a profile:")
    layout.addWidget(label)

    list_widget = QListWidget(dialog)
    for i, prof in enumerate(profiles):
        item = QListWidgetItem(prof.name)
        # Store index in item
        item.setData(0x0100, i)  # 0x0100 = Qt.UserRole
        list_widget.addItem(item)
    layout.addWidget(list_widget)

    # Create a horizontal layout for our own OK/Cancel buttons
    buttons_layout = QHBoxLayout()

    # Add Manage button
    manage_button = QPushButton("Manage")

    def on_manage():
        generate_config_dialog(editor.config)
        # Refresh the list widget with potentially updated profiles
        list_widget.clear()
        profiles = editor.config.profiles  # Get fresh profiles
        for i, prof in enumerate(profiles):
            item = QListWidgetItem(prof.name)
            item.setData(0x0100, i)
            list_widget.addItem(item)

    manage_button.clicked.connect(on_manage)
    buttons_layout.addWidget(manage_button)

    # Add existing OK/Cancel buttons
    ok_button = QPushButton("OK")
    cancel_button = QPushButton("Cancel")
    buttons_layout.addWidget(ok_button)
    buttons_layout.addWidget(cancel_button)
    layout.addLayout(buttons_layout)

    def on_ok():
        item = list_widget.currentItem()
        if not item:
            # If nothing is selected, consider it a "cancel"
            dialog.reject()
            return
        chosen_index = item.data(0x0100)
        dialog.done(chosen_index)

    def on_cancel():
        dialog.reject()

    ok_button.clicked.connect(on_ok)
    cancel_button.clicked.connect(on_cancel)

    # If OK is pressed, dialog.done(...) uses the item index as the return code
    result = dialog.exec()

    # If a valid index was returned, return that ProfileConfig
    if 0 <= result < len(profiles):
        return profiles[result]
    return None
