from PyQt6.Qsci import QsciScintilla, QsciLexerPython
from PyQt6.QtGui import QFont, QColor

class Editor(QsciScintilla):
    def __init__(self):
        super().__init__()

        self.setup_font()
        self.setup_editor()
        self.setup_lexer()

    def setup_font(self):
        font = QFont("Consolas", 11)
        font.setFixedPitch(True)
        self.setFont(font)
        self.setMarginsFont(font)

    def setup_editor(self):
        # Numeração de linhas
        self.setMarginType(0, QsciScintilla.MarginType.NumberMargin)
        self.setMarginWidth(0, "00000")
        self.setMarginsForegroundColor(QColor("#bbbbbb"))
        self.setMarginsBackgroundColor(QColor("#2b2b2b"))

        # Destaque da linha atual
        self.setCaretLineVisible(True)
        self.setCaretLineBackgroundColor(QColor("#333333"))

        # Autocomplete
        self.setAutoCompletionSource(
            QsciScintilla.AutoCompletionSource.AcsAll
        )
        self.setAutoCompletionThreshold(2)

        # Tabs
        self.setTabWidth(4)
        self.setIndentationGuides(True)

    def setup_lexer(self):
        lexer = QsciLexerPython()
        lexer.setDefaultFont(self.font())
        self.setLexer(lexer)

    def moveCursorToEnd(self):
        length = self.length()
        self.setCursorPosition(
            self.lineIndexFromPosition(length)[0],
            self.lineIndexFromPosition(length)[1]
        )
