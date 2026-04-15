from PySide6.QtCore import QRegularExpression
from core.highlighters.base import BaseHighlighter


class JavaScriptHighlighter(BaseHighlighter):
    language = "JavaScript"

    KEYWORDS = [
        "function", "const", "let", "var",
        "return", "if", "else", "for", "while",
        "import", "from", "export", "class", "new"
    ]

    def __init__(self, document):
        super().__init__(document)
        self.keyword_format = self.format("#1a73e8", bold=True)
        self.string_format = self.format("#188038")
        self.comment_format = self.format("#5f6368")

    def highlightBlock(self, text):
        for kw in self.KEYWORDS:
            expr = QRegularExpression(rf"\\b{kw}\\b")
            for m in expr.globalMatch(text):
                self.setFormat(m.capturedStart(), m.capturedLength(), self.keyword_format)

        for m in QRegularExpression(r"//.*").globalMatch(text):
            self.setFormat(m.capturedStart(), m.capturedLength(), self.comment_format)

        for m in QRegularExpression(r"(['\"]).*?\\1").globalMatch(text):
            self.setFormat(m.capturedStart(), m.capturedLength(), self.string_format)