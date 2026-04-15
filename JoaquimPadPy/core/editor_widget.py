from PySide6.QtWidgets import QTextEdit
from PySide6.QtCore import Signal

from core.highlighters.plaintext import PlainTextHighlighter
from core.highlighters.python import PythonHighlighter
from core.highlighters.csharp import CSharpHighlighter
from core.highlighters.javascript import JavaScriptHighlighter

from core.formatters.python import PythonFormatter
from core.formatters.json import JsonFormatter
from core.formatters.csharp import CSharpFormatter


# ============================
# Registro de Highlighters
# ============================
HIGHLIGHTERS = {
    "Plain Text": PlainTextHighlighter,
    "Python": PythonHighlighter,
    "C#": CSharpHighlighter,
    "JavaScript": JavaScriptHighlighter,
}

# ============================
# Registro de Formatters
# ============================
FORMATTERS = {
    "Python": PythonFormatter(),
    "JSON": JsonFormatter(),
    "C#": CSharpFormatter(),
}


class EditorWidget(QTextEdit):
    """
    Editor de texto de uma aba.

    Responsável APENAS por:
    - conteúdo
    - linguagem
    - syntax highlight
    - formatação
    - posição do cursor
    """

    # linha, coluna
    cursor_position_changed = Signal(int, int)

    def __init__(self):
        super().__init__()

        self.file_path = None
        self.is_pinned = False

        self.language = "Plain Text"
        self._highlighter = None

        # Word wrap
        self.word_wrap_enabled = True
        self.setLineWrapMode(QTextEdit.WidgetWidth)

        # Linguagem inicial
        self.set_language(self.language)

        # Cursor
        self.cursorPositionChanged.connect(self._emit_cursor_position)

    # ============================
    # Linguagem / Highlight
    # ============================
    def set_language(self, language: str):
        self.language = language

        if self._highlighter:
            self._highlighter.setParent(None)
            self._highlighter = None

        highlighter_cls = HIGHLIGHTERS.get(language)
        if highlighter_cls:
            self._highlighter = highlighter_cls(self.document())

    # ============================
    # Formatter
    # ============================
    def format_document(self):
        formatter = FORMATTERS.get(self.language)
        if not formatter:
            return

        try:
            formatted = formatter.format(self.toPlainText())
            self.setPlainText(formatted)
        except Exception:
            # nunca quebra o editor
            pass

    # ============================
    # Cursor
    # ============================
    def _emit_cursor_position(self):
        cursor = self.textCursor()
        line = cursor.blockNumber() + 1
        column = cursor.columnNumber() + 1
        self.cursor_position_changed.emit(line, column)

    # ============================
    # Word Wrap
    # ============================
    def set_word_wrap(self, enabled: bool):
        self.word_wrap_enabled = enabled
        self.setLineWrapMode(
            QTextEdit.WidgetWidth if enabled else QTextEdit.NoWrap
        )