from PySide6.QtWidgets import QTextEdit
from PySide6.QtCore import Signal


class EditorWidget(QTextEdit):
    cursor_position_changed = Signal(int, int)
    text_modified = Signal(bool)

    def __init__(self):
        super().__init__()
        self.file_path = None

        self.is_pinned = False
        
        self.word_wrap_enabled = True
        self.setLineWrapMode(QTextEdit.WidgetWidth)

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
        
    def set_word_wrap(self, enabled: bool):
            self.word_wrap_enabled = enabled
            self.setLineWrapMode(
                QTextEdit.WidgetWidth if enabled else QTextEdit.NoWrap
            )
        
    def toggle_word_wrap(self, checked: bool):
        editor = self.tabs.current_editor()
        if not editor:
            return

        editor.set_word_wrap(checked)
