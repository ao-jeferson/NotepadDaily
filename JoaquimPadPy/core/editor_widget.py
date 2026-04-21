
from PySide6.QtWidgets import QTextEdit
from PySide6.QtCore import Signal
from PySide6.QtGui import QKeySequence, QShortcut
# ============================
# Formatters
# ============================
from core.formatters.registry import discover_formatters
from core.highlighters.registry import discover_highlighters

# =====================================================
# Registro de Formatters
# =====================================================
FORMATTERS = discover_formatters() 
HIGHLIGHTERS = discover_highlighters()
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

    
    # ==================================================
    # Linguagem / Formatter / Highlighter
    # ==================================================
    
    def register_formatter(cls):
        FORMATTERS[cls.language] = cls()
        return cls
   
   
    def set_language(self, language: str):
        self.language = language

        # remove highlighter atual
        if self._highlighter:
            self._highlighter.setParent(None)
            self._highlighter = None

        # aplica novo highlighter
        highlighter_cls = HIGHLIGHTERS.get(language)
        if highlighter_cls:
            self._highlighter = highlighter_cls(self.document())

    # ==================================================
    # Formatter
    # ==================================================
    def format_document(self):
        formatter = FORMATTERS.get(self.language)
        if not formatter:
            return

        cursor = self.textCursor()
        position = cursor.position()

        try:
            original = self.toPlainText()
            formatted = formatter.format(original)

            # evita alterações desnecessárias
            if formatted == original:
                return

            self.setPlainText(formatted)

            # restaura cursor
            cursor = self.textCursor()
            cursor.setPosition(min(position, len(formatted)))
            self.setTextCursor(cursor)

        except Exception:
            # formatter NUNCA pode quebrar o editor
            pass

    
    # ==================================================
    # Cursor
    # ==================================================
    def _emit_cursor_position(self):
        cursor = self.textCursor()
        line = cursor.blockNumber() + 1
        column = cursor.columnNumber() + 1
        self.cursor_position_changed.emit(line, column)

    # ==================================================
    # Word Wrap
    # ==================================================
    def set_word_wrap(self, enabled: bool):
        self.word_wrap_enabled = enabled
        self.setLineWrapMode(
            QTextEdit.WidgetWidth if enabled else QTextEdit.NoWrap
        )
