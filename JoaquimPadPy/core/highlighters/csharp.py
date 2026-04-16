from PySide6.QtCore import QRegularExpression
from core.highlighters.base import BaseHighlighter


class CSharpHighlighter(BaseHighlighter):
    language = "C#"

    KEYWORDS = [
        "class", "public", "private", "protected",
        "void", "int", "string", "bool",
        "using", "namespace", "return",
        "if", "else", "for", "while", "new"
    ]

    def __init__(self, document):
        super().__init__(document)
        self.keyword_format = self.format("#1a73e8", bold=True)
        self.string_format = self.format("#188038")
        self.comment_format = self.format("#5f6368")

    def highlightBlock(self, text):
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

        comment_expr = QRegularExpression(r"//.*")
        it = comment_expr.globalMatch(text)
        while it.hasNext():
            m = it.next()
            self.setFormat(
                m.capturedStart(),
                m.capturedLength(),
                self.comment_format
            )

        string_expr = QRegularExpression(r"\".*?\"")
        it = string_expr.globalMatch(text)
        while it.hasNext():
            m = it.next()
            self.setFormat(
                m.capturedStart(),
                m.capturedLength(),
                self.string_format
            )
