
from PyQt6.QtWidgets import QMenu
from PyQt6.QtGui import QActionGroup
from app.editors.language_registry import LANGUAGES


class LanguageMenu(QMenu):
    def __init__(self, editor_manager, parent=None):
        super().__init__("Linguagem", parent)
        self.editor_manager = editor_manager
        self._create_actions()

    def _create_actions(self):
        group = QActionGroup(self)
        group.setExclusive(True)

        for language in LANGUAGES.keys():
            action = self.addAction(language)
            action.setCheckable(True)
            group.addAction(action)

            action.triggered.connect(
                lambda checked, lang=language: self._set_language(lang)
            )

        self.actions()[0].setChecked(True)

    def _set_language(self, language: str):
        editor = self.editor_manager.current_editor()
        if editor:
            editor.set_language(language)