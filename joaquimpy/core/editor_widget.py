from PySide6.QtWidgets import QWidget, QVBoxLayout
from PySide6.QtGui import QFont
from PySide6.QtCore import Signal

from PySide6.QtScintilla import (
    QsciScintilla,
    QsciLexerPython,
    QsciLexerJSON,
    QsciLexerJavaScript,
    QsciLexerCSharp,
    QsciLexerSQL,
    QsciLexerHTML,
    QsciLexerMarkdown,
)

# ============================
# Linguagem → Lexer
# ============================
LEXERS = {
    "Python": QsciLexerPython,
    "JSON": QsciLexerJSON,
    "JavaScript": QsciLexerJavaScript,
    "C#": QsciLexerCSharp,
    "SQL": QsciLexerSQL,
    "HTML": QsciLexerHTML,
    "Markdown": QsciLexerMarkdown,
    "Plain Text": None,
}


class EditorWidget(QWidget):
    cursor_position_changed = Signal(int, int)

    def __init__(self):
        super().__init__()

        self.file_path = None
        self.is_pinned = False
        self.language = "Plain Text"

        self.editor = QsciScintilla()
        self._setup_editor()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(self.editor)

        self.editor.cursorPositionChanged.connect(self._emit_cursor)

        self.set_language(self.language)

    # ============================
    # Configuração base
    # ============================
    def _setup_editor(self):
        font = QFont("Consolas", 11)
        self.editor.setFont(font)
        self.editor.setMarginsFont(font)

        self.editor.setMarginWidth(0, "00000")
        self.editor.setBraceMatching(QsciScintilla.SloppyBraceMatch)
        self.editor.setAutoIndent(True)
        self.editor.setIndentationWidth(4)
        self.editor.setTabWidth(4)
        self.editor.setIndentationsUseTabs(False)

    # ============================
    # Linguagem / Lexer
    # ============================
    def set_language(self, language: str):
        self.language = language
        lexer_cls = LEXERS.get(language)

        if lexer_cls:
            lexer = lexer_cls()
            lexer.setFont(QFont("Consolas", 11))
            self.editor.setLexer(lexer)
        else:
            self.editor.setLexer(None)

    # ============================
    # Texto
    # ============================
    def setPlainText(self, text: str):
        self.editor.setText(text)

    def toPlainText(self) -> str:
        return self.editor.text()

    # ============================
    # Formatter (opcional)
    # ============================
    def format_document(self):
        # você pode conectar seus formatters aqui depois
        pass

    # ============================
    # Cursor
    # ============================
    def _emit_cursor(self, line, index):
        self.cursor_position_changed.emit(line + 1, index + 1)