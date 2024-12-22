from __future__ import annotations

from collections.abc import Callable

from aqt import AnkiQt, gui_hooks
from aqt.qt import (
    QHBoxLayout,
    QLabel,
    QPushButton,
    QShortcut,
    QSizePolicy,
    QWidget,
    qconnect,
    QKeySequence,
)
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
        from ankisquared.gui.editor_menu import choose_profile_dialog

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
