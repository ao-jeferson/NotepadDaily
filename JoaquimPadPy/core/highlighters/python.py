from PySide6.QtCore import QRegularExpression
from core.highlighters.base import BaseHighlighter


class PythonHighlighter(BaseHighlighter):
    language = "Python"

    KEYWORDS = [
        "def", "class", "return", "if", "else", "elif",
        "for", "while", "try", "except", "import", "from",
        "as", "pass", "break", "continue", "with"
    ]

    def __init__(self, document):
        super().__init__(document)
        self.keyword_format = self.format("#1a73e8", bold=True)
        self.string_format = self.format("#188038")
        self.comment_format = self.format("#5f6368")

    def highlightBlock(self, text):
        for kw in self.KEYWORDS:
            expr = QRegularExpression(rf"\\b{kw}\\b")
            for match in expr.globalMatch(text):
                self.setFormat(match.capturedStart(), match.capturedLength(), self.keyword_format)

        for match in QRegularExpression(r"#.*").globalMatch(text):
            self.setFormat(match.capturedStart(), match.capturedLength(), self.comment_format)

        for match in QRegularExpression(r"(['\"]).*?\\1").globalMatch(text):
            self.setFormat(match.capturedStart(), match.capturedLength(), self.string_format)