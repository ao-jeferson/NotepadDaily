from PySide6.QtCore import QRegularExpression
from PySide6.QtGui import QTextCharFormat, QColor

from core.highlighters.base import BaseHighlighter


class PythonHighlighter(BaseHighlighter):
    language = "Python"

    KEYWORDS = [
        "def", "class", "return", "if", "else", "elif",
        "for", "while", "try", "except", "import", "from",
        "as", "pass", "break", "continue", "with",
    ]

    def __init__(self, document):
        super().__init__(document)

        self.keyword_format = self._fmt("#1a73e8", bold=True)
        self.string_format = self._fmt("#188038")
        self.comment_format = self._fmt("#5f6368")  # ✅ EXISTE AGORA

    def _fmt(self, color, bold=False):
        fmt = QTextCharFormat()
        fmt.setForeground(QColor(color))
        if bold:
            fmt.setFontWeight(QTextCharFormat.Bold)
        return fmt

    def highlightBlock(self, text):
        # Keywords
        for kw in self.KEYWORDS:
            expr = QRegularExpression(rf"\b{kw}\b")
            it = expr.globalMatch(text)
            while it.hasNext():
                m = it.next()
                self.setFormat(
                    m.capturedStart(),
                    m.capturedLength(),
                    self.keyword_format
                )

        # Comments
        comment_expr = QRegularExpression(r"#.*")
        it = comment_expr.globalMatch(text)
        while it.hasNext():
            m = it.next()
            self.setFormat(
                m.capturedStart(),
                m.capturedLength(),
                self.comment_format
            )

        # Strings
        string_expr = QRegularExpression(r"(['\"]).*?\1")
        it = string_expr.globalMatch(text)
        while it.hasNext():
            m = it.next()
            self.setFormat(
                m.capturedStart(),
                m.capturedLength(),
                self.string_format
            )