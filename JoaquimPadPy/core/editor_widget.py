from PySide6.QtWidgets import QTextEdit
from PySide6.QtCore import Signal


class EditorWidget(QTextEdit):
    cursor_position_changed = Signal(int, int)
    text_modified = Signal(bool)

    def __init__(self):
        super().__init__()
        self.file_path = None

        self.is_pinned = False
        self.cursorPositionChanged.connect(self.emit_cursor_position)
        self.textChanged.connect(self.emit_modified)

        self.document().setModified(False)

    def emit_cursor_position(self):
        cursor = self.textCursor()
        line = cursor.blockNumber() + 1
        column = cursor.columnNumber() + 1
        self.cursor_position_changed.emit(line, column)

    def emit_modified(self):
        self.text_modified.emit(self.document().isModified())