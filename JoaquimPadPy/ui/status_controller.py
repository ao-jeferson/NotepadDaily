from PySide6.QtCore import QObject
import shiboken6


class StatusController(QObject):
    def __init__(self, status_bar):
        super().__init__()
        self.status_bar = status_bar
        self.editor = None

    # ============================
    def connect_editor(self, editor):
        # 🔒 Desconecta editor anterior com segurança
        if self.editor is not None and shiboken6.isValid(self.editor):
            try:
                self.editor.cursorPositionChanged.disconnect(self.update_cursor_position)
                self.editor.textChanged.disconnect(self.update_file_size)
                self.editor.selectionChanged.disconnect(self.update_selection_size)
            except (TypeError, RuntimeError):
                pass

        self.editor = editor

        # ✅ Conexões explícitas
        editor.cursorPositionChanged.connect(self.update_cursor_position)
        editor.textChanged.connect(self.update_file_size)
        editor.selectionChanged.connect(self.update_selection_size)

        # ✅ Se o editor for destruído, limpamos a referência
        editor.destroyed.connect(self.on_editor_destroyed)

        self.update_all()

    def on_editor_destroyed(self):
        self.editor = None

    # ============================
    def update_all(self):
        self.update_cursor_position()
        self.update_file_size()
        self.update_selection_size()

    def update_cursor_position(self):
        if not self._can_update():
            return

        cursor = self.editor.textCursor()
        line = cursor.blockNumber() + 1
        column = cursor.columnNumber() + 1
        self.status_bar.set_cursor_position(line, column)

    def update_file_size(self):
        if not self._can_update():
            return

        text = self.editor.toPlainText()
        size_bytes = len(text.encode("utf-8"))
        size_kb = size_bytes / 1024
        self.status_bar.set_file_size_kb(size_kb)

    def update_selection_size(self):
        if not self._can_update():
            return

        cursor = self.editor.textCursor()
        selected_chars = len(cursor.selectedText())
        self.status_bar.set_selection_size(selected_chars)

    # ============================
    def _can_update(self):
        return (
            self.editor is not None
            and shiboken6.isValid(self.editor)
            and shiboken6.isValid(self.status_bar)
        )
