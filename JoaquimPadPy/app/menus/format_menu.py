from PyQt6.QtWidgets import QMenu
from PyQt6.QtGui import QAction, QActionGroup


class FormatMenu(QMenu):
    def __init__(self, editor_manager, parent=None):
        super().__init__("Formatar", parent)
        self.editor_manager = editor_manager
        self._create_actions()

    def _create_actions(self):
        action = QAction("Formatar documento", self)
        action.setShortcut("Ctrl+Shift+F")
        action.triggered.connect(self._format)

        self.addAction(action)

    def _format(self):
        editor = self.editor_manager.current_editor()
        if editor:
            editor.format_code()